module.exports = Object.create( {

    Error: require('../../lib/MyError'),
    
    ViewFactory: require('./factory/View'),
    
    Views: require('./.ViewMap'),

    Toast: require('./views/Toast'),

    capitalizeFirstLetter: string => string.charAt(0).toUpperCase() + string.slice(1),

    initialize() {

        this.contentContainer = document.querySelector('#content')

        this.Toast.constructor()

        window.onpopstate = this.handle.bind(this)

        this.header =
            this.ViewFactory.create(
                'header',
                { insertion: { value: { el: this.contentContainer, method: 'insertBefore' } } }
            )
            .on( 'navigate', route => this.navigate( route ) )

        this.footer =
            this.ViewFactory.create(
                'footer',
                { insertion: { value: { el: this.contentContainer, method: 'after' } } }
            )

        this.handle()
    },

    handle() {
        this.handler( window.location.pathname.split('/').slice(1) )
    },

    handler( path ) {
        const view = this.Views[ this.capitalizeFirstLetter( path[0] ) ] ? path[0] : 'home'

        if( view === this.currentView ) return this.views[ view ].onNavigation( path )

        this.scrollToTop()

        Promise.all( Object.keys( this.views ).map( view => this.views[ view ].hide() ) )
        .then( () => {

            this.currentView = view

            if( this.views[ view ] ) return this.views[ view ].onNavigation( path )

            return Promise.resolve(
                this.views[ view ] =
                    this.ViewFactory.create( view, {
                        insertion: { value: { el: this.contentContainer } },
                        path: { value: path, writable: true }
                    } )
                    .on( 'navigate', route => this.navigate( route ) )
                    .on( 'deleted', () => delete this.views[ view ] )
            )
        } )
        .catch( this.Error )
    },

    navigate( location ) {
        if( location !== window.location.pathname ) history.pushState( {}, '', location )
        this.handle()
    },

    scrollToTop() {
        window.scroll( { top: 0, left: 0, behavior: 'smooth' } )
    },

}, { currentView: { value: '', writable: true }, views: { value: { } } } )
