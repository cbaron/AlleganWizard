module.exports = Object.create( Object.assign( {}, require('./__proto__'), {

    ToastMessage: require('./ToastMessage'),

    name: 'Toast',

    postRender() {
        this.messages = { }

        return this
    },

    requiresLogin: false,

    createMessage( type, message ) {
        if( !this.messages[ message ] ) this.messages[ message ] = Object.create( this.ToastMessage, {
            insertion: { value: { el: this.els.container } }
        } ).constructor()

        return this.messages[ message ].showMessage( type, message )

    },

    template: require('./templates/Toast')

} ), { } )
