
const router = require('./router'),
    onLoad = new Promise( resolve => window.onload = () => resolve() )

require('./polyfill')

onLoad.then( () => router.initialize() )
.catch( e => console.log( `Error initializing client -> ${e.stack || e}` ) )
