module.exports = Object.assign( {}, require('./__proto__'), {

    events: {
        nav: 'click'
    },

    onNavClick( e ) {
        const itemEl = e.target.tagName === "LI" ? e.target : e.target.closest('li'),
              name = itemEl.getAttribute('data-name')

        this.emit( 'navigate', name )
    }

} )
