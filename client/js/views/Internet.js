module.exports = Object.assign( {}, require('./__proto__'), {

    events: {
        'submitBtn': 'click'
    },

    model: Object.create( require('../models/Person') ),

    clearForm() {
        this.els.name.value = ''
        this.els.contact.value = ''
        this.els.address.value = ''
    },

    onSubmitBtnClick() {
        if( this.submitting ) return

        this.onSubmitStart()

        this.validate()
        .then( result => {
            if( !result ) return Promise.resolve( this.onSubmitEnd() )

            return this.model.post()
            .then( response => {
                return this.Toast.createMessage( 'success', "Info sent! We'll keep you posted!" )
                .then( () => {
                    this.emit( 'navigate', '/' )
                    this.onSubmitEnd()
                    this.clearForm()
                } )
            } )
            .catch( e => {
                this.Toast.createMessage( 'error', e && e.message ? e.message : `There was a problem. Please try again or contact us.` );
                this.onSubmitEnd()
            } )
        } )
        .catch( e => { this.Error(e); this.submitting = false } )
    },

    onSubmitEnd() {
        this.submitting = false
        this.els.submitBtn.classList.remove('submitting')
    },
    
    onSubmitStart() {
        this.submitting = true
        this.els.submitBtn.classList.add('submitting')
    },

    postRender() {
        Object.keys( this.els ).forEach( attr => {        
            const el = this.els[ attr ]
            
            if( attr === 'name' || attr === 'contact' ) el.addEventListener( 'focus', () => el.classList.remove('error') )       
        } )

        return this
    },

    validate() {
        let rv = true;

        Object.keys( this.els ).forEach( attr => {        
            const el = this.els[ attr ]
            
            if( attr !== 'name' && attr !== 'contact' ) return

            if( rv === true && !this.model.validate( attr, el.value ) ) {
                this.Toast.createMessage( 'error', this.model.fields[ attr ].error )
                el.scrollIntoView( { behavior: 'smooth' } )
                el.classList.add( 'error' )
                rv = false
            } else if( this.model.validate( attr, el.value ) ) {
                this.model.data[ attr ] = el.value.trim()
            }
        } )

        return Promise.resolve( rv )
    }

} )