module.exports = Object.assign( {}, require('./__proto__'), {

    events: {
        'submitBtn': 'click'
    },

    model: require('../models/Person'),

    onSubmitBtnClick() {
        if( this.submitting ) return

        this.submitting = true

        return this.getFormData()
        .then( () => this.submit() )
        .then( () => {
            this.isSubmitting = false
            return this.Toast.showMessage( 'success', "Info sent! We'll keep you posted!" )
            .then( () => {
                this.emit( 'navigate', '/' )
                this.els.name.value = ''
                this.els.contact.value = ''
                this.els.address.value = ''
            } )
        } )
        .catch( e => { this.Error(e); this.submitting = false } )
    },

    getFormData() {
        Object.keys( this.els ).forEach( attr => {
            const el = this.els[ attr ]

            if( el.tagName !== "INPUT" ) return
            this.model.data[ attr ] = el.value
        } )

        return Promise.resolve()
    },

    submit() {
        return this.model.post( this.model.data )
        .catch( e => { this.Toast.showMessage( 'error', e.message ); this.submitting = false } )
    }

} )