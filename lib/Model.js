module.exports = {

    constructor( data, opts={} ) {
        Object.assign( this, { store: { }, data }, opts )

        if( this.storeBy ) {
            this.storeBy.forEach( key => this.store[ key ] = { } )
            this._store()
        }

        return this
    },

    _store() {
        this.data.forEach( datum => this.storeBy.forEach( attr => this._storeAttr( datum, attr ) ) )
    },

    _storeAttr( datum, attr ) {
        this.store[ attr ][ datum[ attr ] ] =
            this.store[ attr ][ datum[ attr ] ]
                ? Array.isArray( this.store[ attr ][ datum[ attr ] ] )
                    ? this.store[ attr ][ datum[ attr ] ].concat( datum )
                    :[ this.store[ attr ][ datum[ attr ] ], datum ]
                : datum
    }

}
