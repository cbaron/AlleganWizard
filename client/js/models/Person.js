module.exports = Object.assign( {}, require('./__proto__'), {

    data: { },
    
    fields: {
        name: {
            error: 'Please enter your name'
        },
        contact: {
            error: 'Please enter a valid email address or phone number'
        }
    },

    resource: 'person',

    validate( field, value ) {
        const val = value.trim()

        if( field === 'name' && val === "" ) return false

        if( field === 'contact' && ( !this._emailRegex.test( val ) && !this._phoneRegex.test( val ) ) ) return false

        return true
    },

    _emailRegex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,

    _phoneRegex: /^\(?(\d{3})\)?[-. ]?(\d{3})[-. ]?(\d{4})$/

} )