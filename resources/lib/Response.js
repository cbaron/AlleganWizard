module.exports = Object.create( {

    apply( resource, rows ) { return this[ resource.request.method ]( resource, rows ) },

    DELETE( resource, rows ) { return resource.respond( rows[0].id ) },

    GET( resource, rows ) {
        return resource.respond( { body: ( resource.path.length > 2 ) ? ( ( rows.length ) ? rows[0] : { } ) : rows } )
    },

    PATCH( resource, rows ) { resource.respond( { body: rows[0] } ) },

    POST( resource, rows ) { resource.respond( { body: rows[0] } ) }
}, { } )
