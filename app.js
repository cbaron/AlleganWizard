const fs = require('fs')

require('node-env-file')( __dirname + '/.env' )
      
const router = require('./router')

Promise.all( [ router.resourcePromise, router.collectionPromise ] ).then( () => {
    console.log('Router initialized')
    require('https')
        .createServer( { key: fs.readFileSync( process.env.SSLKEY ), cert: fs.readFileSync( process.env.SSLCERT ) }, router.handler.bind(router) )
        .listen( process.env.PORT )
    return Promise.resolve( console.log( `Secure server spinning at port ${process.env.PORT}` ) )
} )
.catch( e => {
    console.log( e.stack || e )
    process.exit(1)
} )
