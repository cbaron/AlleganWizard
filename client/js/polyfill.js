//https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
if (window.Element && !Element.prototype.closest) {
    Element.prototype.closest = 
    function(s) {
        var matches = (this.document || this.ownerDocument).querySelectorAll(s),
            i,
            el = this;
        do {
            i = matches.length;
            while (--i >= 0 && matches.item(i) !== el) {};
        } while ((i < 0) && (el = el.parentElement)); 
        return el;
    };
}

//https://gist.github.com/paulirish/1579671
const requestAnimationFramePolyfill = (() => {
    let clock = Date.now();

    return (callback) => {

        const currentTime = Date.now();

        if (currentTime - clock > 16) {
            clock = currentTime;
            callback(currentTime);
        } else {
            setTimeout(() => {
                polyfill(callback);
            }, 0);
        }
    };
})();

window.requestAnimationFrame = window.requestAnimationFrame       ||
                               window.webkitRequestAnimationFrame ||
                               window.mozRequestAnimationFrame    ||
                               requestAnimationFramePolyfill

require('smoothscroll-polyfill').polyfill()

module.exports = true
