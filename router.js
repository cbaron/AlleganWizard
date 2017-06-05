module.exports = Object.create( Object.assign( {}, require('./lib/MyObject'), {

    Fs: require('fs'),

    Path: require('path'),
    
    Postgres: require('./dal/Postgres'),

    handler( request, response ) {
        let path = request.url.split('/').slice(1)
            lastPath = path[ path.length - 1 ],
            queryIndex = lastPath.indexOf('?'),
            qs = ''

        if( queryIndex !== -1 ) {
            qs = lastPath.slice( queryIndex + 1 )
            path[ path.length - 1 ] = lastPath.slice( 0, queryIndex )
        }

        request.setEncoding('utf8');

        ( path[0] === "static" || /favicon/.test( path.join('') )
            ? this.static( request, response, path )
            : ( /application\/json/.test( request.headers.accept ) )
                ? this.rest( request, response, path, qs )
                : this.html( request, response )
        )
        .catch( e => {
            if( e.message !== "Handled" ) {
                this.Error(e)
                response.writeHead( 500, { 'Content-Length': 0, 'Content-Type': 'text/plain' } )
                response.end()
            }
        } )
    },

    html( request, response ) {
        response.writeHead( 200 )
        response.end( require('./templates/page')( { isDev: this.isDev, title: process.env.NAME } ) )
        return Promise.resolve()
    },

    initialize() {

        this.jsonRoutes = { person: 'person' }

        return Promise.all( [
            this.Postgres.initialize(),
            this.P( this.Fs.readdir, [ `${__dirname}/resources` ] )
        ] )
        .then( ( [ a, [ files ] ] ) => {
            const fileHash =
                files.filter( name => !/^[\._]/.test(name) && /\.js/.test(name) )
                .reduce( ( memo, name ) => Object.assign( memo, { [name.replace('.js','')]: true } ), { } )
            
            return Promise.resolve( this.Postgres.tableNames.forEach( table => this.jsonRoutes[ table ] = fileHash[ table ] ? table : '__proto__' ) )
        } )
    },

    rest( request, response, path, qs ) {
        const file = this.jsonRoutes[ path[0] ]

        if( !file ) {
            response.writeHead( 404, { 'Content-Length': 0, 'Content-Type': 'text/plain' } )
            response.end()
        }

        return Object.create( require(`./resources/${file}`), {
            request: { value: request },
            response: { value: response },
            path: { value: path },
            qs: { value: qs },
        } ).apply( request.method )
    },

    static( request, response, path ) {
        var fileName = path.pop(),
            filePath = `${__dirname}/${path.join('/')}/${fileName}`,
            ext = this.Path.extname( filePath )

        return this.P( this.Fs.stat, [ filePath ] )
        .then( ( [ stat ] ) => new Promise( ( resolve, reject ) => {
            
            var stream = this.Fs.createReadStream( filePath )
            
            response.on( 'error', e => { stream.end(); reject(e) } )
            stream.on( 'error', reject )
            stream.on( 'end', () => {
                response.end();
                resolve()
            } )

            response.writeHead(
                200,
                {
                    'Cache-Control': `max-age=600`,
                    'Connection': 'keep-alive',
                    'Content-Encoding': ext === ".gz" ? 'gzip' : 'identity',
                    'Content-Length': stat.size,
                    'Content-Type':
                        /\.css/.test(fileName)
                            ? 'text/css'
                            : ext === '.svg'
                                ? 'image/svg+xml'
                                : 'text/plain'
                }
            )
            stream.pipe( response, { end: false } )
        } ) )
    }

} ), { isDev: { value: process.env.NODE_ENV === 'development' } } )
