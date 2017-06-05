module.exports = Object.assign( {}, require('./__proto__'), {

    events: {
        services: 'click',
        internet: 'click'
    },

    onInternetClick() { this.emit( 'navigate', 'internet' ) },

    onServicesClick() { this.emit( 'navigate', 'services' ) }
    
} )
