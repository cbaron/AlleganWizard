module.exports = Object.assign( { }, require('../../../lib/MyObject'), require('events').EventEmitter.prototype, {

    Model: require('../models/__proto__'),

    OptimizedResize: require('./lib/OptimizedResize'),

    bindEvent( key, event, el ) {
        var els = el ? [ el ] : Array.isArray( this.els[ key ] ) ? this.els[ key ] : [ this.els[ key ] ]
        els.forEach( el => el.addEventListener( event || 'click', e => this[ `on${this.capitalizeFirstLetter(key)}${this.capitalizeFirstLetter(event)}` ]( e ) ) )
    },

    capitalizeFirstLetter: string => string.charAt(0).toUpperCase() + string.slice(1),

    constructor() {
        this.subviewElements = [ ]

        if( this.requiresLogin && ( !this.user.isLoggedIn() ) ) return this.handleLogin()
        if( this.user && !this.isAllowed( this.user ) ) return this.scootAway()

        return this.initialize().render()
    },

    delegateEvents( key, el ) {
        var type = typeof this.events[key]

        if( type === "string" ) { this.bindEvent( key, this.events[key], el ) }
        else if( Array.isArray( this.events[key] ) ) {
            this.events[ key ].forEach( eventObj => this.bindEvent( key, eventObj ) )
        } else {
            this.bindEvent( key, this.events[key].event )
        }
    },

    delete() {
        return this.hide()
        .then( () => {
            this.els.container.parentNode.removeChild( this.els.container )
            return Promise.resolve( this.emit('deleted') )
        } )
    },

    events: {},

    getTemplateOptions() {
        const rv = Object.assign( this.user ? { user: this.user.data } : {} )

        if( this.model ) {
            rv.model = this.model.data

            if( this.model.meta ) rv.meta = this.model.meta
        }
        return rv
    },

    handleLogin() {
        this.factory.create( 'login', { insertion: { value: { el: document.querySelector('#content') } } } )
            .once( "loggedIn", () => this.onLogin() )

        return this
    },

    hide( isSlow, animate=true ) { return this.hideEl( this.els.container, isSlow, animate ).then( () => this.emit('hidden') ) },

    _hideEl( el, klass, resolve, hash ) {
        el.removeEventListener( 'animationend', this[ hash ] )
        el.classList.add('hidden')
        el.classList.remove( klass )
        delete this[hash]
        resolve()
    },

    hideEl( el, isSlow, animate=true ) {
        if( this.isHidden( el ) ) return Promise.resolve()

        const time = new Date().getTime(),
            hash = `${time}Hide`
        
        return new Promise( resolve => {
            if( !animate ) return resolve( el.classList.add('hidden') )

            const klass = `animate-out${ isSlow ? '-slow' : ''}`
            this[ hash ] = e => this._hideEl( el, klass, resolve, hash )
            el.addEventListener( 'animationend', this[ hash ] )
            el.classList.add( klass )
        } )
    },

    htmlToFragment( str ) {
        let range = document.createRange();
        // make the parent of the first div in the document becomes the context node
        range.selectNode(document.getElementsByTagName("div").item(0))
        return range.createContextualFragment( str )
    },

    initialize() {
        return Object.assign( this, { els: { }, slurp: { attr: 'data-js', view: 'data-view', name: 'data-name' }, views: { } } )
    },

    isAllowed( user ) {
        if( !this.requiresRole ) return true
        return this.requiresRole && user.data.roles.includes( this.requiresRole )
    },
    
    isHidden( el ) {
        const element = el || this.els.container
        return element.classList.contains('hidden')
    },

    onLogin() {

        if( !this.isAllowed( this.user ) ) return this.scootAway()

        this.initialize().render()
    },

    onNavigation() {
        return this.show()
    },

    showNoAccess() {
        alert("No privileges, son")
        return this
    },

    postRender() { return this },

    render() {
        if( this.data ) this.model = Object.create( this.Model, { } ).constructor( this.data )

        this.slurpTemplate( { template: this.template( this.getTemplateOptions() ), insertion: this.insertion || { el: document.body }, isView: true } )

        this.renderSubviews()

        if( this.size ) { this.size(); this.OptimizedResize.add( this.size.bind(this) ) }

        return this.postRender()
    },

    renderSubviews() {
        this.subviewElements.forEach( obj => {
            const name = obj.name

            let opts = { }

            if( this.Views && this.Views[ name ] ) opts = typeof this.Views[ name ] === "object" ? this.Views[ name ] : Reflect.apply( this.Views[ name ], this, [ ] )

            this.views[ name ] = this.factory.create( key, Object.assign( { insertion: { value: { el: obj.el, method: 'insertBefore' } } }, { opts: { value: opts } } ) )
            obj.el.remove()
        } )

        delete this.subviewElements

        return this
    },

    scootAway() {
        this.Toast.show( 'error', 'You are not allowed here.  Sorry.')
        .catch( e => { this.Error( e ); this.emit( 'navigate', `/` ) } )
        .then( () => this.emit( 'navigate', `/` ) )

        return this
    },

    show( isSlow, animate=true ) { return this.showEl( this.els.container, isSlow, animate ).then( () => this.emit('shown') ) },

    _showEl( el, klass, resolve, hash ) {
        el.removeEventListener( 'animationend', this[hash] )
        el.classList.remove( klass )
        delete this[ hash ]
        resolve()
    },

    showEl( el, isSlow, animate=true ) {
        if( !this.isHidden( el ) ) return Promise.resolve()

        const time = new Date().getTime(),
            hash = `${time}Show`

        return new Promise( resolve => {
            el.classList.remove('hidden')

            if( !animate ) return resolve()

            const klass = `animate-in${ isSlow ? '-slow' : ''}`
            this[ hash ] = e => this._showEl( el, klass, resolve, hash )
            el.addEventListener( 'animationend', this[ hash ] )            
            el.classList.add( klass )
        } )        
    },

    slurpEl( el ) {
        var key = el.getAttribute( this.slurp.attr ) || 'container'

        if( key === 'container' ) el.classList.add( this.name )

        this.els[ key ] = Array.isArray( this.els[ key ] )
            ? this.els[ key ].concat( el )
            : ( this.els[ key ] !== undefined )
                ? [ this.els[ key ], el ]
                : el

        el.removeAttribute(this.slurp.attr)

        if( this.events[ key ] ) this.delegateEvents( key, el )
    },

    slurpTemplate( options ) {
        var fragment = this.htmlToFragment( options.template ),
            selector = `[${this.slurp.attr}]`,
            viewSelector = `[${this.slurp.view}]`,
            firstEl = fragment.querySelector('*')

        if( options.isView || firstEl.getAttribute( this.slurp.attr ) ) this.slurpEl( firstEl )
        fragment.querySelectorAll( `${selector}, ${viewSelector}` ).forEach( el => {
            if( el.hasAttribute( this.slurp.attr ) ) { this.slurpEl( el ) }
            else if( el.hasAttribute( this.slurp.view ) ) {
                this.subviewElements.push( { el, view: el.getAttribute(this.slurp.view), name: el.getAttribute(this.slurp.name) } )
            }
        } )
          
        options.insertion.method === 'insertBefore'
            ? options.insertion.el.parentNode.insertBefore( fragment, options.insertion.el )
            : options.insertion.el[ options.insertion.method || 'appendChild' ]( fragment )

        return this
    }
} )
