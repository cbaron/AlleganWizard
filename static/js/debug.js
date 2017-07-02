(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = {
	Footer: require('./views/templates/Footer'),
	Header: require('./views/templates/Header'),
	Home: require('./views/templates/Home'),
	Internet: require('./views/templates/Internet'),
	Services: require('./views/templates/Services'),
	Toast: require('./views/templates/Toast')
};

},{"./views/templates/Footer":18,"./views/templates/Header":19,"./views/templates/Home":20,"./views/templates/Internet":21,"./views/templates/Services":22,"./views/templates/Toast":23}],2:[function(require,module,exports){
'use strict';

module.exports = {
	Footer: require('./views/Footer'),
	Header: require('./views/Header'),
	Home: require('./views/Home'),
	Internet: require('./views/Internet'),
	Services: require('./views/Services'),
	Toast: require('./views/Toast')
};

},{"./views/Footer":10,"./views/Header":11,"./views/Home":12,"./views/Internet":13,"./views/Services":14,"./views/Toast":15}],3:[function(require,module,exports){
"use strict";

module.exports = Object.create(Object.assign({}, require('../../lib/MyObject'), {

    Request: {
        constructor: function constructor(data) {
            var _this = this;

            var req = new XMLHttpRequest();

            if (data.onProgress) req.addEventListener("progress", function (e) {
                return data.onProgress(e.lengthComputable ? Math.floor(e.loaded / e.total * 100) : 0);
            });

            return new Promise(function (resolve, reject) {

                req.onload = function () {
                    [500, 404, 401].includes(this.status) ? reject(JSON.parse(this.response)) : resolve(JSON.parse(this.response));
                };

                if (data.method === "get" || data.method === "options") {
                    var qs = data.qs ? "?" + data.qs : '';
                    req.open(data.method, "/" + data.resource + qs);
                    _this.setHeaders(req, data.headers);
                    req.send(null);
                } else {
                    var path = "/" + data.resource + (data.id ? "/" + data.id : '');
                    req.open(data.method.toUpperCase(), path, true);
                    _this.setHeaders(req, data.headers);
                    req.send(data.data || null);
                }

                if (data.onProgress) data.onProgress('sent');
            });
        },
        plainEscape: function plainEscape(sText) {
            /* how should I treat a text/plain form encoding? what characters are not allowed? this is what I suppose...: */
            /* "4\3\7 - Einstein said E=mc2" ----> "4\\3\\7\ -\ Einstein\ said\ E\=mc2" */
            return sText.replace(/[\s\=\\]/g, "\\$&");
        },
        setHeaders: function setHeaders(req) {
            var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            req.setRequestHeader("Accept", headers.accept || 'application/json');
            req.setRequestHeader("Content-Type", headers.contentType || 'text/plain');
        }
    },

    _factory: function _factory(data) {
        return Object.create(this.Request, {}).constructor(data);
    },
    constructor: function constructor() {

        if (!XMLHttpRequest.prototype.sendAsBinary) {
            XMLHttpRequest.prototype.sendAsBinary = function (sData) {
                var nBytes = sData.length,
                    ui8Data = new Uint8Array(nBytes);
                for (var nIdx = 0; nIdx < nBytes; nIdx++) {
                    ui8Data[nIdx] = sData.charCodeAt(nIdx) & 0xff;
                }
                this.send(ui8Data);
            };
        }

        return this._factory.bind(this);
    }
}), {}).constructor();

},{"../../lib/MyObject":28}],4:[function(require,module,exports){
'use strict';

module.exports = Object.create({
    create: function create(name, opts) {
        var lower = name;
        name = name.charAt(0).toUpperCase() + name.slice(1);
        return Object.create(this.Views[name], Object.assign({
            Toast: { value: this.Toast },
            name: { value: name },
            factory: { value: this },
            template: { value: this.Templates[name] }
        }, opts)).constructor();
    }
}, {
    Templates: { value: require('../.TemplateMap') },
    Toast: { value: require('../views/Toast') },
    Views: { value: require('../.ViewMap') }
});

},{"../.TemplateMap":1,"../.ViewMap":2,"../views/Toast":15}],5:[function(require,module,exports){
'use strict';

var router = require('./router'),
    onLoad = new Promise(function (resolve) {
    return window.onload = function () {
        return resolve();
    };
});

require('./polyfill');

onLoad.then(function () {
    return router.initialize();
}).catch(function (e) {
    return console.log('Error initializing client -> ' + (e.stack || e));
});

},{"./polyfill":8,"./router":9}],6:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {

    data: {},

    fields: {
        name: {
            error: 'Please enter your name'
        },
        contact: {
            error: 'Please enter a valid email address or phone number'
        }
    },

    resource: 'person',

    validate: function validate(field, value) {
        var val = value.trim();

        if (field === 'name' && val === "") return false;

        if (field === 'contact' && !this._emailRegex.test(val) && !this._phoneRegex.test(val)) return false;

        return true;
    },


    _emailRegex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,

    _phoneRegex: /^\(?(\d{3})\)?[-. ]?(\d{3})[-. ]?(\d{4})$/

});

},{"./__proto__":7}],7:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('../../../lib/MyObject'), require('../../../lib/Model'), require('events').EventEmitter.prototype, {

    Xhr: require('../Xhr'),

    delete: function _delete(id) {
        var _this = this;

        return this.Xhr({ method: 'DELETE', resource: this.resource, id: id }).then(function (id) {
            var datum = _this.data.find(function (datum) {
                return datum.id == id;
            });

            if (_this.store) {
                Object.keys(_this.store).forEach(function (attr) {
                    _this.store[attr][datum[attr]] = _this.store[attr][datum[attr]].filter(function (datum) {
                        return datum.id != id;
                    });
                    if (_this.store[attr][datum[attr]].length === 0) {
                        _this.store[attr][datum[attr]] = undefined;
                    }
                });
            }

            _this.data = _this.data.filter(function (datum) {
                return datum.id != id;
            });
            if (_this.ids) delete _this.ids[id];

            return Promise.resolve(id);
        });
    },
    get: function get() {
        var _this2 = this;

        var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { query: {} };

        if (opts.query || this.pagination) Object.assign(opts.query, this.pagination);

        return this.Xhr({ method: opts.method || 'get', resource: this.resource, headers: this.headers || {}, qs: opts.query ? JSON.stringify(opts.query) : undefined }).then(function (response) {

            if (opts.storeBy) {
                _this2.store = {};
                opts.storeBy.forEach(function (attr) {
                    return _this2.store[attr] = {};
                });
            }

            _this2.data = _this2.parse ? _this2.parse(response, opts.storeBy) : opts.storeBy ? _this2.storeBy(response) : response;

            _this2.emit('got');

            return Promise.resolve(_this2.data);
        });
    },
    patch: function patch(id, data) {
        var _this3 = this;

        var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        return this.Xhr({ method: 'patch', id: id, resource: this.resource, headers: this.headers || {}, data: JSON.stringify(data || this.data) }).then(function (response) {
            if (Array.isArray(_this3.data)) {
                _this3.data = _this3.data ? _this3.data.concat(response) : [response];
                if (_this3.store) Object.keys(_this3.store).forEach(function (attr) {
                    return _this3._store(response, attr);
                });
            }

            return Promise.resolve(response);
        });
    },
    post: function post(model) {
        var _this4 = this;

        var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        return this.Xhr({ method: 'post', resource: this.resource, headers: this.headers || {}, data: JSON.stringify(model || this.data) }).then(function (response) {
            if (Array.isArray(_this4.data)) {
                _this4.data = _this4.data ? _this4.data.concat(response) : [response];
                if (_this4.store) Object.keys(_this4.store).forEach(function (attr) {
                    return _this4._store(response, attr);
                });
            }

            return Promise.resolve(response);
        });
    },
    storeBy: function storeBy(data) {
        var _this5 = this;

        data.forEach(function (datum) {
            return Object.keys(_this5.store).forEach(function (attr) {
                return _this5._store(datum, attr);
            });
        });

        return data;
    },
    _store: function _store(datum, attr) {
        if (!this.store[attr][datum[attr]]) this.store[attr][datum[attr]] = [];
        this.store[attr][datum[attr]].push(datum);
    }
});

},{"../../../lib/Model":26,"../../../lib/MyObject":28,"../Xhr":3,"events":29}],8:[function(require,module,exports){
'use strict';

//https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
if (window.Element && !Element.prototype.closest) {
    Element.prototype.closest = function (s) {
        var matches = (this.document || this.ownerDocument).querySelectorAll(s),
            i,
            el = this;
        do {
            i = matches.length;
            while (--i >= 0 && matches.item(i) !== el) {};
        } while (i < 0 && (el = el.parentElement));
        return el;
    };
}

//https://gist.github.com/paulirish/1579671
var requestAnimationFramePolyfill = function () {
    var clock = Date.now();

    return function (callback) {

        var currentTime = Date.now();

        if (currentTime - clock > 16) {
            clock = currentTime;
            callback(currentTime);
        } else {
            setTimeout(function () {
                polyfill(callback);
            }, 0);
        }
    };
}();

window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || requestAnimationFramePolyfill;

require('smoothscroll-polyfill').polyfill();

module.exports = true;

},{"smoothscroll-polyfill":30}],9:[function(require,module,exports){
'use strict';

module.exports = Object.create({

    Error: require('../../lib/MyError'),

    ViewFactory: require('./factory/View'),

    Views: require('./.ViewMap'),

    Toast: require('./views/Toast'),

    capitalizeFirstLetter: function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    initialize: function initialize() {
        var _this = this;

        this.contentContainer = document.querySelector('#content');

        this.Toast.constructor();

        window.onpopstate = this.handle.bind(this);

        this.header = this.ViewFactory.create('header', { insertion: { value: { el: this.contentContainer, method: 'insertBefore' } } }).on('navigate', function (route) {
            return _this.navigate(route);
        });

        this.footer = this.ViewFactory.create('footer', { insertion: { value: { el: this.contentContainer, method: 'after' } } });

        this.handle();
    },
    handle: function handle() {
        this.handler(window.location.pathname.split('/').slice(1));
    },
    handler: function handler(path) {
        var _this2 = this;

        var view = this.Views[this.capitalizeFirstLetter(path[0])] ? path[0] : 'home';

        if (view === this.currentView) return this.views[view].onNavigation(path);

        this.scrollToTop();

        Promise.all(Object.keys(this.views).map(function (view) {
            return _this2.views[view].hide();
        })).then(function () {

            _this2.currentView = view;

            if (_this2.views[view]) return _this2.views[view].onNavigation(path);

            return Promise.resolve(_this2.views[view] = _this2.ViewFactory.create(view, {
                insertion: { value: { el: _this2.contentContainer } },
                path: { value: path, writable: true }
            }).on('navigate', function (route) {
                return _this2.navigate(route);
            }).on('deleted', function () {
                return delete _this2.views[view];
            }));
        }).catch(this.Error);
    },
    navigate: function navigate(location) {
        if (location !== window.location.pathname) history.pushState({}, '', location);
        this.handle();
    },
    scrollToTop: function scrollToTop() {
        window.scroll({ top: 0, left: 0, behavior: 'smooth' });
    }
}, { currentView: { value: '', writable: true }, views: { value: {} } });

},{"../../lib/MyError":27,"./.ViewMap":2,"./factory/View":4,"./views/Toast":15}],10:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {});

},{"./__proto__":16}],11:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {

    events: {
        nav: 'click'
    },

    onNavClick: function onNavClick(e) {
        var itemEl = e.target.tagName === "LI" ? e.target : e.target.closest('li'),
            name = itemEl.getAttribute('data-name');

        this.emit('navigate', name);
    }
});

},{"./__proto__":16}],12:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {

    events: {
        services: 'click',
        internet: 'click'
    },

    onInternetClick: function onInternetClick() {
        this.emit('navigate', 'internet');
    },
    onServicesClick: function onServicesClick() {
        this.emit('navigate', 'services');
    }
});

},{"./__proto__":16}],13:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {

    events: {
        'submitBtn': 'click'
    },

    model: Object.create(require('../models/Person')),

    clearForm: function clearForm() {
        this.els.name.value = '';
        this.els.contact.value = '';
        this.els.address.value = '';
    },
    onSubmitBtnClick: function onSubmitBtnClick() {
        var _this = this;

        if (this.submitting) return;

        this.onSubmitStart();

        this.validate().then(function (result) {
            if (!result) return Promise.resolve(_this.onSubmitEnd());

            return _this.model.post().then(function (response) {
                return _this.Toast.showMessage('success', "Info sent! We'll keep you posted!").then(function () {
                    _this.emit('navigate', '/');
                    _this.onSubmitEnd();
                    _this.clearForm();
                });
            }).catch(function (e) {
                _this.Toast.showMessage('error', e && e.message ? e.message : 'There was a problem. Please try again or contact us.');
                _this.onSubmitEnd();
            });
        }).catch(function (e) {
            _this.Error(e);_this.submitting = false;
        });
    },
    onSubmitEnd: function onSubmitEnd() {
        this.submitting = false;
        this.els.submitBtn.classList.remove('submitting');
    },
    onSubmitStart: function onSubmitStart() {
        this.submitting = true;
        this.els.submitBtn.classList.add('submitting');
    },
    postRender: function postRender() {
        var _this2 = this;

        Object.keys(this.els).forEach(function (attr) {
            var el = _this2.els[attr];

            if (attr === 'name' || attr === 'contact') el.addEventListener('focus', function () {
                return el.classList.remove('error');
            });
        });

        return this;
    },
    validate: function validate() {
        var _this3 = this;

        var rv = true;

        Object.keys(this.els).forEach(function (attr) {
            var el = _this3.els[attr];

            if (attr !== 'name' && attr !== 'contact') return;

            if (rv === true && !_this3.model.validate(attr, el.value)) {
                _this3.Toast.showMessage('error', _this3.model.fields[attr].error);
                el.scrollIntoView({ behavior: 'smooth' });
                el.classList.add('error');
                rv = false;
            } else if (_this3.model.validate(attr, el.value)) {
                _this3.model.data[attr] = el.value.trim();
            }
        });

        return Promise.resolve(rv);
    }
});

},{"../models/Person":6,"./__proto__":16}],14:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {});

},{"./__proto__":16}],15:[function(require,module,exports){
'use strict';

module.exports = Object.create(Object.assign({}, require('./__proto__'), {

    Icons: {
        error: require('./templates/lib/error')(),
        success: require('./templates/lib/checkmark')()
    },

    name: 'Toast',

    postRender: function postRender() {
        var _this = this;

        this.on('shown', function () {
            return _this.status = 'shown';
        });
        this.on('hidden', function () {
            return _this.status = 'hidden';
        });

        return this;
    },


    requiresLogin: false,

    showMessage: function showMessage(type, message) {
        var _this2 = this;

        return new Promise(function (resolve, reject) {
            if (/show/.test(_this2.status)) _this2.teardown();

            _this2.resolution = resolve;

            if (type !== 'error') _this2.els.container.classList.add('success');

            _this2.els.message.textContent = message;
            _this2.els.title.textContent = type === 'error' ? 'Error' : 'Success';
            _this2.slurpTemplate({ insertion: { el: _this2.els.icon }, template: type === 'error' ? _this2.Icons.error : _this2.Icons.success });

            _this2.status = 'showing';

            _this2.show(true).then(function () {
                return _this2.hide(true);
            }).then(function () {
                return _this2.teardown();
            }).catch(reject);
        });
    },
    teardown: function teardown() {
        if (this.els.container.classList.contains('success')) this.els.container.classList.remove('success');
        this.els.message.textContent = '';
        this.els.message.title = '';
        if (this.els.icon.firstChild) this.els.icon.removeChild(this.els.icon.firstChild);
        this.resolution();
    },


    template: require('./templates/Toast')

}), {});

},{"./__proto__":16,"./templates/Toast":23,"./templates/lib/checkmark":24,"./templates/lib/error":25}],16:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = Object.assign({}, require('../../../lib/MyObject'), require('events').EventEmitter.prototype, {

    Model: require('../models/__proto__'),

    OptimizedResize: require('./lib/OptimizedResize'),

    bindEvent: function bindEvent(key, event, el) {
        var _this = this;

        var els = el ? [el] : Array.isArray(this.els[key]) ? this.els[key] : [this.els[key]];
        els.forEach(function (el) {
            return el.addEventListener(event || 'click', function (e) {
                return _this['on' + _this.capitalizeFirstLetter(key) + _this.capitalizeFirstLetter(event)](e);
            });
        });
    },


    capitalizeFirstLetter: function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    constructor: function constructor() {
        this.subviewElements = [];

        if (this.requiresLogin && !this.user.isLoggedIn()) return this.handleLogin();
        if (this.user && !this.isAllowed(this.user)) return this.scootAway();

        return this.initialize().render();
    },
    delegateEvents: function delegateEvents(key, el) {
        var _this2 = this;

        var type = _typeof(this.events[key]);

        if (type === "string") {
            this.bindEvent(key, this.events[key], el);
        } else if (Array.isArray(this.events[key])) {
            this.events[key].forEach(function (eventObj) {
                return _this2.bindEvent(key, eventObj);
            });
        } else {
            this.bindEvent(key, this.events[key].event);
        }
    },
    delete: function _delete() {
        var _this3 = this;

        return this.hide().then(function () {
            _this3.els.container.parentNode.removeChild(_this3.els.container);
            return Promise.resolve(_this3.emit('deleted'));
        });
    },


    events: {},

    getTemplateOptions: function getTemplateOptions() {
        var rv = Object.assign(this.user ? { user: this.user.data } : {});

        if (this.model) {
            rv.model = this.model.data;

            if (this.model.meta) rv.meta = this.model.meta;
        }
        return rv;
    },
    handleLogin: function handleLogin() {
        var _this4 = this;

        this.factory.create('login', { insertion: { value: { el: document.querySelector('#content') } } }).once("loggedIn", function () {
            return _this4.onLogin();
        });

        return this;
    },
    hide: function hide(isSlow) {
        var _this5 = this;

        var animate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        return this.hideEl(this.els.container, isSlow, animate).then(function () {
            return _this5.emit('hidden');
        });
    },
    _hideEl: function _hideEl(el, klass, resolve, hash) {
        el.removeEventListener('animationend', this[hash]);
        el.classList.add('hidden');
        el.classList.remove(klass);
        delete this[hash];
        resolve();
    },
    hideEl: function hideEl(el, isSlow) {
        var _this6 = this;

        var animate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

        if (this.isHidden(el)) return Promise.resolve();

        var time = new Date().getTime(),
            hash = time + 'Hide';

        return new Promise(function (resolve) {
            if (!animate) return resolve(el.classList.add('hidden'));

            var klass = 'animate-out' + (isSlow ? '-slow' : '');
            _this6[hash] = function (e) {
                return _this6._hideEl(el, klass, resolve, hash);
            };
            el.addEventListener('animationend', _this6[hash]);
            el.classList.add(klass);
        });
    },
    htmlToFragment: function htmlToFragment(str) {
        var range = document.createRange();
        // make the parent of the first div in the document becomes the context node
        range.selectNode(document.getElementsByTagName("div").item(0));
        return range.createContextualFragment(str);
    },
    initialize: function initialize() {
        return Object.assign(this, { els: {}, slurp: { attr: 'data-js', view: 'data-view', name: 'data-name' }, views: {} });
    },
    isAllowed: function isAllowed(user) {
        if (!this.requiresRole) return true;
        return this.requiresRole && user.data.roles.includes(this.requiresRole);
    },
    isHidden: function isHidden(el) {
        var element = el || this.els.container;
        return element.classList.contains('hidden');
    },
    onLogin: function onLogin() {

        if (!this.isAllowed(this.user)) return this.scootAway();

        this.initialize().render();
    },
    onNavigation: function onNavigation() {
        return this.show();
    },
    showNoAccess: function showNoAccess() {
        alert("No privileges, son");
        return this;
    },
    postRender: function postRender() {
        return this;
    },
    render: function render() {
        if (this.data) this.model = Object.create(this.Model, {}).constructor(this.data);

        this.slurpTemplate({ template: this.template(this.getTemplateOptions()), insertion: this.insertion || { el: document.body }, isView: true });

        this.renderSubviews();

        if (this.size) {
            this.size();this.OptimizedResize.add(this.size.bind(this));
        }

        return this.postRender();
    },
    renderSubviews: function renderSubviews() {
        var _this7 = this;

        this.subviewElements.forEach(function (obj) {
            var name = obj.name;

            var opts = {};

            if (_this7.Views && _this7.Views[name]) opts = _typeof(_this7.Views[name]) === "object" ? _this7.Views[name] : Reflect.apply(_this7.Views[name], _this7, []);

            _this7.views[name] = _this7.factory.create(key, Object.assign({ insertion: { value: { el: obj.el, method: 'insertBefore' } } }, { opts: { value: opts } }));
            obj.el.remove();
        });

        delete this.subviewElements;

        return this;
    },
    scootAway: function scootAway() {
        var _this8 = this;

        this.Toast.show('error', 'You are not allowed here.  Sorry.').catch(function (e) {
            _this8.Error(e);_this8.emit('navigate', '/');
        }).then(function () {
            return _this8.emit('navigate', '/');
        });

        return this;
    },
    show: function show(isSlow) {
        var _this9 = this;

        var animate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        return this.showEl(this.els.container, isSlow, animate).then(function () {
            return _this9.emit('shown');
        });
    },
    _showEl: function _showEl(el, klass, resolve, hash) {
        el.removeEventListener('animationend', this[hash]);
        el.classList.remove(klass);
        delete this[hash];
        resolve();
    },
    showEl: function showEl(el, isSlow) {
        var _this10 = this;

        var animate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

        if (!this.isHidden(el)) return Promise.resolve();

        var time = new Date().getTime(),
            hash = time + 'Show';

        return new Promise(function (resolve) {
            el.classList.remove('hidden');

            if (!animate) return resolve();

            var klass = 'animate-in' + (isSlow ? '-slow' : '');
            _this10[hash] = function (e) {
                return _this10._showEl(el, klass, resolve, hash);
            };
            el.addEventListener('animationend', _this10[hash]);
            el.classList.add(klass);
        });
    },
    slurpEl: function slurpEl(el) {
        var key = el.getAttribute(this.slurp.attr) || 'container';

        if (key === 'container') el.classList.add(this.name);

        this.els[key] = Array.isArray(this.els[key]) ? this.els[key].concat(el) : this.els[key] !== undefined ? [this.els[key], el] : el;

        el.removeAttribute(this.slurp.attr);

        if (this.events[key]) this.delegateEvents(key, el);
    },
    slurpTemplate: function slurpTemplate(options) {
        var _this11 = this;

        var fragment = this.htmlToFragment(options.template),
            selector = '[' + this.slurp.attr + ']',
            viewSelector = '[' + this.slurp.view + ']',
            firstEl = fragment.querySelector('*');

        if (options.isView || firstEl.getAttribute(this.slurp.attr)) this.slurpEl(firstEl);
        fragment.querySelectorAll(selector + ', ' + viewSelector).forEach(function (el) {
            if (el.hasAttribute(_this11.slurp.attr)) {
                _this11.slurpEl(el);
            } else if (el.hasAttribute(_this11.slurp.view)) {
                _this11.subviewElements.push({ el: el, view: el.getAttribute(_this11.slurp.view), name: el.getAttribute(_this11.slurp.name) });
            }
        });

        options.insertion.method === 'insertBefore' ? options.insertion.el.parentNode.insertBefore(fragment, options.insertion.el) : options.insertion.el[options.insertion.method || 'appendChild'](fragment);

        return this;
    }
});

},{"../../../lib/MyObject":28,"../models/__proto__":7,"./lib/OptimizedResize":17,"events":29}],17:[function(require,module,exports){
'use strict';

module.exports = Object.create({
    add: function add(callback) {
        if (!this.callbacks.length) window.addEventListener('resize', this.onResize.bind(this));
        this.callbacks.push(callback);
    },
    onResize: function onResize() {
        if (this.running) return;

        this.running = true;

        window.requestAnimationFrame ? window.requestAnimationFrame(this.runCallbacks.bind(this)) : setTimeout(this.runCallbacks, 66);
    },
    runCallbacks: function runCallbacks() {
        this.callbacks = this.callbacks.filter(function (callback) {
            return callback();
        });
        this.running = false;
    }
}, { callbacks: { writable: true, value: [] }, running: { writable: true, value: false } });

},{}],18:[function(require,module,exports){
"use strict";

module.exports = function (p) {
    return "<footer>\n    <div class=\"contact\">\n        <div>&copy; 2017 | Allegan Internet Wizard</div>\n        <div>123 Bayron Lane | Allegan, MI 12345 | 123.456.7890</div>\n        <div>the_wiz@aiw.com</div>\n    </div>\n</footer>";
};

},{}],19:[function(require,module,exports){
"use strict";

module.exports = function () {
    return "<nav>\n    <div class=\"contact\">\n        <div>phone: 123.456.7890 | email: the_wiz@aiw.com</div>\n    </div>\n    <ul data-js=\"nav\">\n        <li data-name=\"home\">Home</li>\n        <li data-name=\"services\">Services</li>\n        <li data-name=\"internet\">Local Internet!</li>\n    </ul>\n</nav>";
};

},{}],20:[function(require,module,exports){
"use strict";

module.exports = function () {
    return "<div>\n    <div>\n        <img src=\"/static/img/logo.svg\">\n    </div>\n    <div>\n        <h2>Make Your Tech Problems Magically Disappear!</h2>\n        <p>Computers. Can't live with 'em, can't live without 'em. They're a huge part of our lives these days, but unfortunately\n        they haven't gotten any less complicated. Things can and do go wrong all the time, and then you end up spending hours\n        and hours of your valuable time trying to figure out what the heck happened and fix it. Life's too short for all that frustration.\n        Why not hire a professional to take care of it quickly and painlessly? Give The Wizard a call!</p>\n        <p>Allegan Internet Wizard is here to assist the citizens of Allegan with all of their tech needs. Whether you are a\n        normal home user or a small business, we will use our 15+ years of experience in the tech industry to solve your problems\n        with speed, courtesy, and professionalism. Want to find out more? Click <span class=\"link\" data-js=\"services\">here</span>\n        for a list of our services.</p>\n        <p><span class=\"notice\">Special notice</span>: we are considering expanding our business to provide internet service to Allegan.\n        Click <span class=\"link\" data-js=\"internet\">here</span> to find out more.</p>\n    </div>        \n</div>";
};

},{}],21:[function(require,module,exports){
"use strict";

module.exports = function () {
    return "<div>\n    <div>\n        <h2>Local Internet Service for Allegan</h2>\n        <p>Not happy with your internet options in Allegan? Tired of paying too much for lousy speeds and constant service interruptions?\n        Well, you're in luck, because Allegan Internet Wizard is currently considering launching our own internet service for\n        the fine citizens of Allegan. We believe there's not nearly enough freedom and choice when it comes to internet providers, and\n        we'd like to use our tech skills to change that and offer Allegan fast, reliable service at a reasonable price.\n        Let's give those fat cat telecoms some real competition!</p>\n        <p>If this sounds good to you, please leave your name and contact info, and we'll let you know how things are developing.\n        Thank you for your interest!</p>\n    </div>\n    <div class=\"border\"></div>\n    <form>\n        <input data-js=\"name\" type=\"text\" placeholder=\"Name\">\n        <input data-js=\"contact\" type=\"text\" placeholder=\"Email or Phone Number\">\n        <input data-js=\"address\" type=\"text\" placeholder=\"Address\">\n        <button data-js=\"submitBtn\" type=\"button\">Submit</button>\n    </form>\n</div>";
};

},{}],22:[function(require,module,exports){
"use strict";

module.exports = function () {
    return "<div>\n    <h1>Our Services</h1>\n    <div class=\"intro\">\n        <p>Want to improve your home network? Protect your kids from inappropriate content on the web? Need help exploring\n        your internet service options? Can't figure out why a web page isn't working? Maybe you're a business and want to build\n        a new website or improve your current one. From general tech support to web development, we've got you covered!</p>\n    </div>\n    <div class=\"border\"></div>\n    <div class=\"categories\">\n        <div>\n            <h3>General Tech Support</h3>\n            <ul>\n                <li>Mac and PC. Laptop, desktop, mobile, and tablet. Tell us your problem and we'll fix it!</li>\n            </ul>\n        </div>\n        <div>\n            <h3>Internet Service Advice</h3>\n            <ul>\n                <li>We'll take a look at where you live and let you know what your best options are for connecting\n                to the internet</li>\n            </ul>\n        </div>\n        <div>\n            <h3>Data Recovery and Backups</h3>\n            <ul>\n                <li>Hard drive crash? We'll help you get your valuable data back</li>\n                <li>And we'll help you back your data up so that it's safe for the future</li>\n            </ul>\n        </div>\n        <div>\n            <h3>Networks</h3>\n            <ul>\n                <li>Installation of wired and wireless networks</li>\n                <li>Troubleshooting for internet connection issues</li>\n                <li>Configuration of modems and routers</li>\n            </ul>\n        </div>\n        <div>\n            <h3>Computer Security</h3>\n            <ul>\n                <li>Keep your kids safe from inappropriate content</li>\n                <li>Find and eliminate viruses, malware, and spyware</li>\n                <li>Set up antivirus software and firewalls for further protection</li>\n            </ul>\n       </div>\n        <div>\n            <h3>Help for Businesses</h3>\n            <ul>\n                <li>Fully customizable websites that will improve your brand and optimize your workflow</li>\n                <li>Setting up company email</li>\n                <li>Server installation</li>\n            </ul>\n        </div>\n    </div>\n</div>";
};

},{}],23:[function(require,module,exports){
"use strict";

module.exports = function (p) {
    return "" + "<div class=\"clearfix hidden\">\n    <div data-js=\"icon\"></div>\n    <div>\n        <div data-js=\"title\"></div>\n        <div data-js=\"message\"></div>\n    </div>\n</div>";
};

},{}],24:[function(require,module,exports){
'use strict';

module.exports = function () {
	var p = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	return '<svg version="1.1" data-js="' + (p.name || 'checkmark') + '" class="checkmark" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n\t width="97.619px" height="97.618px" viewBox="0 0 97.619 97.618" style="enable-background:new 0 0 97.619 97.618;"\n\t xml:space="preserve">\n<g>\n\t<path d="M96.939,17.358L83.968,5.959c-0.398-0.352-0.927-0.531-1.449-0.494C81.99,5.5,81.496,5.743,81.146,6.142L34.1,59.688\n\t\tL17.372,37.547c-0.319-0.422-0.794-0.701-1.319-0.773c-0.524-0.078-1.059,0.064-1.481,0.385L0.794,47.567\n\t\tc-0.881,0.666-1.056,1.92-0.39,2.801l30.974,40.996c0.362,0.479,0.922,0.771,1.522,0.793c0.024,0,0.049,0,0.073,0\n\t\tc0.574,0,1.122-0.246,1.503-0.68l62.644-71.297C97.85,19.351,97.769,18.086,96.939,17.358z"/>\n</g></svg>';
};

},{}],25:[function(require,module,exports){
'use strict';

module.exports = function () {
    var p = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return '<svg version="1.1" data-js="' + (p.name || 'error') + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 18.978 18.978" style="enable-background:new 0 0 18.978 18.978;" xml:space="preserve">\n<g>\n    <path d="M16.088,1.675c-0.133-0.104-0.306-0.144-0.47-0.105c-0.013,0.002-1.261,0.29-2.594,0.29\n        c-1.788,0-2.789-0.476-2.975-1.415C9.999,0.191,9.779,0.007,9.521,0c-0.257-0.007-0.487,0.167-0.55,0.418\n        C8.727,1.386,7.71,1.877,5.95,1.877c-1.332,0-2.571-0.302-2.583-0.305c-0.166-0.04-0.34-0.004-0.474,0.102\n        C2.76,1.777,2.681,1.938,2.681,2.108v4.869c0,0.04,0.004,0.078,0.013,0.115c0.057,1.647,0.65,8.714,6.528,11.822\n        c0.08,0.043,0.169,0.064,0.258,0.064c0.092,0,0.183-0.021,0.266-0.066c5.74-3.137,6.445-10.115,6.532-11.791\n        c0.012-0.046,0.019-0.094,0.019-0.144V2.108C16.297,1.939,16.219,1.78,16.088,1.675z M15.19,6.857\n        c-0.007,0.031-0.012,0.064-0.013,0.097c-0.053,1.298-0.574,7.832-5.701,10.838c-5.215-2.965-5.646-9.526-5.68-10.83\n        c0-0.029-0.004-0.058-0.009-0.085V2.784C4.322,2.877,5.112,2.982,5.95,2.982c1.911,0,2.965-0.54,3.537-1.208\n        c0.553,0.661,1.599,1.191,3.536,1.191c0.839,0,1.631-0.101,2.166-0.188L15.19,6.857L15.19,6.857z"/>\n    <polygon points="10.241,11.237 10.529,5.311 8.449,5.311 8.75,11.237 \t\t"/>\n    <path d="M9.496,11.891c-0.694,0-1.178,0.498-1.178,1.189c0,0.682,0.471,1.191,1.178,1.191\n        c0.706,0,1.164-0.51,1.164-1.191C10.647,12.389,10.189,11.891,9.496,11.891z"/>\n</g></svg>';
};

},{}],26:[function(require,module,exports){
"use strict";

module.exports = {
    constructor: function constructor(data) {
        var _this = this;

        var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        Object.assign(this, { store: {}, data: data }, opts);

        if (this.storeBy) {
            this.storeBy.forEach(function (key) {
                return _this.store[key] = {};
            });
            this._store();
        }

        return this;
    },
    _store: function _store() {
        var _this2 = this;

        this.data.forEach(function (datum) {
            return _this2.storeBy.forEach(function (attr) {
                return _this2._storeAttr(datum, attr);
            });
        });
    },
    _storeAttr: function _storeAttr(datum, attr) {
        this.store[attr][datum[attr]] = this.store[attr][datum[attr]] ? Array.isArray(this.store[attr][datum[attr]]) ? this.store[attr][datum[attr]].concat(datum) : [this.store[attr][datum[attr]], datum] : datum;
    }
};

},{}],27:[function(require,module,exports){
"use strict";

module.exports = function (err) {
  console.log(err.stack || err);
};

},{}],28:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

module.exports = {
    getIntRange: function getIntRange(int) {
        return Array.from(Array(int).keys());
    },
    getRandomInclusiveInteger: function getRandomInclusiveInteger(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    omit: function omit(obj, keys) {
        return Object.keys(obj).filter(function (key) {
            return !keys.includes(key);
        }).reduce(function (memo, key) {
            return Object.assign(memo, _defineProperty({}, key, obj[key]));
        }, {});
    },
    pick: function pick(obj, keys) {
        return keys.reduce(function (memo, key) {
            return Object.assign(memo, _defineProperty({}, key, obj[key]));
        }, {});
    },


    Error: require('./MyError'),

    P: function P(fun) {
        var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var thisArg = arguments[2];
        return new Promise(function (resolve, reject) {
            return Reflect.apply(fun, thisArg || undefined, args.concat(function (e) {
                for (var _len = arguments.length, callback = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    callback[_key - 1] = arguments[_key];
                }

                return e ? reject(e) : resolve(callback);
            }));
        });
    },

    constructor: function constructor() {
        return this;
    }
};

},{"./MyError":27}],29:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],30:[function(require,module,exports){
/*
 * smoothscroll polyfill - v0.3.5
 * https://iamdustan.github.io/smoothscroll
 * 2016 (c) Dustan Kasten, Jeremias Menichelli - MIT License
 */

(function(w, d, undefined) {
  'use strict';

  /*
   * aliases
   * w: window global object
   * d: document
   * undefined: undefined
   */

  // polyfill
  function polyfill() {
    // return when scrollBehavior interface is supported
    if ('scrollBehavior' in d.documentElement.style) {
      return;
    }

    /*
     * globals
     */
    var Element = w.HTMLElement || w.Element;
    var SCROLL_TIME = 468;

    /*
     * object gathering original scroll methods
     */
    var original = {
      scroll: w.scroll || w.scrollTo,
      scrollBy: w.scrollBy,
      elScroll: Element.prototype.scroll || scrollElement,
      scrollIntoView: Element.prototype.scrollIntoView
    };

    /*
     * define timing method
     */
    var now = w.performance && w.performance.now
      ? w.performance.now.bind(w.performance) : Date.now;

    /**
     * changes scroll position inside an element
     * @method scrollElement
     * @param {Number} x
     * @param {Number} y
     */
    function scrollElement(x, y) {
      this.scrollLeft = x;
      this.scrollTop = y;
    }

    /**
     * returns result of applying ease math function to a number
     * @method ease
     * @param {Number} k
     * @returns {Number}
     */
    function ease(k) {
      return 0.5 * (1 - Math.cos(Math.PI * k));
    }

    /**
     * indicates if a smooth behavior should be applied
     * @method shouldBailOut
     * @param {Number|Object} x
     * @returns {Boolean}
     */
    function shouldBailOut(x) {
      if (typeof x !== 'object'
            || x === null
            || x.behavior === undefined
            || x.behavior === 'auto'
            || x.behavior === 'instant') {
        // first arg not an object/null
        // or behavior is auto, instant or undefined
        return true;
      }

      if (typeof x === 'object'
            && x.behavior === 'smooth') {
        // first argument is an object and behavior is smooth
        return false;
      }

      // throw error when behavior is not supported
      throw new TypeError('behavior not valid');
    }

    /**
     * finds scrollable parent of an element
     * @method findScrollableParent
     * @param {Node} el
     * @returns {Node} el
     */
    function findScrollableParent(el) {
      var isBody;
      var hasScrollableSpace;
      var hasVisibleOverflow;

      do {
        el = el.parentNode;

        // set condition variables
        isBody = el === d.body;
        hasScrollableSpace =
          el.clientHeight < el.scrollHeight ||
          el.clientWidth < el.scrollWidth;
        hasVisibleOverflow =
          w.getComputedStyle(el, null).overflow === 'visible';
      } while (!isBody && !(hasScrollableSpace && !hasVisibleOverflow));

      isBody = hasScrollableSpace = hasVisibleOverflow = null;

      return el;
    }

    /**
     * self invoked function that, given a context, steps through scrolling
     * @method step
     * @param {Object} context
     */
    function step(context) {
      var time = now();
      var value;
      var currentX;
      var currentY;
      var elapsed = (time - context.startTime) / SCROLL_TIME;

      // avoid elapsed times higher than one
      elapsed = elapsed > 1 ? 1 : elapsed;

      // apply easing to elapsed time
      value = ease(elapsed);

      currentX = context.startX + (context.x - context.startX) * value;
      currentY = context.startY + (context.y - context.startY) * value;

      context.method.call(context.scrollable, currentX, currentY);

      // scroll more if we have not reached our destination
      if (currentX !== context.x || currentY !== context.y) {
        w.requestAnimationFrame(step.bind(w, context));
      }
    }

    /**
     * scrolls window with a smooth behavior
     * @method smoothScroll
     * @param {Object|Node} el
     * @param {Number} x
     * @param {Number} y
     */
    function smoothScroll(el, x, y) {
      var scrollable;
      var startX;
      var startY;
      var method;
      var startTime = now();

      // define scroll context
      if (el === d.body) {
        scrollable = w;
        startX = w.scrollX || w.pageXOffset;
        startY = w.scrollY || w.pageYOffset;
        method = original.scroll;
      } else {
        scrollable = el;
        startX = el.scrollLeft;
        startY = el.scrollTop;
        method = scrollElement;
      }

      // scroll looping over a frame
      step({
        scrollable: scrollable,
        method: method,
        startTime: startTime,
        startX: startX,
        startY: startY,
        x: x,
        y: y
      });
    }

    /*
     * ORIGINAL METHODS OVERRIDES
     */

    // w.scroll and w.scrollTo
    w.scroll = w.scrollTo = function() {
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0])) {
        original.scroll.call(
          w,
          arguments[0].left || arguments[0],
          arguments[0].top || arguments[1]
        );
        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      smoothScroll.call(
        w,
        d.body,
        ~~arguments[0].left,
        ~~arguments[0].top
      );
    };

    // w.scrollBy
    w.scrollBy = function() {
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0])) {
        original.scrollBy.call(
          w,
          arguments[0].left || arguments[0],
          arguments[0].top || arguments[1]
        );
        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      smoothScroll.call(
        w,
        d.body,
        ~~arguments[0].left + (w.scrollX || w.pageXOffset),
        ~~arguments[0].top + (w.scrollY || w.pageYOffset)
      );
    };

    // Element.prototype.scroll and Element.prototype.scrollTo
    Element.prototype.scroll = Element.prototype.scrollTo = function() {
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0])) {
        original.elScroll.call(
            this,
            arguments[0].left || arguments[0],
            arguments[0].top || arguments[1]
        );
        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      smoothScroll.call(
          this,
          this,
          arguments[0].left,
          arguments[0].top
      );
    };

    // Element.prototype.scrollBy
    Element.prototype.scrollBy = function() {
      var arg0 = arguments[0];

      if (typeof arg0 === 'object') {
        this.scroll({
          left: arg0.left + this.scrollLeft,
          top: arg0.top + this.scrollTop,
          behavior: arg0.behavior
        });
      } else {
        this.scroll(
          this.scrollLeft + arg0,
          this.scrollTop + arguments[1]
        );
      }
    };

    // Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = function() {
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0])) {
        original.scrollIntoView.call(this, arguments[0] || true);
        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      var scrollableParent = findScrollableParent(this);
      var parentRects = scrollableParent.getBoundingClientRect();
      var clientRects = this.getBoundingClientRect();

      if (scrollableParent !== d.body) {
        // reveal element inside parent
        smoothScroll.call(
          this,
          scrollableParent,
          scrollableParent.scrollLeft + clientRects.left - parentRects.left,
          scrollableParent.scrollTop + clientRects.top - parentRects.top
        );
        // reveal parent in viewport
        w.scrollBy({
          left: parentRects.left,
          top: parentRects.top,
          behavior: 'smooth'
        });
      } else {
        // reveal element in viewport
        w.scrollBy({
          left: clientRects.left,
          top: clientRects.top,
          behavior: 'smooth'
        });
      }
    };
  }

  if (typeof exports === 'object') {
    // commonjs
    module.exports = { polyfill: polyfill };
  } else {
    // global
    polyfill();
  }
})(window, document);

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvanMvLlRlbXBsYXRlTWFwLmpzIiwiY2xpZW50L2pzLy5WaWV3TWFwLmpzIiwiY2xpZW50L2pzL1hoci5qcyIsImNsaWVudC9qcy9mYWN0b3J5L1ZpZXcuanMiLCJjbGllbnQvanMvbWFpbi5qcyIsImNsaWVudC9qcy9tb2RlbHMvUGVyc29uLmpzIiwiY2xpZW50L2pzL21vZGVscy9fX3Byb3RvX18uanMiLCJjbGllbnQvanMvcG9seWZpbGwuanMiLCJjbGllbnQvanMvcm91dGVyLmpzIiwiY2xpZW50L2pzL3ZpZXdzL0Zvb3Rlci5qcyIsImNsaWVudC9qcy92aWV3cy9IZWFkZXIuanMiLCJjbGllbnQvanMvdmlld3MvSG9tZS5qcyIsImNsaWVudC9qcy92aWV3cy9JbnRlcm5ldC5qcyIsImNsaWVudC9qcy92aWV3cy9TZXJ2aWNlcy5qcyIsImNsaWVudC9qcy92aWV3cy9Ub2FzdC5qcyIsImNsaWVudC9qcy92aWV3cy9fX3Byb3RvX18uanMiLCJjbGllbnQvanMvdmlld3MvbGliL09wdGltaXplZFJlc2l6ZS5qcyIsImNsaWVudC9qcy92aWV3cy90ZW1wbGF0ZXMvRm9vdGVyLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9IZWFkZXIuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL0hvbWUuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL0ludGVybmV0LmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9TZXJ2aWNlcy5qcyIsImNsaWVudC9qcy92aWV3cy90ZW1wbGF0ZXMvVG9hc3QuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi9jaGVja21hcmsuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi9lcnJvci5qcyIsImxpYi9Nb2RlbC5qcyIsImxpYi9NeUVycm9yLmpzIiwibGliL015T2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCJub2RlX21vZHVsZXMvc21vb3Roc2Nyb2xsLXBvbHlmaWxsL2Rpc3Qvc21vb3Roc2Nyb2xsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxPQUFPLE9BQVAsR0FBZTtBQUNkLFNBQVEsUUFBUSwwQkFBUixDQURNO0FBRWQsU0FBUSxRQUFRLDBCQUFSLENBRk07QUFHZCxPQUFNLFFBQVEsd0JBQVIsQ0FIUTtBQUlkLFdBQVUsUUFBUSw0QkFBUixDQUpJO0FBS2QsV0FBVSxRQUFRLDRCQUFSLENBTEk7QUFNZCxRQUFPLFFBQVEseUJBQVI7QUFOTyxDQUFmOzs7OztBQ0FBLE9BQU8sT0FBUCxHQUFlO0FBQ2QsU0FBUSxRQUFRLGdCQUFSLENBRE07QUFFZCxTQUFRLFFBQVEsZ0JBQVIsQ0FGTTtBQUdkLE9BQU0sUUFBUSxjQUFSLENBSFE7QUFJZCxXQUFVLFFBQVEsa0JBQVIsQ0FKSTtBQUtkLFdBQVUsUUFBUSxrQkFBUixDQUxJO0FBTWQsUUFBTyxRQUFRLGVBQVI7QUFOTyxDQUFmOzs7OztBQ0FBLE9BQU8sT0FBUCxHQUFpQixPQUFPLE1BQVAsQ0FBZSxPQUFPLE1BQVAsQ0FBZSxFQUFmLEVBQW1CLFFBQVEsb0JBQVIsQ0FBbkIsRUFBa0Q7O0FBRTlFLGFBQVM7QUFFTCxtQkFGSyx1QkFFUSxJQUZSLEVBRWU7QUFBQTs7QUFDaEIsZ0JBQUksTUFBTSxJQUFJLGNBQUosRUFBVjs7QUFFQSxnQkFBSSxLQUFLLFVBQVQsRUFBc0IsSUFBSSxnQkFBSixDQUFzQixVQUF0QixFQUFrQztBQUFBLHVCQUNwRCxLQUFLLFVBQUwsQ0FBaUIsRUFBRSxnQkFBRixHQUFxQixLQUFLLEtBQUwsQ0FBYyxFQUFFLE1BQUYsR0FBVyxFQUFFLEtBQWYsR0FBeUIsR0FBckMsQ0FBckIsR0FBa0UsQ0FBbkYsQ0FEb0Q7QUFBQSxhQUFsQzs7QUFJdEIsbUJBQU8sSUFBSSxPQUFKLENBQWEsVUFBRSxPQUFGLEVBQVcsTUFBWCxFQUF1Qjs7QUFFdkMsb0JB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cz17XG5cdEZvb3RlcjogcmVxdWlyZSgnLi92aWV3cy90ZW1wbGF0ZXMvRm9vdGVyJyksXG5cdEhlYWRlcjogcmVxdWlyZSgnLi92aWV3cy90ZW1wbGF0ZXMvSGVhZGVyJyksXG5cdEhvbWU6IHJlcXVpcmUoJy4vdmlld3MvdGVtcGxhdGVzL0hvbWUnKSxcblx0SW50ZXJuZXQ6IHJlcXVpcmUoJy4vdmlld3MvdGVtcGxhdGVzL0ludGVybmV0JyksXG5cdFNlcnZpY2VzOiByZXF1aXJlKCcuL3ZpZXdzL3RlbXBsYXRlcy9TZXJ2aWNlcycpLFxuXHRUb2FzdDogcmVxdWlyZSgnLi92aWV3cy90ZW1wbGF0ZXMvVG9hc3QnKVxufSIsIm1vZHVsZS5leHBvcnRzPXtcblx0Rm9vdGVyOiByZXF1aXJlKCcuL3ZpZXdzL0Zvb3RlcicpLFxuXHRIZWFkZXI6IHJlcXVpcmUoJy4vdmlld3MvSGVhZGVyJyksXG5cdEhvbWU6IHJlcXVpcmUoJy4vdmlld3MvSG9tZScpLFxuXHRJbnRlcm5ldDogcmVxdWlyZSgnLi92aWV3cy9JbnRlcm5ldCcpLFxuXHRTZXJ2aWNlczogcmVxdWlyZSgnLi92aWV3cy9TZXJ2aWNlcycpLFxuXHRUb2FzdDogcmVxdWlyZSgnLi92aWV3cy9Ub2FzdCcpXG59IiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi4vLi4vbGliL015T2JqZWN0JyksIHtcblxuICAgIFJlcXVlc3Q6IHtcblxuICAgICAgICBjb25zdHJ1Y3RvciggZGF0YSApIHtcbiAgICAgICAgICAgIGxldCByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICAgICAgICBpZiggZGF0YS5vblByb2dyZXNzICkgcmVxLmFkZEV2ZW50TGlzdGVuZXIoIFwicHJvZ3Jlc3NcIiwgZSA9PlxuICAgICAgICAgICAgICAgIGRhdGEub25Qcm9ncmVzcyggZS5sZW5ndGhDb21wdXRhYmxlID8gTWF0aC5mbG9vciggKCBlLmxvYWRlZCAvIGUudG90YWwgKSAqIDEwMCApIDogMCApIFxuICAgICAgICAgICAgKVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xuXG4gICAgICAgICAgICAgICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBbIDUwMCwgNDA0LCA0MDEgXS5pbmNsdWRlcyggdGhpcy5zdGF0dXMgKVxuICAgICAgICAgICAgICAgICAgICAgICAgPyByZWplY3QoIEpTT04ucGFyc2UoIHRoaXMucmVzcG9uc2UgKSApXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHJlc29sdmUoIEpTT04ucGFyc2UoIHRoaXMucmVzcG9uc2UgKSApXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYoIGRhdGEubWV0aG9kID09PSBcImdldFwiIHx8IGRhdGEubWV0aG9kID09PSBcIm9wdGlvbnNcIiApIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHFzID0gZGF0YS5xcyA/IGA/JHtkYXRhLnFzfWAgOiAnJyBcbiAgICAgICAgICAgICAgICAgICAgcmVxLm9wZW4oIGRhdGEubWV0aG9kLCBgLyR7ZGF0YS5yZXNvdXJjZX0ke3FzfWAgKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEhlYWRlcnMoIHJlcSwgZGF0YS5oZWFkZXJzIClcbiAgICAgICAgICAgICAgICAgICAgcmVxLnNlbmQobnVsbClcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXRoID0gYC8ke2RhdGEucmVzb3VyY2V9YCArICggZGF0YS5pZCA/IGAvJHtkYXRhLmlkfWAgOiAnJyApO1xuICAgICAgICAgICAgICAgICAgICByZXEub3BlbiggZGF0YS5tZXRob2QudG9VcHBlckNhc2UoKSwgcGF0aCwgdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRIZWFkZXJzKCByZXEsIGRhdGEuaGVhZGVycyApXG4gICAgICAgICAgICAgICAgICAgIHJlcS5zZW5kKCBkYXRhLmRhdGEgfHwgbnVsbCApXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYoIGRhdGEub25Qcm9ncmVzcyApIGRhdGEub25Qcm9ncmVzcyggJ3NlbnQnIClcbiAgICAgICAgICAgIH0gKVxuICAgICAgICB9LFxuXG4gICAgICAgIHBsYWluRXNjYXBlKCBzVGV4dCApIHtcbiAgICAgICAgICAgIC8qIGhvdyBzaG91bGQgSSB0cmVhdCBhIHRleHQvcGxhaW4gZm9ybSBlbmNvZGluZz8gd2hhdCBjaGFyYWN0ZXJzIGFyZSBub3QgYWxsb3dlZD8gdGhpcyBpcyB3aGF0IEkgc3VwcG9zZS4uLjogKi9cbiAgICAgICAgICAgIC8qIFwiNFxcM1xcNyAtIEVpbnN0ZWluIHNhaWQgRT1tYzJcIiAtLS0tPiBcIjRcXFxcM1xcXFw3XFwgLVxcIEVpbnN0ZWluXFwgc2FpZFxcIEVcXD1tYzJcIiAqL1xuICAgICAgICAgICAgcmV0dXJuIHNUZXh0LnJlcGxhY2UoL1tcXHNcXD1cXFxcXS9nLCBcIlxcXFwkJlwiKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRIZWFkZXJzKCByZXEsIGhlYWRlcnM9e30gKSB7XG4gICAgICAgICAgICByZXEuc2V0UmVxdWVzdEhlYWRlciggXCJBY2NlcHRcIiwgaGVhZGVycy5hY2NlcHQgfHwgJ2FwcGxpY2F0aW9uL2pzb24nIClcbiAgICAgICAgICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKCBcIkNvbnRlbnQtVHlwZVwiLCBoZWFkZXJzLmNvbnRlbnRUeXBlIHx8ICd0ZXh0L3BsYWluJyApXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX2ZhY3RvcnkoIGRhdGEgKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuY3JlYXRlKCB0aGlzLlJlcXVlc3QsIHsgfSApLmNvbnN0cnVjdG9yKCBkYXRhIClcbiAgICB9LFxuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgaWYoICFYTUxIdHRwUmVxdWVzdC5wcm90b3R5cGUuc2VuZEFzQmluYXJ5ICkge1xuICAgICAgICAgIFhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZS5zZW5kQXNCaW5hcnkgPSBmdW5jdGlvbihzRGF0YSkge1xuICAgICAgICAgICAgdmFyIG5CeXRlcyA9IHNEYXRhLmxlbmd0aCwgdWk4RGF0YSA9IG5ldyBVaW50OEFycmF5KG5CeXRlcyk7XG4gICAgICAgICAgICBmb3IgKHZhciBuSWR4ID0gMDsgbklkeCA8IG5CeXRlczsgbklkeCsrKSB7XG4gICAgICAgICAgICAgIHVpOERhdGFbbklkeF0gPSBzRGF0YS5jaGFyQ29kZUF0KG5JZHgpICYgMHhmZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2VuZCh1aThEYXRhKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZhY3RvcnkuYmluZCh0aGlzKVxuICAgIH1cblxufSApLCB7IH0gKS5jb25zdHJ1Y3RvcigpXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIHtcblxuICAgIGNyZWF0ZSggbmFtZSwgb3B0cyApIHtcbiAgICAgICAgY29uc3QgbG93ZXIgPSBuYW1lXG4gICAgICAgIG5hbWUgPSBuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zbGljZSgxKVxuICAgICAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZShcbiAgICAgICAgICAgIHRoaXMuVmlld3NbIG5hbWUgXSxcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oIHtcbiAgICAgICAgICAgICAgICBUb2FzdDogeyB2YWx1ZTogdGhpcy5Ub2FzdCB9LFxuICAgICAgICAgICAgICAgIG5hbWU6IHsgdmFsdWU6IG5hbWUgfSxcbiAgICAgICAgICAgICAgICBmYWN0b3J5OiB7IHZhbHVlOiB0aGlzIH0sXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IHsgdmFsdWU6IHRoaXMuVGVtcGxhdGVzWyBuYW1lIF0gfSxcbiAgICAgICAgICAgIH0sIG9wdHMgKVxuICAgICAgICApLmNvbnN0cnVjdG9yKClcbiAgICB9LFxuXG59LCB7XG4gICAgVGVtcGxhdGVzOiB7IHZhbHVlOiByZXF1aXJlKCcuLi8uVGVtcGxhdGVNYXAnKSB9LFxuICAgIFRvYXN0OiB7IHZhbHVlOiByZXF1aXJlKCcuLi92aWV3cy9Ub2FzdCcpIH0sXG4gICAgVmlld3M6IHsgdmFsdWU6IHJlcXVpcmUoJy4uLy5WaWV3TWFwJykgfVxufSApXG4iLCJcbmNvbnN0IHJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVyJyksXG4gICAgb25Mb2FkID0gbmV3IFByb21pc2UoIHJlc29sdmUgPT4gd2luZG93Lm9ubG9hZCA9ICgpID0+IHJlc29sdmUoKSApXG5cbnJlcXVpcmUoJy4vcG9seWZpbGwnKVxuXG5vbkxvYWQudGhlbiggKCkgPT4gcm91dGVyLmluaXRpYWxpemUoKSApXG4uY2F0Y2goIGUgPT4gY29uc29sZS5sb2coIGBFcnJvciBpbml0aWFsaXppbmcgY2xpZW50IC0+ICR7ZS5zdGFjayB8fCBlfWAgKSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG5cbiAgICBkYXRhOiB7IH0sXG4gICAgXG4gICAgZmllbGRzOiB7XG4gICAgICAgIG5hbWU6IHtcbiAgICAgICAgICAgIGVycm9yOiAnUGxlYXNlIGVudGVyIHlvdXIgbmFtZSdcbiAgICAgICAgfSxcbiAgICAgICAgY29udGFjdDoge1xuICAgICAgICAgICAgZXJyb3I6ICdQbGVhc2UgZW50ZXIgYSB2YWxpZCBlbWFpbCBhZGRyZXNzIG9yIHBob25lIG51bWJlcidcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZXNvdXJjZTogJ3BlcnNvbicsXG5cbiAgICB2YWxpZGF0ZSggZmllbGQsIHZhbHVlICkge1xuICAgICAgICBjb25zdCB2YWwgPSB2YWx1ZS50cmltKClcblxuICAgICAgICBpZiggZmllbGQgPT09ICduYW1lJyAmJiB2YWwgPT09IFwiXCIgKSByZXR1cm4gZmFsc2VcblxuICAgICAgICBpZiggZmllbGQgPT09ICdjb250YWN0JyAmJiAoICF0aGlzLl9lbWFpbFJlZ2V4LnRlc3QoIHZhbCApICYmICF0aGlzLl9waG9uZVJlZ2V4LnRlc3QoIHZhbCApICkgKSByZXR1cm4gZmFsc2VcblxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH0sXG5cbiAgICBfZW1haWxSZWdleDogL15cXHcrKFtcXC4tXT9cXHcrKSpAXFx3KyhbXFwuLV0/XFx3KykqKFxcLlxcd3syLDN9KSskLyxcblxuICAgIF9waG9uZVJlZ2V4OiAvXlxcKD8oXFxkezN9KVxcKT9bLS4gXT8oXFxkezN9KVstLiBdPyhcXGR7NH0pJC9cblxufSApIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7IH0sIHJlcXVpcmUoJy4uLy4uLy4uL2xpYi9NeU9iamVjdCcpLCByZXF1aXJlKCcuLi8uLi8uLi9saWIvTW9kZWwnKSwgcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyLnByb3RvdHlwZSwge1xuXG4gICAgWGhyOiByZXF1aXJlKCcuLi9YaHInKSxcblxuICAgIGRlbGV0ZSggaWQgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLlhociggeyBtZXRob2Q6ICdERUxFVEUnLCByZXNvdXJjZTogdGhpcy5yZXNvdXJjZSwgaWQgfSApXG4gICAgICAgIC50aGVuKCBpZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBkYXR1bSA9IHRoaXMuZGF0YS5maW5kKCBkYXR1bSA9PiBkYXR1bS5pZCA9PSBpZCApXG5cbiAgICAgICAgICAgIGlmKCB0aGlzLnN0b3JlICkge1xuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKCB0aGlzLnN0b3JlICkuZm9yRWFjaCggYXR0ciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcmVbIGF0dHIgXVsgZGF0dW1bIGF0dHIgXSBdID0gdGhpcy5zdG9yZVsgYXR0ciBdWyBkYXR1bVsgYXR0ciBdIF0uZmlsdGVyKCBkYXR1bSA9PiBkYXR1bS5pZCAhPSBpZCApXG4gICAgICAgICAgICAgICAgICAgIGlmKCB0aGlzLnN0b3JlWyBhdHRyIF1bIGRhdHVtWyBhdHRyIF0gXS5sZW5ndGggPT09IDAgKSB7IHRoaXMuc3RvcmVbIGF0dHIgXVsgZGF0dW1bIGF0dHIgXSBdID0gdW5kZWZpbmVkIH1cbiAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5kYXRhLmZpbHRlciggZGF0dW0gPT4gZGF0dW0uaWQgIT0gaWQgKVxuICAgICAgICAgICAgaWYoIHRoaXMuaWRzICkgZGVsZXRlIHRoaXMuaWRzW2lkXVxuXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGlkKVxuICAgICAgICB9IClcbiAgICB9LFxuXG4gICAgZ2V0KCBvcHRzPXsgcXVlcnk6e30gfSApIHtcbiAgICAgICAgaWYoIG9wdHMucXVlcnkgfHwgdGhpcy5wYWdpbmF0aW9uICkgT2JqZWN0LmFzc2lnbiggb3B0cy5xdWVyeSwgdGhpcy5wYWdpbmF0aW9uIClcblxuICAgICAgICByZXR1cm4gdGhpcy5YaHIoIHsgbWV0aG9kOiBvcHRzLm1ldGhvZCB8fCAnZ2V0JywgcmVzb3VyY2U6IHRoaXMucmVzb3VyY2UsIGhlYWRlcnM6IHRoaXMuaGVhZGVycyB8fCB7fSwgcXM6IG9wdHMucXVlcnkgPyBKU09OLnN0cmluZ2lmeSggb3B0cy5xdWVyeSApIDogdW5kZWZpbmVkIH0gKVxuICAgICAgICAudGhlbiggcmVzcG9uc2UgPT4ge1xuXG4gICAgICAgICAgICBpZiggb3B0cy5zdG9yZUJ5ICkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcmUgPSB7IH1cbiAgICAgICAgICAgICAgICBvcHRzLnN0b3JlQnkuZm9yRWFjaCggYXR0ciA9PiB0aGlzLnN0b3JlWyBhdHRyIF0gPSB7IH0gKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLnBhcnNlXG4gICAgICAgICAgICAgICAgPyB0aGlzLnBhcnNlKCByZXNwb25zZSwgb3B0cy5zdG9yZUJ5IClcbiAgICAgICAgICAgICAgICA6IG9wdHMuc3RvcmVCeVxuICAgICAgICAgICAgICAgICAgICA/IHRoaXMuc3RvcmVCeSggcmVzcG9uc2UgKVxuICAgICAgICAgICAgICAgICAgICA6IHJlc3BvbnNlXG5cbiAgICAgICAgICAgIHRoaXMuZW1pdCgnZ290JylcblxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLmRhdGEpXG4gICAgICAgIH0gKVxuICAgIH0sXG5cbiAgICBwYXRjaCggaWQsIGRhdGEsIG9wdHM9e30gKSB7XG4gICAgICAgIHJldHVybiB0aGlzLlhociggeyBtZXRob2Q6ICdwYXRjaCcsIGlkLCByZXNvdXJjZTogdGhpcy5yZXNvdXJjZSwgaGVhZGVyczogdGhpcy5oZWFkZXJzIHx8IHt9LCBkYXRhOiBKU09OLnN0cmluZ2lmeSggZGF0YSB8fCB0aGlzLmRhdGEgKSB9IClcbiAgICAgICAgLnRoZW4oIHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIGlmKCBBcnJheS5pc0FycmF5KCB0aGlzLmRhdGEgKSApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLmRhdGEgPyB0aGlzLmRhdGEuY29uY2F0KCByZXNwb25zZSApIDogWyByZXNwb25zZSBdXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuc3RvcmUgKSBPYmplY3Qua2V5cyggdGhpcy5zdG9yZSApLmZvckVhY2goIGF0dHIgPT4gdGhpcy5fc3RvcmUoIHJlc3BvbnNlLCBhdHRyICkgKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCByZXNwb25zZSApXG4gICAgICAgIH0gKVxuICAgIH0sXG5cbiAgICBwb3N0KCBtb2RlbCwgb3B0cz17fSApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuWGhyKCB7IG1ldGhvZDogJ3Bvc3QnLCByZXNvdXJjZTogdGhpcy5yZXNvdXJjZSwgaGVhZGVyczogdGhpcy5oZWFkZXJzIHx8IHt9LCBkYXRhOiBKU09OLnN0cmluZ2lmeSggbW9kZWwgfHwgdGhpcy5kYXRhICkgfSApXG4gICAgICAgIC50aGVuKCByZXNwb25zZSA9PiB7XG4gICAgICAgICAgICBpZiggQXJyYXkuaXNBcnJheSggdGhpcy5kYXRhICkgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5kYXRhID8gdGhpcy5kYXRhLmNvbmNhdCggcmVzcG9uc2UgKSA6IFsgcmVzcG9uc2UgXVxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLnN0b3JlICkgT2JqZWN0LmtleXMoIHRoaXMuc3RvcmUgKS5mb3JFYWNoKCBhdHRyID0+IHRoaXMuX3N0b3JlKCByZXNwb25zZSwgYXR0ciApIClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSggcmVzcG9uc2UgKVxuICAgICAgICB9IClcbiAgICB9LFxuXG4gICAgc3RvcmVCeSggZGF0YSApIHtcblxuICAgICAgICBkYXRhLmZvckVhY2goIGRhdHVtID0+IE9iamVjdC5rZXlzKCB0aGlzLnN0b3JlICkuZm9yRWFjaCggYXR0ciA9PiB0aGlzLl9zdG9yZSggZGF0dW0sIGF0dHIgKSApIClcblxuICAgICAgICByZXR1cm4gZGF0YVxuICAgIH0sXG5cbiAgICBfc3RvcmUoIGRhdHVtLCBhdHRyICkge1xuICAgICAgICBpZiggIXRoaXMuc3RvcmVbIGF0dHIgXVsgZGF0dW1bIGF0dHIgXSBdICkgdGhpcy5zdG9yZVsgYXR0ciBdWyBkYXR1bVsgYXR0ciBdIF0gPSBbIF1cbiAgICAgICAgdGhpcy5zdG9yZVsgYXR0ciBdWyBkYXR1bVsgYXR0ciBdIF0ucHVzaCggZGF0dW0gKVxuICAgIH1cblxufSApXG4iLCIvL2h0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9FbGVtZW50L2Nsb3Nlc3RcbmlmICh3aW5kb3cuRWxlbWVudCAmJiAhRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdCkge1xuICAgIEVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QgPSBcbiAgICBmdW5jdGlvbihzKSB7XG4gICAgICAgIHZhciBtYXRjaGVzID0gKHRoaXMuZG9jdW1lbnQgfHwgdGhpcy5vd25lckRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKHMpLFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIGVsID0gdGhpcztcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgaSA9IG1hdGNoZXMubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUgKC0taSA+PSAwICYmIG1hdGNoZXMuaXRlbShpKSAhPT0gZWwpIHt9O1xuICAgICAgICB9IHdoaWxlICgoaSA8IDApICYmIChlbCA9IGVsLnBhcmVudEVsZW1lbnQpKTsgXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9O1xufVxuXG4vL2h0dHBzOi8vZ2lzdC5naXRodWIuY29tL3BhdWxpcmlzaC8xNTc5NjcxXG5jb25zdCByZXF1ZXN0QW5pbWF0aW9uRnJhbWVQb2x5ZmlsbCA9ICgoKSA9PiB7XG4gICAgbGV0IGNsb2NrID0gRGF0ZS5ub3coKTtcblxuICAgIHJldHVybiAoY2FsbGJhY2spID0+IHtcblxuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IERhdGUubm93KCk7XG5cbiAgICAgICAgaWYgKGN1cnJlbnRUaW1lIC0gY2xvY2sgPiAxNikge1xuICAgICAgICAgICAgY2xvY2sgPSBjdXJyZW50VGltZTtcbiAgICAgICAgICAgIGNhbGxiYWNrKGN1cnJlbnRUaW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHBvbHlmaWxsKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICB9XG4gICAgfTtcbn0pKCk7XG5cbndpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICAgIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWVQb2x5ZmlsbFxuXG5yZXF1aXJlKCdzbW9vdGhzY3JvbGwtcG9seWZpbGwnKS5wb2x5ZmlsbCgpXG5cbm1vZHVsZS5leHBvcnRzID0gdHJ1ZVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCB7XG5cbiAgICBFcnJvcjogcmVxdWlyZSgnLi4vLi4vbGliL015RXJyb3InKSxcbiAgICBcbiAgICBWaWV3RmFjdG9yeTogcmVxdWlyZSgnLi9mYWN0b3J5L1ZpZXcnKSxcbiAgICBcbiAgICBWaWV3czogcmVxdWlyZSgnLi8uVmlld01hcCcpLFxuXG4gICAgVG9hc3Q6IHJlcXVpcmUoJy4vdmlld3MvVG9hc3QnKSxcblxuICAgIGNhcGl0YWxpemVGaXJzdExldHRlcjogc3RyaW5nID0+IHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zbGljZSgxKSxcblxuICAgIGluaXRpYWxpemUoKSB7XG5cbiAgICAgICAgdGhpcy5jb250ZW50Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvbnRlbnQnKVxuXG4gICAgICAgIHRoaXMuVG9hc3QuY29uc3RydWN0b3IoKVxuXG4gICAgICAgIHdpbmRvdy5vbnBvcHN0YXRlID0gdGhpcy5oYW5kbGUuYmluZCh0aGlzKVxuXG4gICAgICAgIHRoaXMuaGVhZGVyID1cbiAgICAgICAgICAgIHRoaXMuVmlld0ZhY3RvcnkuY3JlYXRlKFxuICAgICAgICAgICAgICAgICdoZWFkZXInLFxuICAgICAgICAgICAgICAgIHsgaW5zZXJ0aW9uOiB7IHZhbHVlOiB7IGVsOiB0aGlzLmNvbnRlbnRDb250YWluZXIsIG1ldGhvZDogJ2luc2VydEJlZm9yZScgfSB9IH1cbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5vbiggJ25hdmlnYXRlJywgcm91dGUgPT4gdGhpcy5uYXZpZ2F0ZSggcm91dGUgKSApXG5cbiAgICAgICAgdGhpcy5mb290ZXIgPVxuICAgICAgICAgICAgdGhpcy5WaWV3RmFjdG9yeS5jcmVhdGUoXG4gICAgICAgICAgICAgICAgJ2Zvb3RlcicsXG4gICAgICAgICAgICAgICAgeyBpbnNlcnRpb246IHsgdmFsdWU6IHsgZWw6IHRoaXMuY29udGVudENvbnRhaW5lciwgbWV0aG9kOiAnYWZ0ZXInIH0gfSB9XG4gICAgICAgICAgICApXG5cbiAgICAgICAgdGhpcy5oYW5kbGUoKVxuICAgIH0sXG5cbiAgICBoYW5kbGUoKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlciggd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJykuc2xpY2UoMSkgKVxuICAgIH0sXG5cbiAgICBoYW5kbGVyKCBwYXRoICkge1xuICAgICAgICBjb25zdCB2aWV3ID0gdGhpcy5WaWV3c1sgdGhpcy5jYXBpdGFsaXplRmlyc3RMZXR0ZXIoIHBhdGhbMF0gKSBdID8gcGF0aFswXSA6ICdob21lJ1xuXG4gICAgICAgIGlmKCB2aWV3ID09PSB0aGlzLmN1cnJlbnRWaWV3ICkgcmV0dXJuIHRoaXMudmlld3NbIHZpZXcgXS5vbk5hdmlnYXRpb24oIHBhdGggKVxuXG4gICAgICAgIHRoaXMuc2Nyb2xsVG9Ub3AoKVxuXG4gICAgICAgIFByb21pc2UuYWxsKCBPYmplY3Qua2V5cyggdGhpcy52aWV3cyApLm1hcCggdmlldyA9PiB0aGlzLnZpZXdzWyB2aWV3IF0uaGlkZSgpICkgKVxuICAgICAgICAudGhlbiggKCkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdmlld1xuXG4gICAgICAgICAgICBpZiggdGhpcy52aWV3c1sgdmlldyBdICkgcmV0dXJuIHRoaXMudmlld3NbIHZpZXcgXS5vbk5hdmlnYXRpb24oIHBhdGggKVxuXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFxuICAgICAgICAgICAgICAgIHRoaXMudmlld3NbIHZpZXcgXSA9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuVmlld0ZhY3RvcnkuY3JlYXRlKCB2aWV3LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnRpb246IHsgdmFsdWU6IHsgZWw6IHRoaXMuY29udGVudENvbnRhaW5lciB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiB7IHZhbHVlOiBwYXRoLCB3cml0YWJsZTogdHJ1ZSB9XG4gICAgICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgICAgICAub24oICduYXZpZ2F0ZScsIHJvdXRlID0+IHRoaXMubmF2aWdhdGUoIHJvdXRlICkgKVxuICAgICAgICAgICAgICAgICAgICAub24oICdkZWxldGVkJywgKCkgPT4gZGVsZXRlIHRoaXMudmlld3NbIHZpZXcgXSApXG4gICAgICAgICAgICApXG4gICAgICAgIH0gKVxuICAgICAgICAuY2F0Y2goIHRoaXMuRXJyb3IgKVxuICAgIH0sXG5cbiAgICBuYXZpZ2F0ZSggbG9jYXRpb24gKSB7XG4gICAgICAgIGlmKCBsb2NhdGlvbiAhPT0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICkgaGlzdG9yeS5wdXNoU3RhdGUoIHt9LCAnJywgbG9jYXRpb24gKVxuICAgICAgICB0aGlzLmhhbmRsZSgpXG4gICAgfSxcblxuICAgIHNjcm9sbFRvVG9wKCkge1xuICAgICAgICB3aW5kb3cuc2Nyb2xsKCB7IHRvcDogMCwgbGVmdDogMCwgYmVoYXZpb3I6ICdzbW9vdGgnIH0gKVxuICAgIH0sXG5cbn0sIHsgY3VycmVudFZpZXc6IHsgdmFsdWU6ICcnLCB3cml0YWJsZTogdHJ1ZSB9LCB2aWV3czogeyB2YWx1ZTogeyB9IH0gfSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG4gICAgXG59IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbigge30sIHJlcXVpcmUoJy4vX19wcm90b19fJyksIHtcblxuICAgIGV2ZW50czoge1xuICAgICAgICBuYXY6ICdjbGljaydcbiAgICB9LFxuXG4gICAgb25OYXZDbGljayggZSApIHtcbiAgICAgICAgY29uc3QgaXRlbUVsID0gZS50YXJnZXQudGFnTmFtZSA9PT0gXCJMSVwiID8gZS50YXJnZXQgOiBlLnRhcmdldC5jbG9zZXN0KCdsaScpLFxuICAgICAgICAgICAgICBuYW1lID0gaXRlbUVsLmdldEF0dHJpYnV0ZSgnZGF0YS1uYW1lJylcblxuICAgICAgICB0aGlzLmVtaXQoICduYXZpZ2F0ZScsIG5hbWUgKVxuICAgIH1cblxufSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG5cbiAgICBldmVudHM6IHtcbiAgICAgICAgc2VydmljZXM6ICdjbGljaycsXG4gICAgICAgIGludGVybmV0OiAnY2xpY2snXG4gICAgfSxcblxuICAgIG9uSW50ZXJuZXRDbGljaygpIHsgdGhpcy5lbWl0KCAnbmF2aWdhdGUnLCAnaW50ZXJuZXQnICkgfSxcblxuICAgIG9uU2VydmljZXNDbGljaygpIHsgdGhpcy5lbWl0KCAnbmF2aWdhdGUnLCAnc2VydmljZXMnICkgfVxuICAgIFxufSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG5cbiAgICBldmVudHM6IHtcbiAgICAgICAgJ3N1Ym1pdEJ0bic6ICdjbGljaydcbiAgICB9LFxuXG4gICAgbW9kZWw6IE9iamVjdC5jcmVhdGUoIHJlcXVpcmUoJy4uL21vZGVscy9QZXJzb24nKSApLFxuXG4gICAgY2xlYXJGb3JtKCkge1xuICAgICAgICB0aGlzLmVscy5uYW1lLnZhbHVlID0gJydcbiAgICAgICAgdGhpcy5lbHMuY29udGFjdC52YWx1ZSA9ICcnXG4gICAgICAgIHRoaXMuZWxzLmFkZHJlc3MudmFsdWUgPSAnJ1xuICAgIH0sXG5cbiAgICBvblN1Ym1pdEJ0bkNsaWNrKCkge1xuICAgICAgICBpZiggdGhpcy5zdWJtaXR0aW5nICkgcmV0dXJuXG5cbiAgICAgICAgdGhpcy5vblN1Ym1pdFN0YXJ0KClcblxuICAgICAgICB0aGlzLnZhbGlkYXRlKClcbiAgICAgICAgLnRoZW4oIHJlc3VsdCA9PiB7XG4gICAgICAgICAgICBpZiggIXJlc3VsdCApIHJldHVybiBQcm9taXNlLnJlc29sdmUoIHRoaXMub25TdWJtaXRFbmQoKSApXG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vZGVsLnBvc3QoKVxuICAgICAgICAgICAgLnRoZW4oIHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5Ub2FzdC5zaG93TWVzc2FnZSggJ3N1Y2Nlc3MnLCBcIkluZm8gc2VudCEgV2UnbGwga2VlcCB5b3UgcG9zdGVkIVwiIClcbiAgICAgICAgICAgICAgICAudGhlbiggKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoICduYXZpZ2F0ZScsICcvJyApXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25TdWJtaXRFbmQoKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsZWFyRm9ybSgpXG4gICAgICAgICAgICAgICAgfSApXG4gICAgICAgICAgICB9IClcbiAgICAgICAgICAgIC5jYXRjaCggZSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5Ub2FzdC5zaG93TWVzc2FnZSggJ2Vycm9yJywgZSAmJiBlLm1lc3NhZ2UgPyBlLm1lc3NhZ2UgOiBgVGhlcmUgd2FzIGEgcHJvYmxlbS4gUGxlYXNlIHRyeSBhZ2FpbiBvciBjb250YWN0IHVzLmAgKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uU3VibWl0RW5kKClcbiAgICAgICAgICAgIH0gKVxuICAgICAgICB9IClcbiAgICAgICAgLmNhdGNoKCBlID0+IHsgdGhpcy5FcnJvcihlKTsgdGhpcy5zdWJtaXR0aW5nID0gZmFsc2UgfSApXG4gICAgfSxcblxuICAgIG9uU3VibWl0RW5kKCkge1xuICAgICAgICB0aGlzLnN1Ym1pdHRpbmcgPSBmYWxzZVxuICAgICAgICB0aGlzLmVscy5zdWJtaXRCdG4uY2xhc3NMaXN0LnJlbW92ZSgnc3VibWl0dGluZycpXG4gICAgfSxcbiAgICBcbiAgICBvblN1Ym1pdFN0YXJ0KCkge1xuICAgICAgICB0aGlzLnN1Ym1pdHRpbmcgPSB0cnVlXG4gICAgICAgIHRoaXMuZWxzLnN1Ym1pdEJ0bi5jbGFzc0xpc3QuYWRkKCdzdWJtaXR0aW5nJylcbiAgICB9LFxuXG4gICAgcG9zdFJlbmRlcigpIHtcbiAgICAgICAgT2JqZWN0LmtleXMoIHRoaXMuZWxzICkuZm9yRWFjaCggYXR0ciA9PiB7ICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0IGVsID0gdGhpcy5lbHNbIGF0dHIgXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggYXR0ciA9PT0gJ25hbWUnIHx8IGF0dHIgPT09ICdjb250YWN0JyApIGVsLmFkZEV2ZW50TGlzdGVuZXIoICdmb2N1cycsICgpID0+IGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2Vycm9yJykgKSAgICAgICBcbiAgICAgICAgfSApXG5cbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgdmFsaWRhdGUoKSB7XG4gICAgICAgIGxldCBydiA9IHRydWU7XG5cbiAgICAgICAgT2JqZWN0LmtleXMoIHRoaXMuZWxzICkuZm9yRWFjaCggYXR0ciA9PiB7ICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0IGVsID0gdGhpcy5lbHNbIGF0dHIgXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggYXR0ciAhPT0gJ25hbWUnICYmIGF0dHIgIT09ICdjb250YWN0JyApIHJldHVyblxuXG4gICAgICAgICAgICBpZiggcnYgPT09IHRydWUgJiYgIXRoaXMubW9kZWwudmFsaWRhdGUoIGF0dHIsIGVsLnZhbHVlICkgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5Ub2FzdC5zaG93TWVzc2FnZSggJ2Vycm9yJywgdGhpcy5tb2RlbC5maWVsZHNbIGF0dHIgXS5lcnJvciApXG4gICAgICAgICAgICAgICAgZWwuc2Nyb2xsSW50b1ZpZXcoIHsgYmVoYXZpb3I6ICdzbW9vdGgnIH0gKVxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoICdlcnJvcicgKVxuICAgICAgICAgICAgICAgIHJ2ID0gZmFsc2VcbiAgICAgICAgICAgIH0gZWxzZSBpZiggdGhpcy5tb2RlbC52YWxpZGF0ZSggYXR0ciwgZWwudmFsdWUgKSApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLmRhdGFbIGF0dHIgXSA9IGVsLnZhbHVlLnRyaW0oKVxuICAgICAgICAgICAgfVxuICAgICAgICB9IClcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCBydiApXG4gICAgfVxuXG59ICkiLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG5cbn0gKSIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSggT2JqZWN0LmFzc2lnbigge30sIHJlcXVpcmUoJy4vX19wcm90b19fJyksIHtcblxuICAgIEljb25zOiB7XG4gICAgICAgIGVycm9yOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9saWIvZXJyb3InKSgpLFxuICAgICAgICBzdWNjZXNzOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9saWIvY2hlY2ttYXJrJykoKVxuICAgIH0sXG5cbiAgICBuYW1lOiAnVG9hc3QnLFxuXG4gICAgcG9zdFJlbmRlcigpIHtcblxuICAgICAgICB0aGlzLm9uKCAnc2hvd24nLCAoKSA9PiB0aGlzLnN0YXR1cyA9ICdzaG93bicgKVxuICAgICAgICB0aGlzLm9uKCAnaGlkZGVuJywgKCkgPT4gdGhpcy5zdGF0dXMgPSAnaGlkZGVuJyApXG5cbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgcmVxdWlyZXNMb2dpbjogZmFsc2UsXG5cbiAgICBzaG93TWVzc2FnZSggdHlwZSwgbWVzc2FnZSApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUsIHJlamVjdCApICA9PiB7XG4gICAgICAgICAgICBpZiggL3Nob3cvLnRlc3QoIHRoaXMuc3RhdHVzICkgKSB0aGlzLnRlYXJkb3duKClcblxuICAgICAgICAgICAgdGhpcy5yZXNvbHV0aW9uID0gcmVzb2x2ZVxuXG4gICAgICAgICAgICBpZiggdHlwZSAhPT0gJ2Vycm9yJyApIHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdzdWNjZXNzJylcblxuICAgICAgICAgICAgdGhpcy5lbHMubWVzc2FnZS50ZXh0Q29udGVudCA9IG1lc3NhZ2VcbiAgICAgICAgICAgIHRoaXMuZWxzLnRpdGxlLnRleHRDb250ZW50ID0gdHlwZSA9PT0gJ2Vycm9yJyA/ICdFcnJvcicgOiAnU3VjY2VzcydcbiAgICAgICAgICAgIHRoaXMuc2x1cnBUZW1wbGF0ZSggeyBpbnNlcnRpb246IHsgZWw6IHRoaXMuZWxzLmljb24gfSwgdGVtcGxhdGU6IHR5cGUgPT09ICdlcnJvcicgPyB0aGlzLkljb25zLmVycm9yIDogdGhpcy5JY29ucy5zdWNjZXNzIH0gKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnN0YXR1cyA9ICdzaG93aW5nJ1xuXG4gICAgICAgICAgICB0aGlzLnNob3coIHRydWUgKVxuICAgICAgICAgICAgLnRoZW4oICgpID0+IHRoaXMuaGlkZSggdHJ1ZSApIClcbiAgICAgICAgICAgIC50aGVuKCAoKSA9PiB0aGlzLnRlYXJkb3duKCkgKVxuICAgICAgICAgICAgLmNhdGNoKCByZWplY3QgKVxuICAgICAgICB9IClcbiAgICB9LFxuXG4gICAgdGVhcmRvd24oKSB7XG4gICAgICAgIGlmKCB0aGlzLmVscy5jb250YWluZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdzdWNjZXNzJykgKSB0aGlzLmVscy5jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnc3VjY2VzcycpXG4gICAgICAgIHRoaXMuZWxzLm1lc3NhZ2UudGV4dENvbnRlbnQgPSAnJ1xuICAgICAgICB0aGlzLmVscy5tZXNzYWdlLnRpdGxlID0gJydcbiAgICAgICAgaWYoIHRoaXMuZWxzLmljb24uZmlyc3RDaGlsZCApIHRoaXMuZWxzLmljb24ucmVtb3ZlQ2hpbGQoIHRoaXMuZWxzLmljb24uZmlyc3RDaGlsZCApXG4gICAgICAgIHRoaXMucmVzb2x1dGlvbigpXG4gICAgfSxcblxuICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9Ub2FzdCcpXG5cbn0gKSwgeyB9IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbiggeyB9LCByZXF1aXJlKCcuLi8uLi8uLi9saWIvTXlPYmplY3QnKSwgcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyLnByb3RvdHlwZSwge1xuXG4gICAgTW9kZWw6IHJlcXVpcmUoJy4uL21vZGVscy9fX3Byb3RvX18nKSxcblxuICAgIE9wdGltaXplZFJlc2l6ZTogcmVxdWlyZSgnLi9saWIvT3B0aW1pemVkUmVzaXplJyksXG5cbiAgICBiaW5kRXZlbnQoIGtleSwgZXZlbnQsIGVsICkge1xuICAgICAgICB2YXIgZWxzID0gZWwgPyBbIGVsIF0gOiBBcnJheS5pc0FycmF5KCB0aGlzLmVsc1sga2V5IF0gKSA/IHRoaXMuZWxzWyBrZXkgXSA6IFsgdGhpcy5lbHNbIGtleSBdIF1cbiAgICAgICAgZWxzLmZvckVhY2goIGVsID0+IGVsLmFkZEV2ZW50TGlzdGVuZXIoIGV2ZW50IHx8ICdjbGljaycsIGUgPT4gdGhpc1sgYG9uJHt0aGlzLmNhcGl0YWxpemVGaXJzdExldHRlcihrZXkpfSR7dGhpcy5jYXBpdGFsaXplRmlyc3RMZXR0ZXIoZXZlbnQpfWAgXSggZSApICkgKVxuICAgIH0sXG5cbiAgICBjYXBpdGFsaXplRmlyc3RMZXR0ZXI6IHN0cmluZyA9PiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSksXG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5zdWJ2aWV3RWxlbWVudHMgPSBbIF1cblxuICAgICAgICBpZiggdGhpcy5yZXF1aXJlc0xvZ2luICYmICggIXRoaXMudXNlci5pc0xvZ2dlZEluKCkgKSApIHJldHVybiB0aGlzLmhhbmRsZUxvZ2luKClcbiAgICAgICAgaWYoIHRoaXMudXNlciAmJiAhdGhpcy5pc0FsbG93ZWQoIHRoaXMudXNlciApICkgcmV0dXJuIHRoaXMuc2Nvb3RBd2F5KClcblxuICAgICAgICByZXR1cm4gdGhpcy5pbml0aWFsaXplKCkucmVuZGVyKClcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVFdmVudHMoIGtleSwgZWwgKSB7XG4gICAgICAgIHZhciB0eXBlID0gdHlwZW9mIHRoaXMuZXZlbnRzW2tleV1cblxuICAgICAgICBpZiggdHlwZSA9PT0gXCJzdHJpbmdcIiApIHsgdGhpcy5iaW5kRXZlbnQoIGtleSwgdGhpcy5ldmVudHNba2V5XSwgZWwgKSB9XG4gICAgICAgIGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIHRoaXMuZXZlbnRzW2tleV0gKSApIHtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzWyBrZXkgXS5mb3JFYWNoKCBldmVudE9iaiA9PiB0aGlzLmJpbmRFdmVudCgga2V5LCBldmVudE9iaiApIClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYmluZEV2ZW50KCBrZXksIHRoaXMuZXZlbnRzW2tleV0uZXZlbnQgKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGRlbGV0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlkZSgpXG4gICAgICAgIC50aGVuKCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmVscy5jb250YWluZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCggdGhpcy5lbHMuY29udGFpbmVyIClcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoIHRoaXMuZW1pdCgnZGVsZXRlZCcpIClcbiAgICAgICAgfSApXG4gICAgfSxcblxuICAgIGV2ZW50czoge30sXG5cbiAgICBnZXRUZW1wbGF0ZU9wdGlvbnMoKSB7XG4gICAgICAgIGNvbnN0IHJ2ID0gT2JqZWN0LmFzc2lnbiggdGhpcy51c2VyID8geyB1c2VyOiB0aGlzLnVzZXIuZGF0YSB9IDoge30gKVxuXG4gICAgICAgIGlmKCB0aGlzLm1vZGVsICkge1xuICAgICAgICAgICAgcnYubW9kZWwgPSB0aGlzLm1vZGVsLmRhdGFcblxuICAgICAgICAgICAgaWYoIHRoaXMubW9kZWwubWV0YSApIHJ2Lm1ldGEgPSB0aGlzLm1vZGVsLm1ldGFcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcnZcbiAgICB9LFxuXG4gICAgaGFuZGxlTG9naW4oKSB7XG4gICAgICAgIHRoaXMuZmFjdG9yeS5jcmVhdGUoICdsb2dpbicsIHsgaW5zZXJ0aW9uOiB7IHZhbHVlOiB7IGVsOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY29udGVudCcpIH0gfSB9IClcbiAgICAgICAgICAgIC5vbmNlKCBcImxvZ2dlZEluXCIsICgpID0+IHRoaXMub25Mb2dpbigpIClcblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICBoaWRlKCBpc1Nsb3csIGFuaW1hdGU9dHJ1ZSApIHsgcmV0dXJuIHRoaXMuaGlkZUVsKCB0aGlzLmVscy5jb250YWluZXIsIGlzU2xvdywgYW5pbWF0ZSApLnRoZW4oICgpID0+IHRoaXMuZW1pdCgnaGlkZGVuJykgKSB9LFxuXG4gICAgX2hpZGVFbCggZWwsIGtsYXNzLCByZXNvbHZlLCBoYXNoICkge1xuICAgICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCAnYW5pbWF0aW9uZW5kJywgdGhpc1sgaGFzaCBdIClcbiAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJylcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgga2xhc3MgKVxuICAgICAgICBkZWxldGUgdGhpc1toYXNoXVxuICAgICAgICByZXNvbHZlKClcbiAgICB9LFxuXG4gICAgaGlkZUVsKCBlbCwgaXNTbG93LCBhbmltYXRlPXRydWUgKSB7XG4gICAgICAgIGlmKCB0aGlzLmlzSGlkZGVuKCBlbCApICkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG5cbiAgICAgICAgY29uc3QgdGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxuICAgICAgICAgICAgaGFzaCA9IGAke3RpbWV9SGlkZWBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggcmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICBpZiggIWFuaW1hdGUgKSByZXR1cm4gcmVzb2x2ZSggZWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJykgKVxuXG4gICAgICAgICAgICBjb25zdCBrbGFzcyA9IGBhbmltYXRlLW91dCR7IGlzU2xvdyA/ICctc2xvdycgOiAnJ31gXG4gICAgICAgICAgICB0aGlzWyBoYXNoIF0gPSBlID0+IHRoaXMuX2hpZGVFbCggZWwsIGtsYXNzLCByZXNvbHZlLCBoYXNoIClcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoICdhbmltYXRpb25lbmQnLCB0aGlzWyBoYXNoIF0gKVxuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgga2xhc3MgKVxuICAgICAgICB9IClcbiAgICB9LFxuXG4gICAgaHRtbFRvRnJhZ21lbnQoIHN0ciApIHtcbiAgICAgICAgbGV0IHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgLy8gbWFrZSB0aGUgcGFyZW50IG9mIHRoZSBmaXJzdCBkaXYgaW4gdGhlIGRvY3VtZW50IGJlY29tZXMgdGhlIGNvbnRleHQgbm9kZVxuICAgICAgICByYW5nZS5zZWxlY3ROb2RlKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiZGl2XCIpLml0ZW0oMCkpXG4gICAgICAgIHJldHVybiByYW5nZS5jcmVhdGVDb250ZXh0dWFsRnJhZ21lbnQoIHN0ciApXG4gICAgfSxcblxuICAgIGluaXRpYWxpemUoKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKCB0aGlzLCB7IGVsczogeyB9LCBzbHVycDogeyBhdHRyOiAnZGF0YS1qcycsIHZpZXc6ICdkYXRhLXZpZXcnLCBuYW1lOiAnZGF0YS1uYW1lJyB9LCB2aWV3czogeyB9IH0gKVxuICAgIH0sXG5cbiAgICBpc0FsbG93ZWQoIHVzZXIgKSB7XG4gICAgICAgIGlmKCAhdGhpcy5yZXF1aXJlc1JvbGUgKSByZXR1cm4gdHJ1ZVxuICAgICAgICByZXR1cm4gdGhpcy5yZXF1aXJlc1JvbGUgJiYgdXNlci5kYXRhLnJvbGVzLmluY2x1ZGVzKCB0aGlzLnJlcXVpcmVzUm9sZSApXG4gICAgfSxcbiAgICBcbiAgICBpc0hpZGRlbiggZWwgKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBlbCB8fCB0aGlzLmVscy5jb250YWluZXJcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdoaWRkZW4nKVxuICAgIH0sXG5cbiAgICBvbkxvZ2luKCkge1xuXG4gICAgICAgIGlmKCAhdGhpcy5pc0FsbG93ZWQoIHRoaXMudXNlciApICkgcmV0dXJuIHRoaXMuc2Nvb3RBd2F5KClcblxuICAgICAgICB0aGlzLmluaXRpYWxpemUoKS5yZW5kZXIoKVxuICAgIH0sXG5cbiAgICBvbk5hdmlnYXRpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNob3coKVxuICAgIH0sXG5cbiAgICBzaG93Tm9BY2Nlc3MoKSB7XG4gICAgICAgIGFsZXJ0KFwiTm8gcHJpdmlsZWdlcywgc29uXCIpXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIHBvc3RSZW5kZXIoKSB7IHJldHVybiB0aGlzIH0sXG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGlmKCB0aGlzLmRhdGEgKSB0aGlzLm1vZGVsID0gT2JqZWN0LmNyZWF0ZSggdGhpcy5Nb2RlbCwgeyB9ICkuY29uc3RydWN0b3IoIHRoaXMuZGF0YSApXG5cbiAgICAgICAgdGhpcy5zbHVycFRlbXBsYXRlKCB7IHRlbXBsYXRlOiB0aGlzLnRlbXBsYXRlKCB0aGlzLmdldFRlbXBsYXRlT3B0aW9ucygpICksIGluc2VydGlvbjogdGhpcy5pbnNlcnRpb24gfHwgeyBlbDogZG9jdW1lbnQuYm9keSB9LCBpc1ZpZXc6IHRydWUgfSApXG5cbiAgICAgICAgdGhpcy5yZW5kZXJTdWJ2aWV3cygpXG5cbiAgICAgICAgaWYoIHRoaXMuc2l6ZSApIHsgdGhpcy5zaXplKCk7IHRoaXMuT3B0aW1pemVkUmVzaXplLmFkZCggdGhpcy5zaXplLmJpbmQodGhpcykgKSB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucG9zdFJlbmRlcigpXG4gICAgfSxcblxuICAgIHJlbmRlclN1YnZpZXdzKCkge1xuICAgICAgICB0aGlzLnN1YnZpZXdFbGVtZW50cy5mb3JFYWNoKCBvYmogPT4ge1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IG9iai5uYW1lXG5cbiAgICAgICAgICAgIGxldCBvcHRzID0geyB9XG5cbiAgICAgICAgICAgIGlmKCB0aGlzLlZpZXdzICYmIHRoaXMuVmlld3NbIG5hbWUgXSApIG9wdHMgPSB0eXBlb2YgdGhpcy5WaWV3c1sgbmFtZSBdID09PSBcIm9iamVjdFwiID8gdGhpcy5WaWV3c1sgbmFtZSBdIDogUmVmbGVjdC5hcHBseSggdGhpcy5WaWV3c1sgbmFtZSBdLCB0aGlzLCBbIF0gKVxuXG4gICAgICAgICAgICB0aGlzLnZpZXdzWyBuYW1lIF0gPSB0aGlzLmZhY3RvcnkuY3JlYXRlKCBrZXksIE9iamVjdC5hc3NpZ24oIHsgaW5zZXJ0aW9uOiB7IHZhbHVlOiB7IGVsOiBvYmouZWwsIG1ldGhvZDogJ2luc2VydEJlZm9yZScgfSB9IH0sIHsgb3B0czogeyB2YWx1ZTogb3B0cyB9IH0gKSApXG4gICAgICAgICAgICBvYmouZWwucmVtb3ZlKClcbiAgICAgICAgfSApXG5cbiAgICAgICAgZGVsZXRlIHRoaXMuc3Vidmlld0VsZW1lbnRzXG5cbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgc2Nvb3RBd2F5KCkge1xuICAgICAgICB0aGlzLlRvYXN0LnNob3coICdlcnJvcicsICdZb3UgYXJlIG5vdCBhbGxvd2VkIGhlcmUuICBTb3JyeS4nKVxuICAgICAgICAuY2F0Y2goIGUgPT4geyB0aGlzLkVycm9yKCBlICk7IHRoaXMuZW1pdCggJ25hdmlnYXRlJywgYC9gICkgfSApXG4gICAgICAgIC50aGVuKCAoKSA9PiB0aGlzLmVtaXQoICduYXZpZ2F0ZScsIGAvYCApIClcblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICBzaG93KCBpc1Nsb3csIGFuaW1hdGU9dHJ1ZSApIHsgcmV0dXJuIHRoaXMuc2hvd0VsKCB0aGlzLmVscy5jb250YWluZXIsIGlzU2xvdywgYW5pbWF0ZSApLnRoZW4oICgpID0+IHRoaXMuZW1pdCgnc2hvd24nKSApIH0sXG5cbiAgICBfc2hvd0VsKCBlbCwga2xhc3MsIHJlc29sdmUsIGhhc2ggKSB7XG4gICAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdhbmltYXRpb25lbmQnLCB0aGlzW2hhc2hdIClcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgga2xhc3MgKVxuICAgICAgICBkZWxldGUgdGhpc1sgaGFzaCBdXG4gICAgICAgIHJlc29sdmUoKVxuICAgIH0sXG5cbiAgICBzaG93RWwoIGVsLCBpc1Nsb3csIGFuaW1hdGU9dHJ1ZSApIHtcbiAgICAgICAgaWYoICF0aGlzLmlzSGlkZGVuKCBlbCApICkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG5cbiAgICAgICAgY29uc3QgdGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxuICAgICAgICAgICAgaGFzaCA9IGAke3RpbWV9U2hvd2BcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoIHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJylcblxuICAgICAgICAgICAgaWYoICFhbmltYXRlICkgcmV0dXJuIHJlc29sdmUoKVxuXG4gICAgICAgICAgICBjb25zdCBrbGFzcyA9IGBhbmltYXRlLWluJHsgaXNTbG93ID8gJy1zbG93JyA6ICcnfWBcbiAgICAgICAgICAgIHRoaXNbIGhhc2ggXSA9IGUgPT4gdGhpcy5fc2hvd0VsKCBlbCwga2xhc3MsIHJlc29sdmUsIGhhc2ggKVxuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lciggJ2FuaW1hdGlvbmVuZCcsIHRoaXNbIGhhc2ggXSApICAgICAgICAgICAgXG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCBrbGFzcyApXG4gICAgICAgIH0gKSAgICAgICAgXG4gICAgfSxcblxuICAgIHNsdXJwRWwoIGVsICkge1xuICAgICAgICB2YXIga2V5ID0gZWwuZ2V0QXR0cmlidXRlKCB0aGlzLnNsdXJwLmF0dHIgKSB8fCAnY29udGFpbmVyJ1xuXG4gICAgICAgIGlmKCBrZXkgPT09ICdjb250YWluZXInICkgZWwuY2xhc3NMaXN0LmFkZCggdGhpcy5uYW1lIClcblxuICAgICAgICB0aGlzLmVsc1sga2V5IF0gPSBBcnJheS5pc0FycmF5KCB0aGlzLmVsc1sga2V5IF0gKVxuICAgICAgICAgICAgPyB0aGlzLmVsc1sga2V5IF0uY29uY2F0KCBlbCApXG4gICAgICAgICAgICA6ICggdGhpcy5lbHNbIGtleSBdICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgICAgID8gWyB0aGlzLmVsc1sga2V5IF0sIGVsIF1cbiAgICAgICAgICAgICAgICA6IGVsXG5cbiAgICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKHRoaXMuc2x1cnAuYXR0cilcblxuICAgICAgICBpZiggdGhpcy5ldmVudHNbIGtleSBdICkgdGhpcy5kZWxlZ2F0ZUV2ZW50cygga2V5LCBlbCApXG4gICAgfSxcblxuICAgIHNsdXJwVGVtcGxhdGUoIG9wdGlvbnMgKSB7XG4gICAgICAgIHZhciBmcmFnbWVudCA9IHRoaXMuaHRtbFRvRnJhZ21lbnQoIG9wdGlvbnMudGVtcGxhdGUgKSxcbiAgICAgICAgICAgIHNlbGVjdG9yID0gYFske3RoaXMuc2x1cnAuYXR0cn1dYCxcbiAgICAgICAgICAgIHZpZXdTZWxlY3RvciA9IGBbJHt0aGlzLnNsdXJwLnZpZXd9XWAsXG4gICAgICAgICAgICBmaXJzdEVsID0gZnJhZ21lbnQucXVlcnlTZWxlY3RvcignKicpXG5cbiAgICAgICAgaWYoIG9wdGlvbnMuaXNWaWV3IHx8IGZpcnN0RWwuZ2V0QXR0cmlidXRlKCB0aGlzLnNsdXJwLmF0dHIgKSApIHRoaXMuc2x1cnBFbCggZmlyc3RFbCApXG4gICAgICAgIGZyYWdtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoIGAke3NlbGVjdG9yfSwgJHt2aWV3U2VsZWN0b3J9YCApLmZvckVhY2goIGVsID0+IHtcbiAgICAgICAgICAgIGlmKCBlbC5oYXNBdHRyaWJ1dGUoIHRoaXMuc2x1cnAuYXR0ciApICkgeyB0aGlzLnNsdXJwRWwoIGVsICkgfVxuICAgICAgICAgICAgZWxzZSBpZiggZWwuaGFzQXR0cmlidXRlKCB0aGlzLnNsdXJwLnZpZXcgKSApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN1YnZpZXdFbGVtZW50cy5wdXNoKCB7IGVsLCB2aWV3OiBlbC5nZXRBdHRyaWJ1dGUodGhpcy5zbHVycC52aWV3KSwgbmFtZTogZWwuZ2V0QXR0cmlidXRlKHRoaXMuc2x1cnAubmFtZSkgfSApXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gKVxuICAgICAgICAgIFxuICAgICAgICBvcHRpb25zLmluc2VydGlvbi5tZXRob2QgPT09ICdpbnNlcnRCZWZvcmUnXG4gICAgICAgICAgICA/IG9wdGlvbnMuaW5zZXJ0aW9uLmVsLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKCBmcmFnbWVudCwgb3B0aW9ucy5pbnNlcnRpb24uZWwgKVxuICAgICAgICAgICAgOiBvcHRpb25zLmluc2VydGlvbi5lbFsgb3B0aW9ucy5pbnNlcnRpb24ubWV0aG9kIHx8ICdhcHBlbmRDaGlsZCcgXSggZnJhZ21lbnQgKVxuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfVxufSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIHtcblxuICAgIGFkZChjYWxsYmFjaykge1xuICAgICAgICBpZiggIXRoaXMuY2FsbGJhY2tzLmxlbmd0aCApIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uUmVzaXplLmJpbmQodGhpcykgKVxuICAgICAgICB0aGlzLmNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKVxuICAgIH0sXG5cbiAgICBvblJlc2l6ZSgpIHtcbiAgICAgICBpZiggdGhpcy5ydW5uaW5nICkgcmV0dXJuXG5cbiAgICAgICAgdGhpcy5ydW5uaW5nID0gdHJ1ZVxuICAgICAgICBcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICAgICAgPyB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCB0aGlzLnJ1bkNhbGxiYWNrcy5iaW5kKHRoaXMpIClcbiAgICAgICAgICAgIDogc2V0VGltZW91dCggdGhpcy5ydW5DYWxsYmFja3MsIDY2IClcbiAgICB9LFxuXG4gICAgcnVuQ2FsbGJhY2tzKCkge1xuICAgICAgICB0aGlzLmNhbGxiYWNrcyA9IHRoaXMuY2FsbGJhY2tzLmZpbHRlciggY2FsbGJhY2sgPT4gY2FsbGJhY2soKSApXG4gICAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlIFxuICAgIH1cblxufSwgeyBjYWxsYmFja3M6IHsgd3JpdGFibGU6IHRydWUsIHZhbHVlOiBbXSB9LCBydW5uaW5nOiB7IHdyaXRhYmxlOiB0cnVlLCB2YWx1ZTogZmFsc2UgfSB9IClcbiIsIm1vZHVsZS5leHBvcnRzID0gcCA9PlxuYDxmb290ZXI+XG4gICAgPGRpdiBjbGFzcz1cImNvbnRhY3RcIj5cbiAgICAgICAgPGRpdj4mY29weTsgMjAxNyB8IEFsbGVnYW4gSW50ZXJuZXQgV2l6YXJkPC9kaXY+XG4gICAgICAgIDxkaXY+MTIzIEJheXJvbiBMYW5lIHwgQWxsZWdhbiwgTUkgMTIzNDUgfCAxMjMuNDU2Ljc4OTA8L2Rpdj5cbiAgICAgICAgPGRpdj50aGVfd2l6QGFpdy5jb208L2Rpdj5cbiAgICA8L2Rpdj5cbjwvZm9vdGVyPmBcbiIsIm1vZHVsZS5leHBvcnRzID0gKCkgPT5cbmA8bmF2PlxuICAgIDxkaXYgY2xhc3M9XCJjb250YWN0XCI+XG4gICAgICAgIDxkaXY+cGhvbmU6IDEyMy40NTYuNzg5MCB8IGVtYWlsOiB0aGVfd2l6QGFpdy5jb208L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICA8dWwgZGF0YS1qcz1cIm5hdlwiPlxuICAgICAgICA8bGkgZGF0YS1uYW1lPVwiaG9tZVwiPkhvbWU8L2xpPlxuICAgICAgICA8bGkgZGF0YS1uYW1lPVwic2VydmljZXNcIj5TZXJ2aWNlczwvbGk+XG4gICAgICAgIDxsaSBkYXRhLW5hbWU9XCJpbnRlcm5ldFwiPkxvY2FsIEludGVybmV0ITwvbGk+XG4gICAgPC91bD5cbjwvbmF2PmBcbiIsIm1vZHVsZS5leHBvcnRzID0gKCkgPT5cbmA8ZGl2PlxuICAgIDxkaXY+XG4gICAgICAgIDxpbWcgc3JjPVwiL3N0YXRpYy9pbWcvbG9nby5zdmdcIj5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2PlxuICAgICAgICA8aDI+TWFrZSBZb3VyIFRlY2ggUHJvYmxlbXMgTWFnaWNhbGx5IERpc2FwcGVhciE8L2gyPlxuICAgICAgICA8cD5Db21wdXRlcnMuIENhbid0IGxpdmUgd2l0aCAnZW0sIGNhbid0IGxpdmUgd2l0aG91dCAnZW0uIFRoZXkncmUgYSBodWdlIHBhcnQgb2Ygb3VyIGxpdmVzIHRoZXNlIGRheXMsIGJ1dCB1bmZvcnR1bmF0ZWx5XG4gICAgICAgIHRoZXkgaGF2ZW4ndCBnb3R0ZW4gYW55IGxlc3MgY29tcGxpY2F0ZWQuIFRoaW5ncyBjYW4gYW5kIGRvIGdvIHdyb25nIGFsbCB0aGUgdGltZSwgYW5kIHRoZW4geW91IGVuZCB1cCBzcGVuZGluZyBob3Vyc1xuICAgICAgICBhbmQgaG91cnMgb2YgeW91ciB2YWx1YWJsZSB0aW1lIHRyeWluZyB0byBmaWd1cmUgb3V0IHdoYXQgdGhlIGhlY2sgaGFwcGVuZWQgYW5kIGZpeCBpdC4gTGlmZSdzIHRvbyBzaG9ydCBmb3IgYWxsIHRoYXQgZnJ1c3RyYXRpb24uXG4gICAgICAgIFdoeSBub3QgaGlyZSBhIHByb2Zlc3Npb25hbCB0byB0YWtlIGNhcmUgb2YgaXQgcXVpY2tseSBhbmQgcGFpbmxlc3NseT8gR2l2ZSBUaGUgV2l6YXJkIGEgY2FsbCE8L3A+XG4gICAgICAgIDxwPkFsbGVnYW4gSW50ZXJuZXQgV2l6YXJkIGlzIGhlcmUgdG8gYXNzaXN0IHRoZSBjaXRpemVucyBvZiBBbGxlZ2FuIHdpdGggYWxsIG9mIHRoZWlyIHRlY2ggbmVlZHMuIFdoZXRoZXIgeW91IGFyZSBhXG4gICAgICAgIG5vcm1hbCBob21lIHVzZXIgb3IgYSBzbWFsbCBidXNpbmVzcywgd2Ugd2lsbCB1c2Ugb3VyIDE1KyB5ZWFycyBvZiBleHBlcmllbmNlIGluIHRoZSB0ZWNoIGluZHVzdHJ5IHRvIHNvbHZlIHlvdXIgcHJvYmxlbXNcbiAgICAgICAgd2l0aCBzcGVlZCwgY291cnRlc3ksIGFuZCBwcm9mZXNzaW9uYWxpc20uIFdhbnQgdG8gZmluZCBvdXQgbW9yZT8gQ2xpY2sgPHNwYW4gY2xhc3M9XCJsaW5rXCIgZGF0YS1qcz1cInNlcnZpY2VzXCI+aGVyZTwvc3Bhbj5cbiAgICAgICAgZm9yIGEgbGlzdCBvZiBvdXIgc2VydmljZXMuPC9wPlxuICAgICAgICA8cD48c3BhbiBjbGFzcz1cIm5vdGljZVwiPlNwZWNpYWwgbm90aWNlPC9zcGFuPjogd2UgYXJlIGNvbnNpZGVyaW5nIGV4cGFuZGluZyBvdXIgYnVzaW5lc3MgdG8gcHJvdmlkZSBpbnRlcm5ldCBzZXJ2aWNlIHRvIEFsbGVnYW4uXG4gICAgICAgIENsaWNrIDxzcGFuIGNsYXNzPVwibGlua1wiIGRhdGEtanM9XCJpbnRlcm5ldFwiPmhlcmU8L3NwYW4+IHRvIGZpbmQgb3V0IG1vcmUuPC9wPlxuICAgIDwvZGl2PiAgICAgICAgXG48L2Rpdj5gXG4iLCJtb2R1bGUuZXhwb3J0cyA9ICgpID0+XG5gPGRpdj5cbiAgICA8ZGl2PlxuICAgICAgICA8aDI+TG9jYWwgSW50ZXJuZXQgU2VydmljZSBmb3IgQWxsZWdhbjwvaDI+XG4gICAgICAgIDxwPk5vdCBoYXBweSB3aXRoIHlvdXIgaW50ZXJuZXQgb3B0aW9ucyBpbiBBbGxlZ2FuPyBUaXJlZCBvZiBwYXlpbmcgdG9vIG11Y2ggZm9yIGxvdXN5IHNwZWVkcyBhbmQgY29uc3RhbnQgc2VydmljZSBpbnRlcnJ1cHRpb25zP1xuICAgICAgICBXZWxsLCB5b3UncmUgaW4gbHVjaywgYmVjYXVzZSBBbGxlZ2FuIEludGVybmV0IFdpemFyZCBpcyBjdXJyZW50bHkgY29uc2lkZXJpbmcgbGF1bmNoaW5nIG91ciBvd24gaW50ZXJuZXQgc2VydmljZSBmb3JcbiAgICAgICAgdGhlIGZpbmUgY2l0aXplbnMgb2YgQWxsZWdhbi4gV2UgYmVsaWV2ZSB0aGVyZSdzIG5vdCBuZWFybHkgZW5vdWdoIGZyZWVkb20gYW5kIGNob2ljZSB3aGVuIGl0IGNvbWVzIHRvIGludGVybmV0IHByb3ZpZGVycywgYW5kXG4gICAgICAgIHdlJ2QgbGlrZSB0byB1c2Ugb3VyIHRlY2ggc2tpbGxzIHRvIGNoYW5nZSB0aGF0IGFuZCBvZmZlciBBbGxlZ2FuIGZhc3QsIHJlbGlhYmxlIHNlcnZpY2UgYXQgYSByZWFzb25hYmxlIHByaWNlLlxuICAgICAgICBMZXQncyBnaXZlIHRob3NlIGZhdCBjYXQgdGVsZWNvbXMgc29tZSByZWFsIGNvbXBldGl0aW9uITwvcD5cbiAgICAgICAgPHA+SWYgdGhpcyBzb3VuZHMgZ29vZCB0byB5b3UsIHBsZWFzZSBsZWF2ZSB5b3VyIG5hbWUgYW5kIGNvbnRhY3QgaW5mbywgYW5kIHdlJ2xsIGxldCB5b3Uga25vdyBob3cgdGhpbmdzIGFyZSBkZXZlbG9waW5nLlxuICAgICAgICBUaGFuayB5b3UgZm9yIHlvdXIgaW50ZXJlc3QhPC9wPlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJib3JkZXJcIj48L2Rpdj5cbiAgICA8Zm9ybT5cbiAgICAgICAgPGlucHV0IGRhdGEtanM9XCJuYW1lXCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIk5hbWVcIj5cbiAgICAgICAgPGlucHV0IGRhdGEtanM9XCJjb250YWN0XCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIkVtYWlsIG9yIFBob25lIE51bWJlclwiPlxuICAgICAgICA8aW5wdXQgZGF0YS1qcz1cImFkZHJlc3NcIiB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiQWRkcmVzc1wiPlxuICAgICAgICA8YnV0dG9uIGRhdGEtanM9XCJzdWJtaXRCdG5cIiB0eXBlPVwiYnV0dG9uXCI+U3VibWl0PC9idXR0b24+XG4gICAgPC9mb3JtPlxuPC9kaXY+YCIsIm1vZHVsZS5leHBvcnRzID0gKCkgPT5cbmA8ZGl2PlxuICAgIDxoMT5PdXIgU2VydmljZXM8L2gxPlxuICAgIDxkaXYgY2xhc3M9XCJpbnRyb1wiPlxuICAgICAgICA8cD5XYW50IHRvIGltcHJvdmUgeW91ciBob21lIG5ldHdvcms/IFByb3RlY3QgeW91ciBraWRzIGZyb20gaW5hcHByb3ByaWF0ZSBjb250ZW50IG9uIHRoZSB3ZWI/IE5lZWQgaGVscCBleHBsb3JpbmdcbiAgICAgICAgeW91ciBpbnRlcm5ldCBzZXJ2aWNlIG9wdGlvbnM/IENhbid0IGZpZ3VyZSBvdXQgd2h5IGEgd2ViIHBhZ2UgaXNuJ3Qgd29ya2luZz8gTWF5YmUgeW91J3JlIGEgYnVzaW5lc3MgYW5kIHdhbnQgdG8gYnVpbGRcbiAgICAgICAgYSBuZXcgd2Vic2l0ZSBvciBpbXByb3ZlIHlvdXIgY3VycmVudCBvbmUuIEZyb20gZ2VuZXJhbCB0ZWNoIHN1cHBvcnQgdG8gd2ViIGRldmVsb3BtZW50LCB3ZSd2ZSBnb3QgeW91IGNvdmVyZWQhPC9wPlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJib3JkZXJcIj48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwiY2F0ZWdvcmllc1wiPlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgzPkdlbmVyYWwgVGVjaCBTdXBwb3J0PC9oMz5cbiAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICA8bGk+TWFjIGFuZCBQQy4gTGFwdG9wLCBkZXNrdG9wLCBtb2JpbGUsIGFuZCB0YWJsZXQuIFRlbGwgdXMgeW91ciBwcm9ibGVtIGFuZCB3ZSdsbCBmaXggaXQhPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgzPkludGVybmV0IFNlcnZpY2UgQWR2aWNlPC9oMz5cbiAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICA8bGk+V2UnbGwgdGFrZSBhIGxvb2sgYXQgd2hlcmUgeW91IGxpdmUgYW5kIGxldCB5b3Uga25vdyB3aGF0IHlvdXIgYmVzdCBvcHRpb25zIGFyZSBmb3IgY29ubmVjdGluZ1xuICAgICAgICAgICAgICAgIHRvIHRoZSBpbnRlcm5ldDwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxoMz5EYXRhIFJlY292ZXJ5IGFuZCBCYWNrdXBzPC9oMz5cbiAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICA8bGk+SGFyZCBkcml2ZSBjcmFzaD8gV2UnbGwgaGVscCB5b3UgZ2V0IHlvdXIgdmFsdWFibGUgZGF0YSBiYWNrPC9saT5cbiAgICAgICAgICAgICAgICA8bGk+QW5kIHdlJ2xsIGhlbHAgeW91IGJhY2sgeW91ciBkYXRhIHVwIHNvIHRoYXQgaXQncyBzYWZlIGZvciB0aGUgZnV0dXJlPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgzPk5ldHdvcmtzPC9oMz5cbiAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICA8bGk+SW5zdGFsbGF0aW9uIG9mIHdpcmVkIGFuZCB3aXJlbGVzcyBuZXR3b3JrczwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlRyb3VibGVzaG9vdGluZyBmb3IgaW50ZXJuZXQgY29ubmVjdGlvbiBpc3N1ZXM8L2xpPlxuICAgICAgICAgICAgICAgIDxsaT5Db25maWd1cmF0aW9uIG9mIG1vZGVtcyBhbmQgcm91dGVyczwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxoMz5Db21wdXRlciBTZWN1cml0eTwvaDM+XG4gICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgPGxpPktlZXAgeW91ciBraWRzIHNhZmUgZnJvbSBpbmFwcHJvcHJpYXRlIGNvbnRlbnQ8L2xpPlxuICAgICAgICAgICAgICAgIDxsaT5GaW5kIGFuZCBlbGltaW5hdGUgdmlydXNlcywgbWFsd2FyZSwgYW5kIHNweXdhcmU8L2xpPlxuICAgICAgICAgICAgICAgIDxsaT5TZXQgdXAgYW50aXZpcnVzIHNvZnR3YXJlIGFuZCBmaXJld2FsbHMgZm9yIGZ1cnRoZXIgcHJvdGVjdGlvbjwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgzPkhlbHAgZm9yIEJ1c2luZXNzZXM8L2gzPlxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgIDxsaT5GdWxseSBjdXN0b21pemFibGUgd2Vic2l0ZXMgdGhhdCB3aWxsIGltcHJvdmUgeW91ciBicmFuZCBhbmQgb3B0aW1pemUgeW91ciB3b3JrZmxvdzwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlNldHRpbmcgdXAgY29tcGFueSBlbWFpbDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlNlcnZlciBpbnN0YWxsYXRpb248L2xpPlxuICAgICAgICAgICAgPC91bD5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG48L2Rpdj5gIiwibW9kdWxlLmV4cG9ydHMgPSBwID0+IGBgICtcbmA8ZGl2IGNsYXNzPVwiY2xlYXJmaXggaGlkZGVuXCI+XG4gICAgPGRpdiBkYXRhLWpzPVwiaWNvblwiPjwvZGl2PlxuICAgIDxkaXY+XG4gICAgICAgIDxkaXYgZGF0YS1qcz1cInRpdGxlXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgZGF0YS1qcz1cIm1lc3NhZ2VcIj48L2Rpdj5cbiAgICA8L2Rpdj5cbjwvZGl2PmBcbiIsIm1vZHVsZS5leHBvcnRzID0gKHA9e30pID0+IGA8c3ZnIHZlcnNpb249XCIxLjFcIiBkYXRhLWpzPVwiJHtwLm5hbWUgfHwgJ2NoZWNrbWFyayd9XCIgY2xhc3M9XCJjaGVja21hcmtcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgeG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIgeD1cIjBweFwiIHk9XCIwcHhcIlxuXHQgd2lkdGg9XCI5Ny42MTlweFwiIGhlaWdodD1cIjk3LjYxOHB4XCIgdmlld0JveD1cIjAgMCA5Ny42MTkgOTcuNjE4XCIgc3R5bGU9XCJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDk3LjYxOSA5Ny42MTg7XCJcblx0IHhtbDpzcGFjZT1cInByZXNlcnZlXCI+XG48Zz5cblx0PHBhdGggZD1cIk05Ni45MzksMTcuMzU4TDgzLjk2OCw1Ljk1OWMtMC4zOTgtMC4zNTItMC45MjctMC41MzEtMS40NDktMC40OTRDODEuOTksNS41LDgxLjQ5Niw1Ljc0Myw4MS4xNDYsNi4xNDJMMzQuMSw1OS42ODhcblx0XHRMMTcuMzcyLDM3LjU0N2MtMC4zMTktMC40MjItMC43OTQtMC43MDEtMS4zMTktMC43NzNjLTAuNTI0LTAuMDc4LTEuMDU5LDAuMDY0LTEuNDgxLDAuMzg1TDAuNzk0LDQ3LjU2N1xuXHRcdGMtMC44ODEsMC42NjYtMS4wNTYsMS45Mi0wLjM5LDIuODAxbDMwLjk3NCw0MC45OTZjMC4zNjIsMC40NzksMC45MjIsMC43NzEsMS41MjIsMC43OTNjMC4wMjQsMCwwLjA0OSwwLDAuMDczLDBcblx0XHRjMC41NzQsMCwxLjEyMi0wLjI0NiwxLjUwMy0wLjY4bDYyLjY0NC03MS4yOTdDOTcuODUsMTkuMzUxLDk3Ljc2OSwxOC4wODYsOTYuOTM5LDE3LjM1OHpcIi8+XG48L2c+PC9zdmc+YFxuIiwibW9kdWxlLmV4cG9ydHMgPSAocD17fSkgPT4gYDxzdmcgdmVyc2lvbj1cIjEuMVwiIGRhdGEtanM9XCIke3AubmFtZSB8fCAnZXJyb3InfVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiB4PVwiMHB4XCIgeT1cIjBweFwiIHZpZXdCb3g9XCIwIDAgMTguOTc4IDE4Ljk3OFwiIHN0eWxlPVwiZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxOC45NzggMTguOTc4O1wiIHhtbDpzcGFjZT1cInByZXNlcnZlXCI+XHJcbjxnPlxyXG4gICAgPHBhdGggZD1cIk0xNi4wODgsMS42NzVjLTAuMTMzLTAuMTA0LTAuMzA2LTAuMTQ0LTAuNDctMC4xMDVjLTAuMDEzLDAuMDAyLTEuMjYxLDAuMjktMi41OTQsMC4yOVxyXG4gICAgICAgIGMtMS43ODgsMC0yLjc4OS0wLjQ3Ni0yLjk3NS0xLjQxNUM5Ljk5OSwwLjE5MSw5Ljc3OSwwLjAwNyw5LjUyMSwwYy0wLjI1Ny0wLjAwNy0wLjQ4NywwLjE2Ny0wLjU1LDAuNDE4XHJcbiAgICAgICAgQzguNzI3LDEuMzg2LDcuNzEsMS44NzcsNS45NSwxLjg3N2MtMS4zMzIsMC0yLjU3MS0wLjMwMi0yLjU4My0wLjMwNWMtMC4xNjYtMC4wNC0wLjM0LTAuMDA0LTAuNDc0LDAuMTAyXHJcbiAgICAgICAgQzIuNzYsMS43NzcsMi42ODEsMS45MzgsMi42ODEsMi4xMDh2NC44NjljMCwwLjA0LDAuMDA0LDAuMDc4LDAuMDEzLDAuMTE1YzAuMDU3LDEuNjQ3LDAuNjUsOC43MTQsNi41MjgsMTEuODIyXHJcbiAgICAgICAgYzAuMDgsMC4wNDMsMC4xNjksMC4wNjQsMC4yNTgsMC4wNjRjMC4wOTIsMCwwLjE4My0wLjAyMSwwLjI2Ni0wLjA2NmM1Ljc0LTMuMTM3LDYuNDQ1LTEwLjExNSw2LjUzMi0xMS43OTFcclxuICAgICAgICBjMC4wMTItMC4wNDYsMC4wMTktMC4wOTQsMC4wMTktMC4xNDRWMi4xMDhDMTYuMjk3LDEuOTM5LDE2LjIxOSwxLjc4LDE2LjA4OCwxLjY3NXogTTE1LjE5LDYuODU3XHJcbiAgICAgICAgYy0wLjAwNywwLjAzMS0wLjAxMiwwLjA2NC0wLjAxMywwLjA5N2MtMC4wNTMsMS4yOTgtMC41NzQsNy44MzItNS43MDEsMTAuODM4Yy01LjIxNS0yLjk2NS01LjY0Ni05LjUyNi01LjY4LTEwLjgzXHJcbiAgICAgICAgYzAtMC4wMjktMC4wMDQtMC4wNTgtMC4wMDktMC4wODVWMi43ODRDNC4zMjIsMi44NzcsNS4xMTIsMi45ODIsNS45NSwyLjk4MmMxLjkxMSwwLDIuOTY1LTAuNTQsMy41MzctMS4yMDhcclxuICAgICAgICBjMC41NTMsMC42NjEsMS41OTksMS4xOTEsMy41MzYsMS4xOTFjMC44MzksMCwxLjYzMS0wLjEwMSwyLjE2Ni0wLjE4OEwxNS4xOSw2Ljg1N0wxNS4xOSw2Ljg1N3pcIi8+XHJcbiAgICA8cG9seWdvbiBwb2ludHM9XCIxMC4yNDEsMTEuMjM3IDEwLjUyOSw1LjMxMSA4LjQ0OSw1LjMxMSA4Ljc1LDExLjIzNyBcdFx0XCIvPlxyXG4gICAgPHBhdGggZD1cIk05LjQ5NiwxMS44OTFjLTAuNjk0LDAtMS4xNzgsMC40OTgtMS4xNzgsMS4xODljMCwwLjY4MiwwLjQ3MSwxLjE5MSwxLjE3OCwxLjE5MVxyXG4gICAgICAgIGMwLjcwNiwwLDEuMTY0LTAuNTEsMS4xNjQtMS4xOTFDMTAuNjQ3LDEyLjM4OSwxMC4xODksMTEuODkxLDkuNDk2LDExLjg5MXpcIi8+XHJcbjwvZz48L3N2Zz5gXHJcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgY29uc3RydWN0b3IoIGRhdGEsIG9wdHM9e30gKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24oIHRoaXMsIHsgc3RvcmU6IHsgfSwgZGF0YSB9LCBvcHRzIClcblxuICAgICAgICBpZiggdGhpcy5zdG9yZUJ5ICkge1xuICAgICAgICAgICAgdGhpcy5zdG9yZUJ5LmZvckVhY2goIGtleSA9PiB0aGlzLnN0b3JlWyBrZXkgXSA9IHsgfSApXG4gICAgICAgICAgICB0aGlzLl9zdG9yZSgpXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICBfc3RvcmUoKSB7XG4gICAgICAgIHRoaXMuZGF0YS5mb3JFYWNoKCBkYXR1bSA9PiB0aGlzLnN0b3JlQnkuZm9yRWFjaCggYXR0ciA9PiB0aGlzLl9zdG9yZUF0dHIoIGRhdHVtLCBhdHRyICkgKSApXG4gICAgfSxcblxuICAgIF9zdG9yZUF0dHIoIGRhdHVtLCBhdHRyICkge1xuICAgICAgICB0aGlzLnN0b3JlWyBhdHRyIF1bIGRhdHVtWyBhdHRyIF0gXSA9XG4gICAgICAgICAgICB0aGlzLnN0b3JlWyBhdHRyIF1bIGRhdHVtWyBhdHRyIF0gXVxuICAgICAgICAgICAgICAgID8gQXJyYXkuaXNBcnJheSggdGhpcy5zdG9yZVsgYXR0ciBdWyBkYXR1bVsgYXR0ciBdIF0gKVxuICAgICAgICAgICAgICAgICAgICA/IHRoaXMuc3RvcmVbIGF0dHIgXVsgZGF0dW1bIGF0dHIgXSBdLmNvbmNhdCggZGF0dW0gKVxuICAgICAgICAgICAgICAgICAgICA6WyB0aGlzLnN0b3JlWyBhdHRyIF1bIGRhdHVtWyBhdHRyIF0gXSwgZGF0dW0gXVxuICAgICAgICAgICAgICAgIDogZGF0dW1cbiAgICB9XG5cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZXJyID0+IHsgY29uc29sZS5sb2coIGVyci5zdGFjayB8fCBlcnIgKSB9XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcblxuICAgIGdldEludFJhbmdlKCBpbnQgKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKCBBcnJheSggaW50ICkua2V5cygpIClcbiAgICB9LFxuXG4gICAgZ2V0UmFuZG9tSW5jbHVzaXZlSW50ZWdlciggbWluLCBtYXggKSB7XG4gICAgICAgIG1pbiA9IE1hdGguY2VpbChtaW4pXG4gICAgICAgIG1heCA9IE1hdGguZmxvb3IobWF4KVxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pblxuICAgIH0sXG5cbiAgICBvbWl0KCBvYmosIGtleXMgKSB7XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyggb2JqICkuZmlsdGVyKCBrZXkgPT4gIWtleXMuaW5jbHVkZXMoIGtleSApICkucmVkdWNlKCAoIG1lbW8sIGtleSApID0+IE9iamVjdC5hc3NpZ24oIG1lbW8sIHsgW2tleV06IG9ialtrZXldIH0gKSwgeyB9IClcbiAgICB9LFxuXG4gICAgcGljayggb2JqLCBrZXlzICkge1xuICAgICAgICByZXR1cm4ga2V5cy5yZWR1Y2UoICggbWVtbywga2V5ICkgPT4gT2JqZWN0LmFzc2lnbiggbWVtbywgeyBba2V5XTogb2JqW2tleV0gfSApLCB7IH0gKVxuICAgIH0sXG5cbiAgICBFcnJvcjogcmVxdWlyZSgnLi9NeUVycm9yJyksXG5cbiAgICBQOiAoIGZ1biwgYXJncz1bIF0sIHRoaXNBcmcgKSA9PlxuICAgICAgICBuZXcgUHJvbWlzZSggKCByZXNvbHZlLCByZWplY3QgKSA9PiBSZWZsZWN0LmFwcGx5KCBmdW4sIHRoaXNBcmcgfHwgdGhpcywgYXJncy5jb25jYXQoICggZSwgLi4uY2FsbGJhY2sgKSA9PiBlID8gcmVqZWN0KGUpIDogcmVzb2x2ZShjYWxsYmFjaykgKSApICksXG4gICAgXG4gICAgY29uc3RydWN0b3IoKSB7IHJldHVybiB0aGlzIH1cbn1cbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBdCBsZWFzdCBnaXZlIHNvbWUga2luZCBvZiBjb250ZXh0IHRvIHRoZSB1c2VyXG4gICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuICgnICsgZXIgKyAnKScpO1xuICAgICAgICBlcnIuY29udGV4dCA9IGVyO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSBpZiAobGlzdGVuZXJzKSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24odHlwZSkge1xuICBpZiAodGhpcy5fZXZlbnRzKSB7XG4gICAgdmFyIGV2bGlzdGVuZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgICBpZiAoaXNGdW5jdGlvbihldmxpc3RlbmVyKSlcbiAgICAgIHJldHVybiAxO1xuICAgIGVsc2UgaWYgKGV2bGlzdGVuZXIpXG4gICAgICByZXR1cm4gZXZsaXN0ZW5lci5sZW5ndGg7XG4gIH1cbiAgcmV0dXJuIDA7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJDb3VudCh0eXBlKTtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiIsIi8qXG4gKiBzbW9vdGhzY3JvbGwgcG9seWZpbGwgLSB2MC4zLjVcbiAqIGh0dHBzOi8vaWFtZHVzdGFuLmdpdGh1Yi5pby9zbW9vdGhzY3JvbGxcbiAqIDIwMTYgKGMpIER1c3RhbiBLYXN0ZW4sIEplcmVtaWFzIE1lbmljaGVsbGkgLSBNSVQgTGljZW5zZVxuICovXG5cbihmdW5jdGlvbih3LCBkLCB1bmRlZmluZWQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qXG4gICAqIGFsaWFzZXNcbiAgICogdzogd2luZG93IGdsb2JhbCBvYmplY3RcbiAgICogZDogZG9jdW1lbnRcbiAgICogdW5kZWZpbmVkOiB1bmRlZmluZWRcbiAgICovXG5cbiAgLy8gcG9seWZpbGxcbiAgZnVuY3Rpb24gcG9seWZpbGwoKSB7XG4gICAgLy8gcmV0dXJuIHdoZW4gc2Nyb2xsQmVoYXZpb3IgaW50ZXJmYWNlIGlzIHN1cHBvcnRlZFxuICAgIGlmICgnc2Nyb2xsQmVoYXZpb3InIGluIGQuZG9jdW1lbnRFbGVtZW50LnN0eWxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBnbG9iYWxzXG4gICAgICovXG4gICAgdmFyIEVsZW1lbnQgPSB3LkhUTUxFbGVtZW50IHx8IHcuRWxlbWVudDtcbiAgICB2YXIgU0NST0xMX1RJTUUgPSA0Njg7XG5cbiAgICAvKlxuICAgICAqIG9iamVjdCBnYXRoZXJpbmcgb3JpZ2luYWwgc2Nyb2xsIG1ldGhvZHNcbiAgICAgKi9cbiAgICB2YXIgb3JpZ2luYWwgPSB7XG4gICAgICBzY3JvbGw6IHcuc2Nyb2xsIHx8IHcuc2Nyb2xsVG8sXG4gICAgICBzY3JvbGxCeTogdy5zY3JvbGxCeSxcbiAgICAgIGVsU2Nyb2xsOiBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGwgfHwgc2Nyb2xsRWxlbWVudCxcbiAgICAgIHNjcm9sbEludG9WaWV3OiBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxJbnRvVmlld1xuICAgIH07XG5cbiAgICAvKlxuICAgICAqIGRlZmluZSB0aW1pbmcgbWV0aG9kXG4gICAgICovXG4gICAgdmFyIG5vdyA9IHcucGVyZm9ybWFuY2UgJiYgdy5wZXJmb3JtYW5jZS5ub3dcbiAgICAgID8gdy5wZXJmb3JtYW5jZS5ub3cuYmluZCh3LnBlcmZvcm1hbmNlKSA6IERhdGUubm93O1xuXG4gICAgLyoqXG4gICAgICogY2hhbmdlcyBzY3JvbGwgcG9zaXRpb24gaW5zaWRlIGFuIGVsZW1lbnRcbiAgICAgKiBAbWV0aG9kIHNjcm9sbEVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5XG4gICAgICovXG4gICAgZnVuY3Rpb24gc2Nyb2xsRWxlbWVudCh4LCB5KSB7XG4gICAgICB0aGlzLnNjcm9sbExlZnQgPSB4O1xuICAgICAgdGhpcy5zY3JvbGxUb3AgPSB5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHVybnMgcmVzdWx0IG9mIGFwcGx5aW5nIGVhc2UgbWF0aCBmdW5jdGlvbiB0byBhIG51bWJlclxuICAgICAqIEBtZXRob2QgZWFzZVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBrXG4gICAgICogQHJldHVybnMge051bWJlcn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBlYXNlKGspIHtcbiAgICAgIHJldHVybiAwLjUgKiAoMSAtIE1hdGguY29zKE1hdGguUEkgKiBrKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogaW5kaWNhdGVzIGlmIGEgc21vb3RoIGJlaGF2aW9yIHNob3VsZCBiZSBhcHBsaWVkXG4gICAgICogQG1ldGhvZCBzaG91bGRCYWlsT3V0XG4gICAgICogQHBhcmFtIHtOdW1iZXJ8T2JqZWN0fSB4XG4gICAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAgICovXG4gICAgZnVuY3Rpb24gc2hvdWxkQmFpbE91dCh4KSB7XG4gICAgICBpZiAodHlwZW9mIHggIT09ICdvYmplY3QnXG4gICAgICAgICAgICB8fCB4ID09PSBudWxsXG4gICAgICAgICAgICB8fCB4LmJlaGF2aW9yID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgIHx8IHguYmVoYXZpb3IgPT09ICdhdXRvJ1xuICAgICAgICAgICAgfHwgeC5iZWhhdmlvciA9PT0gJ2luc3RhbnQnKSB7XG4gICAgICAgIC8vIGZpcnN0IGFyZyBub3QgYW4gb2JqZWN0L251bGxcbiAgICAgICAgLy8gb3IgYmVoYXZpb3IgaXMgYXV0bywgaW5zdGFudCBvciB1bmRlZmluZWRcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgeCA9PT0gJ29iamVjdCdcbiAgICAgICAgICAgICYmIHguYmVoYXZpb3IgPT09ICdzbW9vdGgnKSB7XG4gICAgICAgIC8vIGZpcnN0IGFyZ3VtZW50IGlzIGFuIG9iamVjdCBhbmQgYmVoYXZpb3IgaXMgc21vb3RoXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gdGhyb3cgZXJyb3Igd2hlbiBiZWhhdmlvciBpcyBub3Qgc3VwcG9ydGVkXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdiZWhhdmlvciBub3QgdmFsaWQnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBmaW5kcyBzY3JvbGxhYmxlIHBhcmVudCBvZiBhbiBlbGVtZW50XG4gICAgICogQG1ldGhvZCBmaW5kU2Nyb2xsYWJsZVBhcmVudFxuICAgICAqIEBwYXJhbSB7Tm9kZX0gZWxcbiAgICAgKiBAcmV0dXJucyB7Tm9kZX0gZWxcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBmaW5kU2Nyb2xsYWJsZVBhcmVudChlbCkge1xuICAgICAgdmFyIGlzQm9keTtcbiAgICAgIHZhciBoYXNTY3JvbGxhYmxlU3BhY2U7XG4gICAgICB2YXIgaGFzVmlzaWJsZU92ZXJmbG93O1xuXG4gICAgICBkbyB7XG4gICAgICAgIGVsID0gZWwucGFyZW50Tm9kZTtcblxuICAgICAgICAvLyBzZXQgY29uZGl0aW9uIHZhcmlhYmxlc1xuICAgICAgICBpc0JvZHkgPSBlbCA9PT0gZC5ib2R5O1xuICAgICAgICBoYXNTY3JvbGxhYmxlU3BhY2UgPVxuICAgICAgICAgIGVsLmNsaWVudEhlaWdodCA8IGVsLnNjcm9sbEhlaWdodCB8fFxuICAgICAgICAgIGVsLmNsaWVudFdpZHRoIDwgZWwuc2Nyb2xsV2lkdGg7XG4gICAgICAgIGhhc1Zpc2libGVPdmVyZmxvdyA9XG4gICAgICAgICAgdy5nZXRDb21wdXRlZFN0eWxlKGVsLCBudWxsKS5vdmVyZmxvdyA9PT0gJ3Zpc2libGUnO1xuICAgICAgfSB3aGlsZSAoIWlzQm9keSAmJiAhKGhhc1Njcm9sbGFibGVTcGFjZSAmJiAhaGFzVmlzaWJsZU92ZXJmbG93KSk7XG5cbiAgICAgIGlzQm9keSA9IGhhc1Njcm9sbGFibGVTcGFjZSA9IGhhc1Zpc2libGVPdmVyZmxvdyA9IG51bGw7XG5cbiAgICAgIHJldHVybiBlbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzZWxmIGludm9rZWQgZnVuY3Rpb24gdGhhdCwgZ2l2ZW4gYSBjb250ZXh0LCBzdGVwcyB0aHJvdWdoIHNjcm9sbGluZ1xuICAgICAqIEBtZXRob2Qgc3RlcFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gICAgICovXG4gICAgZnVuY3Rpb24gc3RlcChjb250ZXh0KSB7XG4gICAgICB2YXIgdGltZSA9IG5vdygpO1xuICAgICAgdmFyIHZhbHVlO1xuICAgICAgdmFyIGN1cnJlbnRYO1xuICAgICAgdmFyIGN1cnJlbnRZO1xuICAgICAgdmFyIGVsYXBzZWQgPSAodGltZSAtIGNvbnRleHQuc3RhcnRUaW1lKSAvIFNDUk9MTF9USU1FO1xuXG4gICAgICAvLyBhdm9pZCBlbGFwc2VkIHRpbWVzIGhpZ2hlciB0aGFuIG9uZVxuICAgICAgZWxhcHNlZCA9IGVsYXBzZWQgPiAxID8gMSA6IGVsYXBzZWQ7XG5cbiAgICAgIC8vIGFwcGx5IGVhc2luZyB0byBlbGFwc2VkIHRpbWVcbiAgICAgIHZhbHVlID0gZWFzZShlbGFwc2VkKTtcblxuICAgICAgY3VycmVudFggPSBjb250ZXh0LnN0YXJ0WCArIChjb250ZXh0LnggLSBjb250ZXh0LnN0YXJ0WCkgKiB2YWx1ZTtcbiAgICAgIGN1cnJlbnRZID0gY29udGV4dC5zdGFydFkgKyAoY29udGV4dC55IC0gY29udGV4dC5zdGFydFkpICogdmFsdWU7XG5cbiAgICAgIGNvbnRleHQubWV0aG9kLmNhbGwoY29udGV4dC5zY3JvbGxhYmxlLCBjdXJyZW50WCwgY3VycmVudFkpO1xuXG4gICAgICAvLyBzY3JvbGwgbW9yZSBpZiB3ZSBoYXZlIG5vdCByZWFjaGVkIG91ciBkZXN0aW5hdGlvblxuICAgICAgaWYgKGN1cnJlbnRYICE9PSBjb250ZXh0LnggfHwgY3VycmVudFkgIT09IGNvbnRleHQueSkge1xuICAgICAgICB3LnJlcXVlc3RBbmltYXRpb25GcmFtZShzdGVwLmJpbmQodywgY29udGV4dCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHNjcm9sbHMgd2luZG93IHdpdGggYSBzbW9vdGggYmVoYXZpb3JcbiAgICAgKiBAbWV0aG9kIHNtb290aFNjcm9sbFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fE5vZGV9IGVsXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNtb290aFNjcm9sbChlbCwgeCwgeSkge1xuICAgICAgdmFyIHNjcm9sbGFibGU7XG4gICAgICB2YXIgc3RhcnRYO1xuICAgICAgdmFyIHN0YXJ0WTtcbiAgICAgIHZhciBtZXRob2Q7XG4gICAgICB2YXIgc3RhcnRUaW1lID0gbm93KCk7XG5cbiAgICAgIC8vIGRlZmluZSBzY3JvbGwgY29udGV4dFxuICAgICAgaWYgKGVsID09PSBkLmJvZHkpIHtcbiAgICAgICAgc2Nyb2xsYWJsZSA9IHc7XG4gICAgICAgIHN0YXJ0WCA9IHcuc2Nyb2xsWCB8fCB3LnBhZ2VYT2Zmc2V0O1xuICAgICAgICBzdGFydFkgPSB3LnNjcm9sbFkgfHwgdy5wYWdlWU9mZnNldDtcbiAgICAgICAgbWV0aG9kID0gb3JpZ2luYWwuc2Nyb2xsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2Nyb2xsYWJsZSA9IGVsO1xuICAgICAgICBzdGFydFggPSBlbC5zY3JvbGxMZWZ0O1xuICAgICAgICBzdGFydFkgPSBlbC5zY3JvbGxUb3A7XG4gICAgICAgIG1ldGhvZCA9IHNjcm9sbEVsZW1lbnQ7XG4gICAgICB9XG5cbiAgICAgIC8vIHNjcm9sbCBsb29waW5nIG92ZXIgYSBmcmFtZVxuICAgICAgc3RlcCh7XG4gICAgICAgIHNjcm9sbGFibGU6IHNjcm9sbGFibGUsXG4gICAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgICBzdGFydFRpbWU6IHN0YXJ0VGltZSxcbiAgICAgICAgc3RhcnRYOiBzdGFydFgsXG4gICAgICAgIHN0YXJ0WTogc3RhcnRZLFxuICAgICAgICB4OiB4LFxuICAgICAgICB5OiB5XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIE9SSUdJTkFMIE1FVEhPRFMgT1ZFUlJJREVTXG4gICAgICovXG5cbiAgICAvLyB3LnNjcm9sbCBhbmQgdy5zY3JvbGxUb1xuICAgIHcuc2Nyb2xsID0gdy5zY3JvbGxUbyA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gYXZvaWQgc21vb3RoIGJlaGF2aW9yIGlmIG5vdCByZXF1aXJlZFxuICAgICAgaWYgKHNob3VsZEJhaWxPdXQoYXJndW1lbnRzWzBdKSkge1xuICAgICAgICBvcmlnaW5hbC5zY3JvbGwuY2FsbChcbiAgICAgICAgICB3LFxuICAgICAgICAgIGFyZ3VtZW50c1swXS5sZWZ0IHx8IGFyZ3VtZW50c1swXSxcbiAgICAgICAgICBhcmd1bWVudHNbMF0udG9wIHx8IGFyZ3VtZW50c1sxXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIExFVCBUSEUgU01PT1RITkVTUyBCRUdJTiFcbiAgICAgIHNtb290aFNjcm9sbC5jYWxsKFxuICAgICAgICB3LFxuICAgICAgICBkLmJvZHksXG4gICAgICAgIH5+YXJndW1lbnRzWzBdLmxlZnQsXG4gICAgICAgIH5+YXJndW1lbnRzWzBdLnRvcFxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgLy8gdy5zY3JvbGxCeVxuICAgIHcuc2Nyb2xsQnkgPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGF2b2lkIHNtb290aCBiZWhhdmlvciBpZiBub3QgcmVxdWlyZWRcbiAgICAgIGlmIChzaG91bGRCYWlsT3V0KGFyZ3VtZW50c1swXSkpIHtcbiAgICAgICAgb3JpZ2luYWwuc2Nyb2xsQnkuY2FsbChcbiAgICAgICAgICB3LFxuICAgICAgICAgIGFyZ3VtZW50c1swXS5sZWZ0IHx8IGFyZ3VtZW50c1swXSxcbiAgICAgICAgICBhcmd1bWVudHNbMF0udG9wIHx8IGFyZ3VtZW50c1sxXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIExFVCBUSEUgU01PT1RITkVTUyBCRUdJTiFcbiAgICAgIHNtb290aFNjcm9sbC5jYWxsKFxuICAgICAgICB3LFxuICAgICAgICBkLmJvZHksXG4gICAgICAgIH5+YXJndW1lbnRzWzBdLmxlZnQgKyAody5zY3JvbGxYIHx8IHcucGFnZVhPZmZzZXQpLFxuICAgICAgICB+fmFyZ3VtZW50c1swXS50b3AgKyAody5zY3JvbGxZIHx8IHcucGFnZVlPZmZzZXQpXG4gICAgICApO1xuICAgIH07XG5cbiAgICAvLyBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGwgYW5kIEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbFRvXG4gICAgRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsID0gRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsVG8gPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGF2b2lkIHNtb290aCBiZWhhdmlvciBpZiBub3QgcmVxdWlyZWRcbiAgICAgIGlmIChzaG91bGRCYWlsT3V0KGFyZ3VtZW50c1swXSkpIHtcbiAgICAgICAgb3JpZ2luYWwuZWxTY3JvbGwuY2FsbChcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICBhcmd1bWVudHNbMF0ubGVmdCB8fCBhcmd1bWVudHNbMF0sXG4gICAgICAgICAgICBhcmd1bWVudHNbMF0udG9wIHx8IGFyZ3VtZW50c1sxXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIExFVCBUSEUgU01PT1RITkVTUyBCRUdJTiFcbiAgICAgIHNtb290aFNjcm9sbC5jYWxsKFxuICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgdGhpcyxcbiAgICAgICAgICBhcmd1bWVudHNbMF0ubGVmdCxcbiAgICAgICAgICBhcmd1bWVudHNbMF0udG9wXG4gICAgICApO1xuICAgIH07XG5cbiAgICAvLyBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxCeVxuICAgIEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbEJ5ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJnMCA9IGFyZ3VtZW50c1swXTtcblxuICAgICAgaWYgKHR5cGVvZiBhcmcwID09PSAnb2JqZWN0Jykge1xuICAgICAgICB0aGlzLnNjcm9sbCh7XG4gICAgICAgICAgbGVmdDogYXJnMC5sZWZ0ICsgdGhpcy5zY3JvbGxMZWZ0LFxuICAgICAgICAgIHRvcDogYXJnMC50b3AgKyB0aGlzLnNjcm9sbFRvcCxcbiAgICAgICAgICBiZWhhdmlvcjogYXJnMC5iZWhhdmlvclxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2Nyb2xsKFxuICAgICAgICAgIHRoaXMuc2Nyb2xsTGVmdCArIGFyZzAsXG4gICAgICAgICAgdGhpcy5zY3JvbGxUb3AgKyBhcmd1bWVudHNbMV1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsSW50b1ZpZXdcbiAgICBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxJbnRvVmlldyA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gYXZvaWQgc21vb3RoIGJlaGF2aW9yIGlmIG5vdCByZXF1aXJlZFxuICAgICAgaWYgKHNob3VsZEJhaWxPdXQoYXJndW1lbnRzWzBdKSkge1xuICAgICAgICBvcmlnaW5hbC5zY3JvbGxJbnRvVmlldy5jYWxsKHRoaXMsIGFyZ3VtZW50c1swXSB8fCB0cnVlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBMRVQgVEhFIFNNT09USE5FU1MgQkVHSU4hXG4gICAgICB2YXIgc2Nyb2xsYWJsZVBhcmVudCA9IGZpbmRTY3JvbGxhYmxlUGFyZW50KHRoaXMpO1xuICAgICAgdmFyIHBhcmVudFJlY3RzID0gc2Nyb2xsYWJsZVBhcmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIHZhciBjbGllbnRSZWN0cyA9IHRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgIGlmIChzY3JvbGxhYmxlUGFyZW50ICE9PSBkLmJvZHkpIHtcbiAgICAgICAgLy8gcmV2ZWFsIGVsZW1lbnQgaW5zaWRlIHBhcmVudFxuICAgICAgICBzbW9vdGhTY3JvbGwuY2FsbChcbiAgICAgICAgICB0aGlzLFxuICAgICAgICAgIHNjcm9sbGFibGVQYXJlbnQsXG4gICAgICAgICAgc2Nyb2xsYWJsZVBhcmVudC5zY3JvbGxMZWZ0ICsgY2xpZW50UmVjdHMubGVmdCAtIHBhcmVudFJlY3RzLmxlZnQsXG4gICAgICAgICAgc2Nyb2xsYWJsZVBhcmVudC5zY3JvbGxUb3AgKyBjbGllbnRSZWN0cy50b3AgLSBwYXJlbnRSZWN0cy50b3BcbiAgICAgICAgKTtcbiAgICAgICAgLy8gcmV2ZWFsIHBhcmVudCBpbiB2aWV3cG9ydFxuICAgICAgICB3LnNjcm9sbEJ5KHtcbiAgICAgICAgICBsZWZ0OiBwYXJlbnRSZWN0cy5sZWZ0LFxuICAgICAgICAgIHRvcDogcGFyZW50UmVjdHMudG9wLFxuICAgICAgICAgIGJlaGF2aW9yOiAnc21vb3RoJ1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHJldmVhbCBlbGVtZW50IGluIHZpZXdwb3J0XG4gICAgICAgIHcuc2Nyb2xsQnkoe1xuICAgICAgICAgIGxlZnQ6IGNsaWVudFJlY3RzLmxlZnQsXG4gICAgICAgICAgdG9wOiBjbGllbnRSZWN0cy50b3AsXG4gICAgICAgICAgYmVoYXZpb3I6ICdzbW9vdGgnXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgLy8gY29tbW9uanNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHsgcG9seWZpbGw6IHBvbHlmaWxsIH07XG4gIH0gZWxzZSB7XG4gICAgLy8gZ2xvYmFsXG4gICAgcG9seWZpbGwoKTtcbiAgfVxufSkod2luZG93LCBkb2N1bWVudCk7XG4iXX0=
