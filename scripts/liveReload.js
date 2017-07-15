#!/usr/bin/env node

var fs = require('fs'),
    server

require('node-env-file')( `${__dirname}/../.env` )

server = require('livereload').createServer( {
    delay: 500,
    exts: [ 'gz' ],
    ignoreExts: [ 'js', 'css' ],
    originalPath: `http://${process.env.DOMAIN}.com:${process.env.HTTP_PORT}`
} )

server.watch( `${__dirname}/../static` )
