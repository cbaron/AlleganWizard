module.exports = Object.create( Object.assign( {}, require('../lib/MyObject'), {

    Enum: require('../lib/Enum'),
    
    Model: require('../lib/Model'),

    initialize() {
        return this.getTableData()
    },

    query( query, args, opts = { } ) {
        return this._factory( opts ).query( query, args )
    },

    columnToVar( columns, opts={} ) {
        const baseIndex = opts.baseIndex || 1,
            join = opts.join || ', ',
            alias = opts.alias ? `"${opts.alias}".` : ``
        return columns.length
            ? columns.map( ( key, i ) => `${alias}"${key}" = $${ i + baseIndex }` ).join( join ) 
            : ''
    },

    getValue( column, data ) {
        //TODO: validate?
        return column.range === 'Geography'
            ? [ data[0], data[1] ]
            : data
    },

    getVar( column, data, index ) {
        const vars = column.range === 'Geography'
            ? `ST_Makepoint( $${index++}, $${index++} )`
            : column.range === 'Array' || ( column.isEnum && Array.isArray( column.range ) )
                ? `ARRAY[ ` + data.map( datum => `$${index++}` ).join(', ') + ` ]`
                : `$${index++}`
        return { vars, index }
    },

    getVarsValues( table, data, keys, opts={} ) {
        const tableModel = this.tables[ table ].model
        let index = opts.baseIndex || 1

        return keys.reduce( ( memo, key ) => {
            const column = tableModel.store.name[ key ],
                datum = data[ key ],
                varResult = this.getVar( column, datum, index )

            index = varResult.index
            memo.vars = memo.vars.concat( varResult.vars )
            memo.vals = memo.vals.concat( this.getValue( column, datum ) )

            return memo
        }, { vars: [ ], vals: [ ] } )
    },

    wrap( something ) { return `"${something}"` },

    insert( name, data, opts={} ) {
        const keys = Object.keys( data ),
            columns = keys.map( this.wrap ).join(', '),
            nullColumns = this.tables[ name ].columns.filter( column => !columns.includes( column.name ) ).map( column => column.name ),
            nullColumnsStr = nullColumns.length ? `, ${nullColumns.map( this.wrap ).join(', ')}` : '',
            nullVals = nullColumns.length ? `, ${nullColumns.map( column => `NULL` ).join(', ')}` : '',
            queryData = this.getVarsValues( name, data, keys )
        
        let upsert = ``,
            upsertVals = [ ]
            
        if( opts.upsert ) {
            const upsertKeys = Object.keys( opts.upsert ),
                whereClause = `WHERE ${this.columnToVar( upsertKeys, { alias: name, baseIndex: queryData.vals.length + 1, join: ' AND ' } )}`

            upsert = `ON CONFLICT ( ${upsertKeys.map( key => `"${key}"` ).join(', ')} ) DO UPDATE SET ( ${columns}${nullColumnsStr} ) = ( ${queryData.vars.join(', ')}${nullVals} ) ${whereClause} `
            upsertVals = upsertKeys.map( key => opts.upsert[ key ] )
        }

        return this._factory().query( `INSERT INTO ${name} ( ${columns} ) VALUES ( ${ queryData.vars.join(', ') } ) ${upsert} RETURNING ${this._getSimpleSelect(name)}`, queryData.vals.concat( upsertVals ) )
    },

    select( name, where = { }, opts = { } ) {
        const keys = Object.keys( where ),
            whereClause = keys.length ? `WHERE ${this.columnToVar( keys, { join: ' AND ' } )}` : ``

        return this._factory( opts ).query( `SELECT * FROM ${name} ${whereClause}`, keys.map( key => where[key] ) )
    },

    update( name, patch, where ) {
        const patchKeys = Object.keys( patch ),
            whereKeys = Object.keys( where ),
            allKeys = patchKeys.concat( whereKeys )

        this.validateKeys( name, allKeys )

        return this._factory().query(
            `UPDATE ${name} SET ${ this.columnToVar( patchKeys ) } WHERE ${ this.columnToVar( whereKeys, { baseIndex: patchKeys.length + 1 } ) }`,
            allKeys.map( ( key, i ) => i < patchKeys.length ? patch[ key ] : where[ key ] )
        )
    },

    validateKeys( table, columns ) {
        columns.forEach( column => {
            if( !this.tables[ table ].model.store.name[ column ] ) throw Error(`Invalid Column: ${column}`)
        } )
    },

    truncate( omit=[] ) {
        return this.query( `TRUNCATE ` + this.tableNames.filter( table => !omit.includes(table) ).map( table => `"${table}"` ).join(', ') )
    },

    getColumnDescription( table, column ) {
        const isEnum = ( this.enumReference && this.enumReference[ table.table_name ] && this.enumReference[ table.table_name ][ column.column_name ] ) ? true : false,
              range = isEnum
                ? this.enumReference[ table.table_name ][ column.column_name ]
                : this.dataTypeToRange[column.data_type]
        return {
            isEnum,
            isNullable: column.is_nullable,
            maximumCharacterLength: column.data_type === "text" ? 1000 : column.character_maximum_length,
            name: column.column_name,
            range
        }
    }, 

    getSelectList( table, opts={} ) {
        return typeof table === 'string'
            ? this._getSelect( table, opts.alias ? opts.alias : table )
            : table.map( t => this._getSelect( t, opts.alias ? opts.alias[ t ] : t ) ).join(', ')
    },

    _getSelect( table, alias ) {
        return this.tables[ table ].columns.map( column => `"${alias}"."${column.name}" as "${alias}.${column.name}"` ).join(', ')
    },

    _getSimpleSelect( table ) { return this.tables[ table ].columns.map( column => `"${column.name}"` ).join(', ') },

    getTableData() {
        return this.query( this._queries.selectAllTables() )
        .then( result =>
            Promise.all( result.map( row =>
                this.query( this._queries.selectTableColumns( row.table_name ) )
                .then( columnResult =>
                    Promise.resolve(
                        this.tables[ row.table_name ] = { columns: columnResult.map( columnRow => this.getColumnDescription( row, columnRow ) ) }
                    )
                )
            ) )
        )
        .then( () =>
            this.query( this._queries.selectForeignKeys() )
            .then( result =>
                Promise.resolve(
                    result.forEach( row => {
                        const match = /FOREIGN KEY \("?(\w+)"?\) REFERENCES (\w+)\((\w+)\)/.exec( row.pg_get_constraintdef )
                        let column = this.tables[ row.tablefrom.replace(/"/g,'') ].columns.find( column => column.name === match[1] )
                        
                        column.fk = {
                            table: match[2],
                            column: match[3],
                            recordType: ( this.tables[ match[2] ].meta ) ? this.tables[ match[2] ].meta.recordType : null
                        }
                    } )
                )
            )
        )
        .then( () => {
            this.tableNames = Object.keys( this.tables )
            this.tableNames.forEach( tableName => {
                const table = this.tables[ tableName ]
                table.model = Object.create( this.Model, { } ).constructor( table.columns, { storeBy: [ 'name' ] } ) 
            } )
            return Promise.resolve()
        } )
    },

    _factory( data ) {
        return Object.create( {
            connect() {
                return new Promise( ( resolve, reject ) => {
                    this.pool.connect( ( err, client, done ) => {
                        if( err ) return reject( err )

                        this.client = client
                        this.done = done
                     
                        resolve()
                    } )
                } )
            },

            query( query, args ) {
                return this.connect().then( () =>
                    new Promise( ( resolve, reject ) => {
                        this.client.query( query, args, ( err, result ) => {
                            this.done()

                            if( err ) { console.log( query, args ); return reject( err ) }

                            resolve( result.rows )
                        } )
                    } )
                )
            },
        }, { pool: { value: this.pool } } )
    },

    _queries: {

        selectAllTables() { return [
           "SELECT table_name",
           "FROM information_schema.tables",
           "WHERE table_schema='public'",
           "AND table_type='BASE TABLE';"
        ].join(' ') },

        selectForeignKeys() { return [
            "SELECT conrelid::regclass AS tableFrom, conname, pg_get_constraintdef(c.oid)",
            "FROM pg_constraint c",
            "JOIN pg_namespace n ON n.oid = c.connamespace",
            "WHERE contype = 'f' AND n.nspname = 'public';"
        ].join(' ') },

        selectTableColumns( tableName ) {
            return [
                'SELECT column_name, data_type, is_nullable, character_maximum_length',
                'FROM information_schema.columns',
                `WHERE table_name = '${tableName}'`
            ].join(' ')
        },

    },

    dataTypeToRange: {
        "bigint": "Integer",
        "boolean": "Boolean",
        "character varying": "Text",
        "date": "Date",
        "integer": "Integer",
        "money": "Float",
        "numeric": "Float",
        "real": "Float",
        "timestamp with time zone": "DateTime",
        "text": "Text"
    },

    enumReference: {
        account: {
            gender: 'Gender',
            offspring: "OffspringStatus",
            relstatus: "RelationshipStatus",
            intent: "Intent",
            sexuality: "Sexuality",
            ethnicity: "Ethnicity",
            ethnicity_2: "Ethnicity",
            religion: "Religion",
            religiousness: "Religiousness",
            smoking: "Frequency",
            drugs: "Frequency",
            alcohol: "Frequency",
            education: "EducationLevel"
        },
        accountLocation: {
            location: "Geography"
        },
        matchfilters: {
            intent: [ 'Intent' ],
            offspring: [ 'OffspringStatus' ],
            ethnicity: [ 'Ethnicity' ],
            religion: [ 'Religion' ],
            religiousness: [ 'Religiousness' ],
            smoking: [ 'Frequency' ],
            alcohol: [ 'Frequency' ],
            sexuality: [ 'Sexuality' ],
            drugs: [ 'Frequency' ],
            edu: [ 'EducationLevel' ]
        },
    }
} ), {
    pool: { value: new (require('pg')).Pool() },
    tables: { value: { } }
} )
