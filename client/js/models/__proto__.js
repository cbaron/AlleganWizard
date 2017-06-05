module.exports = Object.assign( { }, require('../../../lib/MyObject'), require('../../../lib/Model'), require('events').EventEmitter.prototype, {

    Xhr: require('../Xhr'),

    delete( id ) {
        return this.Xhr( { method: 'DELETE', resource: this.resource, id } )
        .then( id => {
            const datum = this.data.find( datum => datum.id == id )

            if( this.store ) {
                Object.keys( this.store ).forEach( attr => {
                    this.store[ attr ][ datum[ attr ] ] = this.store[ attr ][ datum[ attr ] ].filter( datum => datum.id != id )
                    if( this.store[ attr ][ datum[ attr ] ].length === 0 ) { this.store[ attr ][ datum[ attr ] ] = undefined }
                } )
            }

            this.data = this.data.filter( datum => datum.id != id )
            if( this.ids ) delete this.ids[id]

            return Promise.resolve(id)
        } )
    },

    get( opts={ query:{} } ) {
        if( opts.query || this.pagination ) Object.assign( opts.query, this.pagination )

        return this.Xhr( { method: opts.method || 'get', resource: this.resource, headers: this.headers || {}, qs: opts.query ? JSON.stringify( opts.query ) : undefined } )
        .then( response => {

            if( opts.storeBy ) {
                this.store = { }
                opts.storeBy.forEach( attr => this.store[ attr ] = { } )
            }

            this.data = this.parse
                ? this.parse( response, opts.storeBy )
                : opts.storeBy
                    ? this.storeBy( response )
                    : response

            this.emit('got')

            return Promise.resolve(this.data)
        } )
    },

    patch( id, data ) {
        return this.Xhr( { method: 'patch', id, resource: this.resource, headers: this.headers || {}, data: JSON.stringify( data ) } )
        .then( response => {
            this.data = this.data ? this.data.concat( response ) : [ response ]

            if( this.store ) Object.keys( this.store ).forEach( attr => this._store( response, attr ) )

            return Promise.resolve( response )
        } )
    },

    post( model ) {
        return this.Xhr( { method: 'post', resource: this.resource, headers: this.headers || {}, data: JSON.stringify( model ) } )
        .then( response => {
            this.data = this.data ? this.data.concat( response ) : [ response ]

            if( this.store ) Object.keys( this.store ).forEach( attr => this._store( response, attr ) )

            return Promise.resolve( response )
        } )
    },

    /*
    storeBy( data ) {

        data.forEach( datum => Object.keys( this.store ).forEach( attr => this._store( datum, attr ) ) )

        return data
    },

    _store( datum, attr ) {
        if( !this.store[ attr ][ datum[ attr ] ] ) this.store[ attr ][ datum[ attr ] ] = [ ]
        this.store[ attr ][ datum[ attr ] ].push( datum )
    }
    */

} )
