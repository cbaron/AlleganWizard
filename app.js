const fs = require('fs')

require('node-env-file')( __dirname + '/.env' )
      
const router = require('./router'),
    httpsPort = process.env.HTTPS_PORT || 443

//Promise.all( [ router.resourcePromise, router.collectionPromise ] ).then( () => {
router.initialize().then( () => {
    console.log('Router initialized')
    require('https')
        .createServer(
            { key: fs.readFileSync( process.env.SSLKEY ), cert: fs.readFileSync( process.env.SSLCERT ) },
            router.handler.bind(router)
        ).listen( httpsPort )
    return Promise.resolve( console.log( `Secure server spinning at port ${httpsPort}` ) )
} )
.catch( e => {
    console.log( e.stack || e )
    process.exit(1)
} )
