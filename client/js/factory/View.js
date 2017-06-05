module.exports = Object.create( {

    create( name, opts ) {
        const lower = name
        name = name.charAt(0).toUpperCase() + name.slice(1)
        return Object.create(
            this.Views[ name ],
            Object.assign( {
                Toast: { value: this.Toast },
                name: { value: name },
                factory: { value: this },
                template: { value: this.Templates[ name ] },
            }, opts )
        ).constructor()
    },

}, {
    Templates: { value: require('../.TemplateMap') },
    Toast: { value: require('../views/Toast') },
    Views: { value: require('../.ViewMap') }
} )
