const fs = require('fs')

require('node-env-file')( __dirname + '/.env' )
      
const router = require('./router'),
    port =  process.env.HTTP_PORT

router.initialize().then( () => {
    console.log('Router initialized')
    require('http')
        .createServer(
            router.handler.bind(router)
        ).listen( port )
    return Promise.resolve( console.log( `Server spinning at port ${port}` ) )
} )
.catch( e => {
    console.log( e.stack || e )
    process.exit(1)
} )
