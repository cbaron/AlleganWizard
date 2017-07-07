(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = {
	Footer: require('./views/templates/Footer'),
	Header: require('./views/templates/Header'),
	Home: require('./views/templates/Home'),
	Internet: require('./views/templates/Internet'),
	Services: require('./views/templates/Services'),
	Toast: require('./views/templates/Toast'),
	ToastMessage: require('./views/templates/ToastMessage')
};

},{"./views/templates/Footer":19,"./views/templates/Header":20,"./views/templates/Home":21,"./views/templates/Internet":22,"./views/templates/Services":23,"./views/templates/Toast":24,"./views/templates/ToastMessage":25}],2:[function(require,module,exports){
'use strict';

module.exports = {
	Footer: require('./views/Footer'),
	Header: require('./views/Header'),
	Home: require('./views/Home'),
	Internet: require('./views/Internet'),
	Services: require('./views/Services'),
	Toast: require('./views/Toast'),
	ToastMessage: require('./views/ToastMessage')
};

},{"./views/Footer":10,"./views/Header":11,"./views/Home":12,"./views/Internet":13,"./views/Services":14,"./views/Toast":15,"./views/ToastMessage":16}],3:[function(require,module,exports){
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

},{"../../lib/MyObject":30}],4:[function(require,module,exports){
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

},{"../../../lib/Model":28,"../../../lib/MyObject":30,"../Xhr":3,"events":31}],8:[function(require,module,exports){
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

},{"smoothscroll-polyfill":32}],9:[function(require,module,exports){
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

},{"../../lib/MyError":29,"./.ViewMap":2,"./factory/View":4,"./views/Toast":15}],10:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {});

},{"./__proto__":17}],11:[function(require,module,exports){
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

},{"./__proto__":17}],12:[function(require,module,exports){
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

},{"./__proto__":17}],13:[function(require,module,exports){
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
                return _this.Toast.createMessage('success', "Info sent! We'll keep you posted!").then(function () {
                    _this.emit('navigate', '/');
                    _this.onSubmitEnd();
                    _this.clearForm();
                });
            }).catch(function (e) {
                _this.Toast.createMessage('error', e && e.message ? e.message : 'There was a problem. Please try again or contact us.');
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
                _this3.Toast.createMessage('error', _this3.model.fields[attr].error);
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

},{"../models/Person":6,"./__proto__":17}],14:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {});

},{"./__proto__":17}],15:[function(require,module,exports){
'use strict';

module.exports = Object.create(Object.assign({}, require('./__proto__'), {

    ToastMessage: require('./ToastMessage'),

    name: 'Toast',

    postRender: function postRender() {
        this.messages = {};

        return this;
    },


    requiresLogin: false,

    createMessage: function createMessage(type, message) {
        if (!this.messages[message]) this.messages[message] = Object.create(this.ToastMessage, {
            insertion: { value: { el: this.els.container } }
        }).constructor();

        return this.messages[message].showMessage(type, message);
    },


    template: require('./templates/Toast')

}), {});

},{"./ToastMessage":16,"./__proto__":17,"./templates/Toast":24}],16:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {

    name: 'ToastMessage',

    Icons: {
        error: require('./templates/lib/error')(),
        success: require('./templates/lib/checkmark')()
    },

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


    template: require('./templates/ToastMessage')

});

},{"./__proto__":17,"./templates/ToastMessage":25,"./templates/lib/checkmark":26,"./templates/lib/error":27}],17:[function(require,module,exports){
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
    delete: function _delete(isSlow) {
        var _this3 = this;

        var animate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        return this.hide(isSlow, animate).then(function () {
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

        if (this.templateOptions) rv.opts = typeof this.templateOptions === 'function' ? this.templateOptions() : this.templateOptions;

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

},{"../../../lib/MyObject":30,"../models/__proto__":7,"./lib/OptimizedResize":18,"events":31}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
"use strict";

module.exports = function (p) {
    return "<footer>\n    <div class=\"contact\">\n        <div>&copy; 2017 | Allegan Internet Wizard</div>\n        <div>123 Bayron Lane | Allegan, MI 12345 | 123.456.7890</div>\n        <div>the_wiz@aiw.com</div>\n    </div>\n</footer>";
};

},{}],20:[function(require,module,exports){
"use strict";

module.exports = function () {
    return "<nav>\n    <div class=\"contact\">\n        <div>phone: 123.456.7890 | email: the_wiz@aiw.com</div>\n    </div>\n    <ul data-js=\"nav\">\n        <li data-name=\"home\">Home</li>\n        <li data-name=\"services\">Services</li>\n        <li data-name=\"internet\">Local Internet!</li>\n    </ul>\n</nav>";
};

},{}],21:[function(require,module,exports){
"use strict";

module.exports = function () {
    return "<div>\n    <div>\n        <img src=\"/static/img/logo.svg\">\n    </div>\n    <div>\n        <h2>Make Your Tech Problems Magically Disappear!</h2>\n        <p>Computers. Can't live with 'em, can't live without 'em. They're a huge part of our lives these days, but unfortunately\n        they haven't gotten any less complicated. Things can and do go wrong all the time, and then you end up spending hours\n        and hours of your valuable time trying to figure out what the heck happened and fix it. Life's too short for all that frustration.\n        Why not hire a professional to take care of it quickly and painlessly? Give The Wizard a call!</p>\n        <p>Allegan Internet Wizard is here to assist the citizens of Allegan with all of their tech needs. Whether you are a\n        normal home user or a small business, we will use our 15+ years of experience in the tech industry to solve your problems\n        with speed, courtesy, and professionalism. Want to find out more? Click <span class=\"link\" data-js=\"services\">here</span>\n        for a list of our services.</p>\n        <p><span class=\"notice\">Special notice</span>: we are considering expanding our business to provide internet service to Allegan.\n        Click <span class=\"link\" data-js=\"internet\">here</span> to find out more.</p>\n    </div>        \n</div>";
};

},{}],22:[function(require,module,exports){
"use strict";

module.exports = function () {
    return "<div>\n    <div>\n        <h2>Local Internet Service for Allegan</h2>\n        <p>Not happy with your internet options in Allegan? Tired of paying too much for lousy speeds and constant service interruptions?\n        Well, you're in luck, because Allegan Internet Wizard is currently considering launching our own internet service for\n        the fine citizens of Allegan. We believe there's not nearly enough freedom and choice when it comes to internet providers, and\n        we'd like to use our tech skills to change that and offer Allegan fast, reliable service at a reasonable price.\n        Let's give those fat cat telecoms some real competition!</p>\n        <p>If this sounds good to you, please leave your name and contact info, and we'll let you know how things are developing.\n        Thank you for your interest!</p>\n    </div>\n    <div class=\"border\"></div>\n    <form>\n        <input data-js=\"name\" type=\"text\" placeholder=\"Name\">\n        <input data-js=\"contact\" type=\"text\" placeholder=\"Email or Phone Number\">\n        <input data-js=\"address\" type=\"text\" placeholder=\"Address\">\n        <button data-js=\"submitBtn\" type=\"button\">Submit</button>\n    </form>\n</div>";
};

},{}],23:[function(require,module,exports){
"use strict";

module.exports = function () {
    return "<div>\n    <h1>Our Services</h1>\n    <div class=\"intro\">\n        <p>Want to improve your home network? Protect your kids from inappropriate content on the web? Need help exploring\n        your internet service options? Can't figure out why a web page isn't working? Maybe you're a business and want to build\n        a new website or improve your current one. From general tech support to web development, we've got you covered!</p>\n    </div>\n    <div class=\"border\"></div>\n    <div class=\"categories\">\n        <div>\n            <h3>General Tech Support</h3>\n            <ul>\n                <li>Mac and PC. Laptop, desktop, mobile, and tablet. Tell us your problem and we'll fix it!</li>\n            </ul>\n        </div>\n        <div>\n            <h3>Internet Service Advice</h3>\n            <ul>\n                <li>We'll take a look at where you live and let you know what your best options are for connecting\n                to the internet</li>\n            </ul>\n        </div>\n        <div>\n            <h3>Data Recovery and Backups</h3>\n            <ul>\n                <li>Hard drive crash? We'll help you get your valuable data back</li>\n                <li>And we'll help you back your data up so that it's safe for the future</li>\n            </ul>\n        </div>\n        <div>\n            <h3>Networks</h3>\n            <ul>\n                <li>Installation of wired and wireless networks</li>\n                <li>Troubleshooting for internet connection issues</li>\n                <li>Configuration of modems and routers</li>\n            </ul>\n        </div>\n        <div>\n            <h3>Computer Security</h3>\n            <ul>\n                <li>Keep your kids safe from inappropriate content</li>\n                <li>Find and eliminate viruses, malware, and spyware</li>\n                <li>Set up antivirus software and firewalls for further protection</li>\n            </ul>\n       </div>\n        <div>\n            <h3>Help for Businesses</h3>\n            <ul>\n                <li>Fully customizable websites that will improve your brand and optimize your workflow</li>\n                <li>Setting up company email</li>\n                <li>Server installation</li>\n            </ul>\n        </div>\n    </div>\n</div>";
};

},{}],24:[function(require,module,exports){
"use strict";

module.exports = function () {
  return "<div></div>";
};

},{}],25:[function(require,module,exports){
"use strict";

module.exports = function () {
    return "<div class=\"hidden\">\n    <div data-js=\"icon\"></div>\n    <div>\n        <div data-js=\"title\"></div>\n        <div data-js=\"message\"></div>\n    </div>\n</div>";
};

},{}],26:[function(require,module,exports){
'use strict';

module.exports = function () {
	var p = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	return '<svg version="1.1" data-js="' + (p.name || 'checkmark') + '" class="checkmark" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n\t width="97.619px" height="97.618px" viewBox="0 0 97.619 97.618" style="enable-background:new 0 0 97.619 97.618;"\n\t xml:space="preserve">\n<g>\n\t<path d="M96.939,17.358L83.968,5.959c-0.398-0.352-0.927-0.531-1.449-0.494C81.99,5.5,81.496,5.743,81.146,6.142L34.1,59.688\n\t\tL17.372,37.547c-0.319-0.422-0.794-0.701-1.319-0.773c-0.524-0.078-1.059,0.064-1.481,0.385L0.794,47.567\n\t\tc-0.881,0.666-1.056,1.92-0.39,2.801l30.974,40.996c0.362,0.479,0.922,0.771,1.522,0.793c0.024,0,0.049,0,0.073,0\n\t\tc0.574,0,1.122-0.246,1.503-0.68l62.644-71.297C97.85,19.351,97.769,18.086,96.939,17.358z"/>\n</g></svg>';
};

},{}],27:[function(require,module,exports){
'use strict';

module.exports = function () {
    var p = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return '<svg version="1.1" data-js="' + (p.name || 'error') + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 18.978 18.978" style="enable-background:new 0 0 18.978 18.978;" xml:space="preserve">\n<g>\n    <path d="M16.088,1.675c-0.133-0.104-0.306-0.144-0.47-0.105c-0.013,0.002-1.261,0.29-2.594,0.29\n        c-1.788,0-2.789-0.476-2.975-1.415C9.999,0.191,9.779,0.007,9.521,0c-0.257-0.007-0.487,0.167-0.55,0.418\n        C8.727,1.386,7.71,1.877,5.95,1.877c-1.332,0-2.571-0.302-2.583-0.305c-0.166-0.04-0.34-0.004-0.474,0.102\n        C2.76,1.777,2.681,1.938,2.681,2.108v4.869c0,0.04,0.004,0.078,0.013,0.115c0.057,1.647,0.65,8.714,6.528,11.822\n        c0.08,0.043,0.169,0.064,0.258,0.064c0.092,0,0.183-0.021,0.266-0.066c5.74-3.137,6.445-10.115,6.532-11.791\n        c0.012-0.046,0.019-0.094,0.019-0.144V2.108C16.297,1.939,16.219,1.78,16.088,1.675z M15.19,6.857\n        c-0.007,0.031-0.012,0.064-0.013,0.097c-0.053,1.298-0.574,7.832-5.701,10.838c-5.215-2.965-5.646-9.526-5.68-10.83\n        c0-0.029-0.004-0.058-0.009-0.085V2.784C4.322,2.877,5.112,2.982,5.95,2.982c1.911,0,2.965-0.54,3.537-1.208\n        c0.553,0.661,1.599,1.191,3.536,1.191c0.839,0,1.631-0.101,2.166-0.188L15.19,6.857L15.19,6.857z"/>\n    <polygon points="10.241,11.237 10.529,5.311 8.449,5.311 8.75,11.237 \t\t"/>\n    <path d="M9.496,11.891c-0.694,0-1.178,0.498-1.178,1.189c0,0.682,0.471,1.191,1.178,1.191\n        c0.706,0,1.164-0.51,1.164-1.191C10.647,12.389,10.189,11.891,9.496,11.891z"/>\n</g></svg>';
};

},{}],28:[function(require,module,exports){
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

},{}],29:[function(require,module,exports){
"use strict";

module.exports = function (err) {
  console.log(err.stack || err);
};

},{}],30:[function(require,module,exports){
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

},{"./MyError":29}],31:[function(require,module,exports){
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

},{}],32:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvanMvLlRlbXBsYXRlTWFwLmpzIiwiY2xpZW50L2pzLy5WaWV3TWFwLmpzIiwiY2xpZW50L2pzL1hoci5qcyIsImNsaWVudC9qcy9mYWN0b3J5L1ZpZXcuanMiLCJjbGllbnQvanMvbWFpbi5qcyIsImNsaWVudC9qcy9tb2RlbHMvUGVyc29uLmpzIiwiY2xpZW50L2pzL21vZGVscy9fX3Byb3RvX18uanMiLCJjbGllbnQvanMvcG9seWZpbGwuanMiLCJjbGllbnQvanMvcm91dGVyLmpzIiwiY2xpZW50L2pzL3ZpZXdzL0Zvb3Rlci5qcyIsImNsaWVudC9qcy92aWV3cy9IZWFkZXIuanMiLCJjbGllbnQvanMvdmlld3MvSG9tZS5qcyIsImNsaWVudC9qcy92aWV3cy9JbnRlcm5ldC5qcyIsImNsaWVudC9qcy92aWV3cy9TZXJ2aWNlcy5qcyIsImNsaWVudC9qcy92aWV3cy9Ub2FzdC5qcyIsImNsaWVudC9qcy92aWV3cy9Ub2FzdE1lc3NhZ2UuanMiLCJjbGllbnQvanMvdmlld3MvX19wcm90b19fLmpzIiwiY2xpZW50L2pzL3ZpZXdzL2xpYi9PcHRpbWl6ZWRSZXNpemUuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL0Zvb3Rlci5qcyIsImNsaWVudC9qcy92aWV3cy90ZW1wbGF0ZXMvSGVhZGVyLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9Ib21lLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9JbnRlcm5ldC5qcyIsImNsaWVudC9qcy92aWV3cy90ZW1wbGF0ZXMvU2VydmljZXMuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL1RvYXN0LmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9Ub2FzdE1lc3NhZ2UuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi9jaGVja21hcmsuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi9lcnJvci5qcyIsImxpYi9Nb2RlbC5qcyIsImxpYi9NeUVycm9yLmpzIiwibGliL015T2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCJub2RlX21vZHVsZXMvc21vb3Roc2Nyb2xsLXBvbHlmaWxsL2Rpc3Qvc21vb3Roc2Nyb2xsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxPQUFPLE9BQVAsR0FBZTtBQUNkLFNBQVEsUUFBUSwwQkFBUixDQURNO0FBRWQsU0FBUSxRQUFRLDBCQUFSLENBRk07QUFHZCxPQUFNLFFBQVEsd0JBQVIsQ0FIUTtBQUlkLFdBQVUsUUFBUSw0QkFBUixDQUpJO0FBS2QsV0FBVSxRQUFRLDRCQUFSLENBTEk7QUFNZCxRQUFPLFFBQVEseUJBQVIsQ0FOTztBQU9kLGVBQWMsUUFBUSxnQ0FBUjtBQVBBLENBQWY7Ozs7O0FDQUEsT0FBTyxPQUFQLEdBQWU7QUFDZCxTQUFRLFFBQVEsZ0JBQVIsQ0FETTtBQUVkLFNBQVEsUUFBUSxnQkFBUixDQUZNO0FBR2QsT0FBTSxRQUFRLGNBQVIsQ0FIUTtBQUlkLFdBQVUsUUFBUSxrQkFBUixDQUpJO0FBS2QsV0FBVSxRQUFRLGtCQUFSLENBTEk7QUFNZCxRQUFPLFFBQVEsZUFBUixDQU5PO0FBT2QsZUFBYyxRQUFRLHNCQUFSO0FBUEEsQ0FBZjs7Ozs7QUNBQSxPQUFPLE9BQVAsR0FBaUIsT0FBTyxNQUFQLENBQWUsT0FBTyxNQUFQLENBQWUsRUFBZixFQUFtQixRQUFRLG9CQUFSLENBQW5CLEVBQWtEOztBQUU5RSxhQUFTO0FBRUwsbUJBRkssdUJBRVEsSUFGUixFQUVlO0FBQUE7O0FBQ2hCLGdCQUFJLE1BQU0sSUFBSSxjQUFKLEVBQVY7O0FBRUEsZ0JBQUksS0FBSyxVQUFULEVBQXNCLElBQUksZ0JBQUosQ0FBc0IsVUFBdEIsRUFBa0M7QUFBQSx1QkFDcEQsS0FBSyxVQUFMLENBQWlCLEVBQUUsZ0JBQUYsR0FBcUIsS0FBSyxLQUFMLENBQWMsRUFBRSxN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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHM9e1xuXHRGb290ZXI6IHJlcXVpcmUoJy4vdmlld3MvdGVtcGxhdGVzL0Zvb3RlcicpLFxuXHRIZWFkZXI6IHJlcXVpcmUoJy4vdmlld3MvdGVtcGxhdGVzL0hlYWRlcicpLFxuXHRIb21lOiByZXF1aXJlKCcuL3ZpZXdzL3RlbXBsYXRlcy9Ib21lJyksXG5cdEludGVybmV0OiByZXF1aXJlKCcuL3ZpZXdzL3RlbXBsYXRlcy9JbnRlcm5ldCcpLFxuXHRTZXJ2aWNlczogcmVxdWlyZSgnLi92aWV3cy90ZW1wbGF0ZXMvU2VydmljZXMnKSxcblx0VG9hc3Q6IHJlcXVpcmUoJy4vdmlld3MvdGVtcGxhdGVzL1RvYXN0JyksXG5cdFRvYXN0TWVzc2FnZTogcmVxdWlyZSgnLi92aWV3cy90ZW1wbGF0ZXMvVG9hc3RNZXNzYWdlJylcbn0iLCJtb2R1bGUuZXhwb3J0cz17XG5cdEZvb3RlcjogcmVxdWlyZSgnLi92aWV3cy9Gb290ZXInKSxcblx0SGVhZGVyOiByZXF1aXJlKCcuL3ZpZXdzL0hlYWRlcicpLFxuXHRIb21lOiByZXF1aXJlKCcuL3ZpZXdzL0hvbWUnKSxcblx0SW50ZXJuZXQ6IHJlcXVpcmUoJy4vdmlld3MvSW50ZXJuZXQnKSxcblx0U2VydmljZXM6IHJlcXVpcmUoJy4vdmlld3MvU2VydmljZXMnKSxcblx0VG9hc3Q6IHJlcXVpcmUoJy4vdmlld3MvVG9hc3QnKSxcblx0VG9hc3RNZXNzYWdlOiByZXF1aXJlKCcuL3ZpZXdzL1RvYXN0TWVzc2FnZScpXG59IiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi4vLi4vbGliL015T2JqZWN0JyksIHtcblxuICAgIFJlcXVlc3Q6IHtcblxuICAgICAgICBjb25zdHJ1Y3RvciggZGF0YSApIHtcbiAgICAgICAgICAgIGxldCByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICAgICAgICBpZiggZGF0YS5vblByb2dyZXNzICkgcmVxLmFkZEV2ZW50TGlzdGVuZXIoIFwicHJvZ3Jlc3NcIiwgZSA9PlxuICAgICAgICAgICAgICAgIGRhdGEub25Qcm9ncmVzcyggZS5sZW5ndGhDb21wdXRhYmxlID8gTWF0aC5mbG9vciggKCBlLmxvYWRlZCAvIGUudG90YWwgKSAqIDEwMCApIDogMCApIFxuICAgICAgICAgICAgKVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xuXG4gICAgICAgICAgICAgICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBbIDUwMCwgNDA0LCA0MDEgXS5pbmNsdWRlcyggdGhpcy5zdGF0dXMgKVxuICAgICAgICAgICAgICAgICAgICAgICAgPyByZWplY3QoIEpTT04ucGFyc2UoIHRoaXMucmVzcG9uc2UgKSApXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHJlc29sdmUoIEpTT04ucGFyc2UoIHRoaXMucmVzcG9uc2UgKSApXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYoIGRhdGEubWV0aG9kID09PSBcImdldFwiIHx8IGRhdGEubWV0aG9kID09PSBcIm9wdGlvbnNcIiApIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHFzID0gZGF0YS5xcyA/IGA/JHtkYXRhLnFzfWAgOiAnJyBcbiAgICAgICAgICAgICAgICAgICAgcmVxLm9wZW4oIGRhdGEubWV0aG9kLCBgLyR7ZGF0YS5yZXNvdXJjZX0ke3FzfWAgKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEhlYWRlcnMoIHJlcSwgZGF0YS5oZWFkZXJzIClcbiAgICAgICAgICAgICAgICAgICAgcmVxLnNlbmQobnVsbClcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXRoID0gYC8ke2RhdGEucmVzb3VyY2V9YCArICggZGF0YS5pZCA/IGAvJHtkYXRhLmlkfWAgOiAnJyApO1xuICAgICAgICAgICAgICAgICAgICByZXEub3BlbiggZGF0YS5tZXRob2QudG9VcHBlckNhc2UoKSwgcGF0aCwgdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRIZWFkZXJzKCByZXEsIGRhdGEuaGVhZGVycyApXG4gICAgICAgICAgICAgICAgICAgIHJlcS5zZW5kKCBkYXRhLmRhdGEgfHwgbnVsbCApXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYoIGRhdGEub25Qcm9ncmVzcyApIGRhdGEub25Qcm9ncmVzcyggJ3NlbnQnIClcbiAgICAgICAgICAgIH0gKVxuICAgICAgICB9LFxuXG4gICAgICAgIHBsYWluRXNjYXBlKCBzVGV4dCApIHtcbiAgICAgICAgICAgIC8qIGhvdyBzaG91bGQgSSB0cmVhdCBhIHRleHQvcGxhaW4gZm9ybSBlbmNvZGluZz8gd2hhdCBjaGFyYWN0ZXJzIGFyZSBub3QgYWxsb3dlZD8gdGhpcyBpcyB3aGF0IEkgc3VwcG9zZS4uLjogKi9cbiAgICAgICAgICAgIC8qIFwiNFxcM1xcNyAtIEVpbnN0ZWluIHNhaWQgRT1tYzJcIiAtLS0tPiBcIjRcXFxcM1xcXFw3XFwgLVxcIEVpbnN0ZWluXFwgc2FpZFxcIEVcXD1tYzJcIiAqL1xuICAgICAgICAgICAgcmV0dXJuIHNUZXh0LnJlcGxhY2UoL1tcXHNcXD1cXFxcXS9nLCBcIlxcXFwkJlwiKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRIZWFkZXJzKCByZXEsIGhlYWRlcnM9e30gKSB7XG4gICAgICAgICAgICByZXEuc2V0UmVxdWVzdEhlYWRlciggXCJBY2NlcHRcIiwgaGVhZGVycy5hY2NlcHQgfHwgJ2FwcGxpY2F0aW9uL2pzb24nIClcbiAgICAgICAgICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKCBcIkNvbnRlbnQtVHlwZVwiLCBoZWFkZXJzLmNvbnRlbnRUeXBlIHx8ICd0ZXh0L3BsYWluJyApXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX2ZhY3RvcnkoIGRhdGEgKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuY3JlYXRlKCB0aGlzLlJlcXVlc3QsIHsgfSApLmNvbnN0cnVjdG9yKCBkYXRhIClcbiAgICB9LFxuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgaWYoICFYTUxIdHRwUmVxdWVzdC5wcm90b3R5cGUuc2VuZEFzQmluYXJ5ICkge1xuICAgICAgICAgIFhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZS5zZW5kQXNCaW5hcnkgPSBmdW5jdGlvbihzRGF0YSkge1xuICAgICAgICAgICAgdmFyIG5CeXRlcyA9IHNEYXRhLmxlbmd0aCwgdWk4RGF0YSA9IG5ldyBVaW50OEFycmF5KG5CeXRlcyk7XG4gICAgICAgICAgICBmb3IgKHZhciBuSWR4ID0gMDsgbklkeCA8IG5CeXRlczsgbklkeCsrKSB7XG4gICAgICAgICAgICAgIHVpOERhdGFbbklkeF0gPSBzRGF0YS5jaGFyQ29kZUF0KG5JZHgpICYgMHhmZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2VuZCh1aThEYXRhKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZhY3RvcnkuYmluZCh0aGlzKVxuICAgIH1cblxufSApLCB7IH0gKS5jb25zdHJ1Y3RvcigpXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIHtcblxuICAgIGNyZWF0ZSggbmFtZSwgb3B0cyApIHtcbiAgICAgICAgY29uc3QgbG93ZXIgPSBuYW1lXG4gICAgICAgIG5hbWUgPSBuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zbGljZSgxKVxuICAgICAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZShcbiAgICAgICAgICAgIHRoaXMuVmlld3NbIG5hbWUgXSxcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oIHtcbiAgICAgICAgICAgICAgICBUb2FzdDogeyB2YWx1ZTogdGhpcy5Ub2FzdCB9LFxuICAgICAgICAgICAgICAgIG5hbWU6IHsgdmFsdWU6IG5hbWUgfSxcbiAgICAgICAgICAgICAgICBmYWN0b3J5OiB7IHZhbHVlOiB0aGlzIH0sXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IHsgdmFsdWU6IHRoaXMuVGVtcGxhdGVzWyBuYW1lIF0gfSxcbiAgICAgICAgICAgIH0sIG9wdHMgKVxuICAgICAgICApLmNvbnN0cnVjdG9yKClcbiAgICB9LFxuXG59LCB7XG4gICAgVGVtcGxhdGVzOiB7IHZhbHVlOiByZXF1aXJlKCcuLi8uVGVtcGxhdGVNYXAnKSB9LFxuICAgIFRvYXN0OiB7IHZhbHVlOiByZXF1aXJlKCcuLi92aWV3cy9Ub2FzdCcpIH0sXG4gICAgVmlld3M6IHsgdmFsdWU6IHJlcXVpcmUoJy4uLy5WaWV3TWFwJykgfVxufSApXG4iLCJcbmNvbnN0IHJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVyJyksXG4gICAgb25Mb2FkID0gbmV3IFByb21pc2UoIHJlc29sdmUgPT4gd2luZG93Lm9ubG9hZCA9ICgpID0+IHJlc29sdmUoKSApXG5cbnJlcXVpcmUoJy4vcG9seWZpbGwnKVxuXG5vbkxvYWQudGhlbiggKCkgPT4gcm91dGVyLmluaXRpYWxpemUoKSApXG4uY2F0Y2goIGUgPT4gY29uc29sZS5sb2coIGBFcnJvciBpbml0aWFsaXppbmcgY2xpZW50IC0+ICR7ZS5zdGFjayB8fCBlfWAgKSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG5cbiAgICBkYXRhOiB7IH0sXG4gICAgXG4gICAgZmllbGRzOiB7XG4gICAgICAgIG5hbWU6IHtcbiAgICAgICAgICAgIGVycm9yOiAnUGxlYXNlIGVudGVyIHlvdXIgbmFtZSdcbiAgICAgICAgfSxcbiAgICAgICAgY29udGFjdDoge1xuICAgICAgICAgICAgZXJyb3I6ICdQbGVhc2UgZW50ZXIgYSB2YWxpZCBlbWFpbCBhZGRyZXNzIG9yIHBob25lIG51bWJlcidcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZXNvdXJjZTogJ3BlcnNvbicsXG5cbiAgICB2YWxpZGF0ZSggZmllbGQsIHZhbHVlICkge1xuICAgICAgICBjb25zdCB2YWwgPSB2YWx1ZS50cmltKClcblxuICAgICAgICBpZiggZmllbGQgPT09ICduYW1lJyAmJiB2YWwgPT09IFwiXCIgKSByZXR1cm4gZmFsc2VcblxuICAgICAgICBpZiggZmllbGQgPT09ICdjb250YWN0JyAmJiAoICF0aGlzLl9lbWFpbFJlZ2V4LnRlc3QoIHZhbCApICYmICF0aGlzLl9waG9uZVJlZ2V4LnRlc3QoIHZhbCApICkgKSByZXR1cm4gZmFsc2VcblxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH0sXG5cbiAgICBfZW1haWxSZWdleDogL15cXHcrKFtcXC4tXT9cXHcrKSpAXFx3KyhbXFwuLV0/XFx3KykqKFxcLlxcd3syLDN9KSskLyxcblxuICAgIF9waG9uZVJlZ2V4OiAvXlxcKD8oXFxkezN9KVxcKT9bLS4gXT8oXFxkezN9KVstLiBdPyhcXGR7NH0pJC9cblxufSApIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7IH0sIHJlcXVpcmUoJy4uLy4uLy4uL2xpYi9NeU9iamVjdCcpLCByZXF1aXJlKCcuLi8uLi8uLi9saWIvTW9kZWwnKSwgcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyLnByb3RvdHlwZSwge1xuXG4gICAgWGhyOiByZXF1aXJlKCcuLi9YaHInKSxcblxuICAgIGRlbGV0ZSggaWQgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLlhociggeyBtZXRob2Q6ICdERUxFVEUnLCByZXNvdXJjZTogdGhpcy5yZXNvdXJjZSwgaWQgfSApXG4gICAgICAgIC50aGVuKCBpZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBkYXR1bSA9IHRoaXMuZGF0YS5maW5kKCBkYXR1bSA9PiBkYXR1bS5pZCA9PSBpZCApXG5cbiAgICAgICAgICAgIGlmKCB0aGlzLnN0b3JlICkge1xuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKCB0aGlzLnN0b3JlICkuZm9yRWFjaCggYXR0ciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcmVbIGF0dHIgXVsgZGF0dW1bIGF0dHIgXSBdID0gdGhpcy5zdG9yZVsgYXR0ciBdWyBkYXR1bVsgYXR0ciBdIF0uZmlsdGVyKCBkYXR1bSA9PiBkYXR1bS5pZCAhPSBpZCApXG4gICAgICAgICAgICAgICAgICAgIGlmKCB0aGlzLnN0b3JlWyBhdHRyIF1bIGRhdHVtWyBhdHRyIF0gXS5sZW5ndGggPT09IDAgKSB7IHRoaXMuc3RvcmVbIGF0dHIgXVsgZGF0dW1bIGF0dHIgXSBdID0gdW5kZWZpbmVkIH1cbiAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5kYXRhLmZpbHRlciggZGF0dW0gPT4gZGF0dW0uaWQgIT0gaWQgKVxuICAgICAgICAgICAgaWYoIHRoaXMuaWRzICkgZGVsZXRlIHRoaXMuaWRzW2lkXVxuXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGlkKVxuICAgICAgICB9IClcbiAgICB9LFxuXG4gICAgZ2V0KCBvcHRzPXsgcXVlcnk6e30gfSApIHtcbiAgICAgICAgaWYoIG9wdHMucXVlcnkgfHwgdGhpcy5wYWdpbmF0aW9uICkgT2JqZWN0LmFzc2lnbiggb3B0cy5xdWVyeSwgdGhpcy5wYWdpbmF0aW9uIClcblxuICAgICAgICByZXR1cm4gdGhpcy5YaHIoIHsgbWV0aG9kOiBvcHRzLm1ldGhvZCB8fCAnZ2V0JywgcmVzb3VyY2U6IHRoaXMucmVzb3VyY2UsIGhlYWRlcnM6IHRoaXMuaGVhZGVycyB8fCB7fSwgcXM6IG9wdHMucXVlcnkgPyBKU09OLnN0cmluZ2lmeSggb3B0cy5xdWVyeSApIDogdW5kZWZpbmVkIH0gKVxuICAgICAgICAudGhlbiggcmVzcG9uc2UgPT4ge1xuXG4gICAgICAgICAgICBpZiggb3B0cy5zdG9yZUJ5ICkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcmUgPSB7IH1cbiAgICAgICAgICAgICAgICBvcHRzLnN0b3JlQnkuZm9yRWFjaCggYXR0ciA9PiB0aGlzLnN0b3JlWyBhdHRyIF0gPSB7IH0gKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLnBhcnNlXG4gICAgICAgICAgICAgICAgPyB0aGlzLnBhcnNlKCByZXNwb25zZSwgb3B0cy5zdG9yZUJ5IClcbiAgICAgICAgICAgICAgICA6IG9wdHMuc3RvcmVCeVxuICAgICAgICAgICAgICAgICAgICA/IHRoaXMuc3RvcmVCeSggcmVzcG9uc2UgKVxuICAgICAgICAgICAgICAgICAgICA6IHJlc3BvbnNlXG5cbiAgICAgICAgICAgIHRoaXMuZW1pdCgnZ290JylcblxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLmRhdGEpXG4gICAgICAgIH0gKVxuICAgIH0sXG5cbiAgICBwYXRjaCggaWQsIGRhdGEsIG9wdHM9e30gKSB7XG4gICAgICAgIHJldHVybiB0aGlzLlhociggeyBtZXRob2Q6ICdwYXRjaCcsIGlkLCByZXNvdXJjZTogdGhpcy5yZXNvdXJjZSwgaGVhZGVyczogdGhpcy5oZWFkZXJzIHx8IHt9LCBkYXRhOiBKU09OLnN0cmluZ2lmeSggZGF0YSB8fCB0aGlzLmRhdGEgKSB9IClcbiAgICAgICAgLnRoZW4oIHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIGlmKCBBcnJheS5pc0FycmF5KCB0aGlzLmRhdGEgKSApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLmRhdGEgPyB0aGlzLmRhdGEuY29uY2F0KCByZXNwb25zZSApIDogWyByZXNwb25zZSBdXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuc3RvcmUgKSBPYmplY3Qua2V5cyggdGhpcy5zdG9yZSApLmZvckVhY2goIGF0dHIgPT4gdGhpcy5fc3RvcmUoIHJlc3BvbnNlLCBhdHRyICkgKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCByZXNwb25zZSApXG4gICAgICAgIH0gKVxuICAgIH0sXG5cbiAgICBwb3N0KCBtb2RlbCwgb3B0cz17fSApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuWGhyKCB7IG1ldGhvZDogJ3Bvc3QnLCByZXNvdXJjZTogdGhpcy5yZXNvdXJjZSwgaGVhZGVyczogdGhpcy5oZWFkZXJzIHx8IHt9LCBkYXRhOiBKU09OLnN0cmluZ2lmeSggbW9kZWwgfHwgdGhpcy5kYXRhICkgfSApXG4gICAgICAgIC50aGVuKCByZXNwb25zZSA9PiB7XG4gICAgICAgICAgICBpZiggQXJyYXkuaXNBcnJheSggdGhpcy5kYXRhICkgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5kYXRhID8gdGhpcy5kYXRhLmNvbmNhdCggcmVzcG9uc2UgKSA6IFsgcmVzcG9uc2UgXVxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLnN0b3JlICkgT2JqZWN0LmtleXMoIHRoaXMuc3RvcmUgKS5mb3JFYWNoKCBhdHRyID0+IHRoaXMuX3N0b3JlKCByZXNwb25zZSwgYXR0ciApIClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSggcmVzcG9uc2UgKVxuICAgICAgICB9IClcbiAgICB9LFxuXG4gICAgc3RvcmVCeSggZGF0YSApIHtcblxuICAgICAgICBkYXRhLmZvckVhY2goIGRhdHVtID0+IE9iamVjdC5rZXlzKCB0aGlzLnN0b3JlICkuZm9yRWFjaCggYXR0ciA9PiB0aGlzLl9zdG9yZSggZGF0dW0sIGF0dHIgKSApIClcblxuICAgICAgICByZXR1cm4gZGF0YVxuICAgIH0sXG5cbiAgICBfc3RvcmUoIGRhdHVtLCBhdHRyICkge1xuICAgICAgICBpZiggIXRoaXMuc3RvcmVbIGF0dHIgXVsgZGF0dW1bIGF0dHIgXSBdICkgdGhpcy5zdG9yZVsgYXR0ciBdWyBkYXR1bVsgYXR0ciBdIF0gPSBbIF1cbiAgICAgICAgdGhpcy5zdG9yZVsgYXR0ciBdWyBkYXR1bVsgYXR0ciBdIF0ucHVzaCggZGF0dW0gKVxuICAgIH1cblxufSApXG4iLCIvL2h0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9FbGVtZW50L2Nsb3Nlc3RcbmlmICh3aW5kb3cuRWxlbWVudCAmJiAhRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdCkge1xuICAgIEVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QgPSBcbiAgICBmdW5jdGlvbihzKSB7XG4gICAgICAgIHZhciBtYXRjaGVzID0gKHRoaXMuZG9jdW1lbnQgfHwgdGhpcy5vd25lckRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKHMpLFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIGVsID0gdGhpcztcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgaSA9IG1hdGNoZXMubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUgKC0taSA+PSAwICYmIG1hdGNoZXMuaXRlbShpKSAhPT0gZWwpIHt9O1xuICAgICAgICB9IHdoaWxlICgoaSA8IDApICYmIChlbCA9IGVsLnBhcmVudEVsZW1lbnQpKTsgXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9O1xufVxuXG4vL2h0dHBzOi8vZ2lzdC5naXRodWIuY29tL3BhdWxpcmlzaC8xNTc5NjcxXG5jb25zdCByZXF1ZXN0QW5pbWF0aW9uRnJhbWVQb2x5ZmlsbCA9ICgoKSA9PiB7XG4gICAgbGV0IGNsb2NrID0gRGF0ZS5ub3coKTtcblxuICAgIHJldHVybiAoY2FsbGJhY2spID0+IHtcblxuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IERhdGUubm93KCk7XG5cbiAgICAgICAgaWYgKGN1cnJlbnRUaW1lIC0gY2xvY2sgPiAxNikge1xuICAgICAgICAgICAgY2xvY2sgPSBjdXJyZW50VGltZTtcbiAgICAgICAgICAgIGNhbGxiYWNrKGN1cnJlbnRUaW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHBvbHlmaWxsKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICB9XG4gICAgfTtcbn0pKCk7XG5cbndpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICAgIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWVQb2x5ZmlsbFxuXG5yZXF1aXJlKCdzbW9vdGhzY3JvbGwtcG9seWZpbGwnKS5wb2x5ZmlsbCgpXG5cbm1vZHVsZS5leHBvcnRzID0gdHJ1ZVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCB7XG5cbiAgICBFcnJvcjogcmVxdWlyZSgnLi4vLi4vbGliL015RXJyb3InKSxcbiAgICBcbiAgICBWaWV3RmFjdG9yeTogcmVxdWlyZSgnLi9mYWN0b3J5L1ZpZXcnKSxcbiAgICBcbiAgICBWaWV3czogcmVxdWlyZSgnLi8uVmlld01hcCcpLFxuXG4gICAgVG9hc3Q6IHJlcXVpcmUoJy4vdmlld3MvVG9hc3QnKSxcblxuICAgIGNhcGl0YWxpemVGaXJzdExldHRlcjogc3RyaW5nID0+IHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zbGljZSgxKSxcblxuICAgIGluaXRpYWxpemUoKSB7XG5cbiAgICAgICAgdGhpcy5jb250ZW50Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvbnRlbnQnKVxuXG4gICAgICAgIHRoaXMuVG9hc3QuY29uc3RydWN0b3IoKVxuXG4gICAgICAgIHdpbmRvdy5vbnBvcHN0YXRlID0gdGhpcy5oYW5kbGUuYmluZCh0aGlzKVxuXG4gICAgICAgIHRoaXMuaGVhZGVyID1cbiAgICAgICAgICAgIHRoaXMuVmlld0ZhY3RvcnkuY3JlYXRlKFxuICAgICAgICAgICAgICAgICdoZWFkZXInLFxuICAgICAgICAgICAgICAgIHsgaW5zZXJ0aW9uOiB7IHZhbHVlOiB7IGVsOiB0aGlzLmNvbnRlbnRDb250YWluZXIsIG1ldGhvZDogJ2luc2VydEJlZm9yZScgfSB9IH1cbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5vbiggJ25hdmlnYXRlJywgcm91dGUgPT4gdGhpcy5uYXZpZ2F0ZSggcm91dGUgKSApXG5cbiAgICAgICAgdGhpcy5mb290ZXIgPVxuICAgICAgICAgICAgdGhpcy5WaWV3RmFjdG9yeS5jcmVhdGUoXG4gICAgICAgICAgICAgICAgJ2Zvb3RlcicsXG4gICAgICAgICAgICAgICAgeyBpbnNlcnRpb246IHsgdmFsdWU6IHsgZWw6IHRoaXMuY29udGVudENvbnRhaW5lciwgbWV0aG9kOiAnYWZ0ZXInIH0gfSB9XG4gICAgICAgICAgICApXG5cbiAgICAgICAgdGhpcy5oYW5kbGUoKVxuICAgIH0sXG5cbiAgICBoYW5kbGUoKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlciggd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJykuc2xpY2UoMSkgKVxuICAgIH0sXG5cbiAgICBoYW5kbGVyKCBwYXRoICkge1xuICAgICAgICBjb25zdCB2aWV3ID0gdGhpcy5WaWV3c1sgdGhpcy5jYXBpdGFsaXplRmlyc3RMZXR0ZXIoIHBhdGhbMF0gKSBdID8gcGF0aFswXSA6ICdob21lJ1xuXG4gICAgICAgIGlmKCB2aWV3ID09PSB0aGlzLmN1cnJlbnRWaWV3ICkgcmV0dXJuIHRoaXMudmlld3NbIHZpZXcgXS5vbk5hdmlnYXRpb24oIHBhdGggKVxuXG4gICAgICAgIHRoaXMuc2Nyb2xsVG9Ub3AoKVxuXG4gICAgICAgIFByb21pc2UuYWxsKCBPYmplY3Qua2V5cyggdGhpcy52aWV3cyApLm1hcCggdmlldyA9PiB0aGlzLnZpZXdzWyB2aWV3IF0uaGlkZSgpICkgKVxuICAgICAgICAudGhlbiggKCkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdmlld1xuXG4gICAgICAgICAgICBpZiggdGhpcy52aWV3c1sgdmlldyBdICkgcmV0dXJuIHRoaXMudmlld3NbIHZpZXcgXS5vbk5hdmlnYXRpb24oIHBhdGggKVxuXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFxuICAgICAgICAgICAgICAgIHRoaXMudmlld3NbIHZpZXcgXSA9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuVmlld0ZhY3RvcnkuY3JlYXRlKCB2aWV3LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnRpb246IHsgdmFsdWU6IHsgZWw6IHRoaXMuY29udGVudENvbnRhaW5lciB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiB7IHZhbHVlOiBwYXRoLCB3cml0YWJsZTogdHJ1ZSB9XG4gICAgICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgICAgICAub24oICduYXZpZ2F0ZScsIHJvdXRlID0+IHRoaXMubmF2aWdhdGUoIHJvdXRlICkgKVxuICAgICAgICAgICAgICAgICAgICAub24oICdkZWxldGVkJywgKCkgPT4gZGVsZXRlIHRoaXMudmlld3NbIHZpZXcgXSApXG4gICAgICAgICAgICApXG4gICAgICAgIH0gKVxuICAgICAgICAuY2F0Y2goIHRoaXMuRXJyb3IgKVxuICAgIH0sXG5cbiAgICBuYXZpZ2F0ZSggbG9jYXRpb24gKSB7XG4gICAgICAgIGlmKCBsb2NhdGlvbiAhPT0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICkgaGlzdG9yeS5wdXNoU3RhdGUoIHt9LCAnJywgbG9jYXRpb24gKVxuICAgICAgICB0aGlzLmhhbmRsZSgpXG4gICAgfSxcblxuICAgIHNjcm9sbFRvVG9wKCkge1xuICAgICAgICB3aW5kb3cuc2Nyb2xsKCB7IHRvcDogMCwgbGVmdDogMCwgYmVoYXZpb3I6ICdzbW9vdGgnIH0gKVxuICAgIH0sXG5cbn0sIHsgY3VycmVudFZpZXc6IHsgdmFsdWU6ICcnLCB3cml0YWJsZTogdHJ1ZSB9LCB2aWV3czogeyB2YWx1ZTogeyB9IH0gfSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG4gICAgXG59IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbigge30sIHJlcXVpcmUoJy4vX19wcm90b19fJyksIHtcblxuICAgIGV2ZW50czoge1xuICAgICAgICBuYXY6ICdjbGljaydcbiAgICB9LFxuXG4gICAgb25OYXZDbGljayggZSApIHtcbiAgICAgICAgY29uc3QgaXRlbUVsID0gZS50YXJnZXQudGFnTmFtZSA9PT0gXCJMSVwiID8gZS50YXJnZXQgOiBlLnRhcmdldC5jbG9zZXN0KCdsaScpLFxuICAgICAgICAgICAgICBuYW1lID0gaXRlbUVsLmdldEF0dHJpYnV0ZSgnZGF0YS1uYW1lJylcblxuICAgICAgICB0aGlzLmVtaXQoICduYXZpZ2F0ZScsIG5hbWUgKVxuICAgIH1cblxufSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG5cbiAgICBldmVudHM6IHtcbiAgICAgICAgc2VydmljZXM6ICdjbGljaycsXG4gICAgICAgIGludGVybmV0OiAnY2xpY2snXG4gICAgfSxcblxuICAgIG9uSW50ZXJuZXRDbGljaygpIHsgdGhpcy5lbWl0KCAnbmF2aWdhdGUnLCAnaW50ZXJuZXQnICkgfSxcblxuICAgIG9uU2VydmljZXNDbGljaygpIHsgdGhpcy5lbWl0KCAnbmF2aWdhdGUnLCAnc2VydmljZXMnICkgfVxuICAgIFxufSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG5cbiAgICBldmVudHM6IHtcbiAgICAgICAgJ3N1Ym1pdEJ0bic6ICdjbGljaydcbiAgICB9LFxuXG4gICAgbW9kZWw6IE9iamVjdC5jcmVhdGUoIHJlcXVpcmUoJy4uL21vZGVscy9QZXJzb24nKSApLFxuXG4gICAgY2xlYXJGb3JtKCkge1xuICAgICAgICB0aGlzLmVscy5uYW1lLnZhbHVlID0gJydcbiAgICAgICAgdGhpcy5lbHMuY29udGFjdC52YWx1ZSA9ICcnXG4gICAgICAgIHRoaXMuZWxzLmFkZHJlc3MudmFsdWUgPSAnJ1xuICAgIH0sXG5cbiAgICBvblN1Ym1pdEJ0bkNsaWNrKCkge1xuICAgICAgICBpZiggdGhpcy5zdWJtaXR0aW5nICkgcmV0dXJuXG5cbiAgICAgICAgdGhpcy5vblN1Ym1pdFN0YXJ0KClcblxuICAgICAgICB0aGlzLnZhbGlkYXRlKClcbiAgICAgICAgLnRoZW4oIHJlc3VsdCA9PiB7XG4gICAgICAgICAgICBpZiggIXJlc3VsdCApIHJldHVybiBQcm9taXNlLnJlc29sdmUoIHRoaXMub25TdWJtaXRFbmQoKSApXG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vZGVsLnBvc3QoKVxuICAgICAgICAgICAgLnRoZW4oIHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5Ub2FzdC5jcmVhdGVNZXNzYWdlKCAnc3VjY2VzcycsIFwiSW5mbyBzZW50ISBXZSdsbCBrZWVwIHlvdSBwb3N0ZWQhXCIgKVxuICAgICAgICAgICAgICAgIC50aGVuKCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCggJ25hdmlnYXRlJywgJy8nIClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vblN1Ym1pdEVuZCgpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJGb3JtKClcbiAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgLmNhdGNoKCBlID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLlRvYXN0LmNyZWF0ZU1lc3NhZ2UoICdlcnJvcicsIGUgJiYgZS5tZXNzYWdlID8gZS5tZXNzYWdlIDogYFRoZXJlIHdhcyBhIHByb2JsZW0uIFBsZWFzZSB0cnkgYWdhaW4gb3IgY29udGFjdCB1cy5gICk7XG4gICAgICAgICAgICAgICAgdGhpcy5vblN1Ym1pdEVuZCgpXG4gICAgICAgICAgICB9IClcbiAgICAgICAgfSApXG4gICAgICAgIC5jYXRjaCggZSA9PiB7IHRoaXMuRXJyb3IoZSk7IHRoaXMuc3VibWl0dGluZyA9IGZhbHNlIH0gKVxuICAgIH0sXG5cbiAgICBvblN1Ym1pdEVuZCgpIHtcbiAgICAgICAgdGhpcy5zdWJtaXR0aW5nID0gZmFsc2VcbiAgICAgICAgdGhpcy5lbHMuc3VibWl0QnRuLmNsYXNzTGlzdC5yZW1vdmUoJ3N1Ym1pdHRpbmcnKVxuICAgIH0sXG4gICAgXG4gICAgb25TdWJtaXRTdGFydCgpIHtcbiAgICAgICAgdGhpcy5zdWJtaXR0aW5nID0gdHJ1ZVxuICAgICAgICB0aGlzLmVscy5zdWJtaXRCdG4uY2xhc3NMaXN0LmFkZCgnc3VibWl0dGluZycpXG4gICAgfSxcblxuICAgIHBvc3RSZW5kZXIoKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKCB0aGlzLmVscyApLmZvckVhY2goIGF0dHIgPT4geyAgICAgICAgXG4gICAgICAgICAgICBjb25zdCBlbCA9IHRoaXMuZWxzWyBhdHRyIF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIGF0dHIgPT09ICduYW1lJyB8fCBhdHRyID09PSAnY29udGFjdCcgKSBlbC5hZGRFdmVudExpc3RlbmVyKCAnZm9jdXMnLCAoKSA9PiBlbC5jbGFzc0xpc3QucmVtb3ZlKCdlcnJvcicpICkgICAgICAgXG4gICAgICAgIH0gKVxuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIHZhbGlkYXRlKCkge1xuICAgICAgICBsZXQgcnYgPSB0cnVlO1xuXG4gICAgICAgIE9iamVjdC5rZXlzKCB0aGlzLmVscyApLmZvckVhY2goIGF0dHIgPT4geyAgICAgICAgXG4gICAgICAgICAgICBjb25zdCBlbCA9IHRoaXMuZWxzWyBhdHRyIF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIGF0dHIgIT09ICduYW1lJyAmJiBhdHRyICE9PSAnY29udGFjdCcgKSByZXR1cm5cblxuICAgICAgICAgICAgaWYoIHJ2ID09PSB0cnVlICYmICF0aGlzLm1vZGVsLnZhbGlkYXRlKCBhdHRyLCBlbC52YWx1ZSApICkge1xuICAgICAgICAgICAgICAgIHRoaXMuVG9hc3QuY3JlYXRlTWVzc2FnZSggJ2Vycm9yJywgdGhpcy5tb2RlbC5maWVsZHNbIGF0dHIgXS5lcnJvciApXG4gICAgICAgICAgICAgICAgZWwuc2Nyb2xsSW50b1ZpZXcoIHsgYmVoYXZpb3I6ICdzbW9vdGgnIH0gKVxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoICdlcnJvcicgKVxuICAgICAgICAgICAgICAgIHJ2ID0gZmFsc2VcbiAgICAgICAgICAgIH0gZWxzZSBpZiggdGhpcy5tb2RlbC52YWxpZGF0ZSggYXR0ciwgZWwudmFsdWUgKSApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLmRhdGFbIGF0dHIgXSA9IGVsLnZhbHVlLnRyaW0oKVxuICAgICAgICAgICAgfVxuICAgICAgICB9IClcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCBydiApXG4gICAgfVxuXG59ICkiLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG5cbn0gKSIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSggT2JqZWN0LmFzc2lnbigge30sIHJlcXVpcmUoJy4vX19wcm90b19fJyksIHtcblxuICAgIFRvYXN0TWVzc2FnZTogcmVxdWlyZSgnLi9Ub2FzdE1lc3NhZ2UnKSxcblxuICAgIG5hbWU6ICdUb2FzdCcsXG5cbiAgICBwb3N0UmVuZGVyKCkge1xuICAgICAgICB0aGlzLm1lc3NhZ2VzID0geyB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgcmVxdWlyZXNMb2dpbjogZmFsc2UsXG5cbiAgICBjcmVhdGVNZXNzYWdlKCB0eXBlLCBtZXNzYWdlICkge1xuICAgICAgICBpZiggIXRoaXMubWVzc2FnZXNbIG1lc3NhZ2UgXSApIHRoaXMubWVzc2FnZXNbIG1lc3NhZ2UgXSA9IE9iamVjdC5jcmVhdGUoIHRoaXMuVG9hc3RNZXNzYWdlLCB7XG4gICAgICAgICAgICBpbnNlcnRpb246IHsgdmFsdWU6IHsgZWw6IHRoaXMuZWxzLmNvbnRhaW5lciB9IH1cbiAgICAgICAgfSApLmNvbnN0cnVjdG9yKClcblxuICAgICAgICByZXR1cm4gdGhpcy5tZXNzYWdlc1sgbWVzc2FnZSBdLnNob3dNZXNzYWdlKCB0eXBlLCBtZXNzYWdlIClcblxuICAgIH0sXG5cbiAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvVG9hc3QnKVxuXG59ICksIHsgfSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG5cbiAgICBuYW1lOiAnVG9hc3RNZXNzYWdlJyxcblxuICAgIEljb25zOiB7XG4gICAgICAgIGVycm9yOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9saWIvZXJyb3InKSgpLFxuICAgICAgICBzdWNjZXNzOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9saWIvY2hlY2ttYXJrJykoKVxuICAgIH0sXG5cbiAgICBwb3N0UmVuZGVyKCkge1xuXG4gICAgICAgIHRoaXMub24oICdzaG93bicsICgpID0+IHRoaXMuc3RhdHVzID0gJ3Nob3duJyApXG4gICAgICAgIHRoaXMub24oICdoaWRkZW4nLCAoKSA9PiB0aGlzLnN0YXR1cyA9ICdoaWRkZW4nIClcblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICByZXF1aXJlc0xvZ2luOiBmYWxzZSxcblxuICAgIHNob3dNZXNzYWdlKCB0eXBlLCBtZXNzYWdlICkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgID0+IHtcbiAgICAgICAgICAgIGlmKCAvc2hvdy8udGVzdCggdGhpcy5zdGF0dXMgKSApIHRoaXMudGVhcmRvd24oKVxuXG4gICAgICAgICAgICB0aGlzLnJlc29sdXRpb24gPSByZXNvbHZlXG5cbiAgICAgICAgICAgIGlmKCB0eXBlICE9PSAnZXJyb3InICkgdGhpcy5lbHMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ3N1Y2Nlc3MnKVxuXG4gICAgICAgICAgICB0aGlzLmVscy5tZXNzYWdlLnRleHRDb250ZW50ID0gbWVzc2FnZVxuICAgICAgICAgICAgdGhpcy5lbHMudGl0bGUudGV4dENvbnRlbnQgPSB0eXBlID09PSAnZXJyb3InID8gJ0Vycm9yJyA6ICdTdWNjZXNzJ1xuICAgICAgICAgICAgdGhpcy5zbHVycFRlbXBsYXRlKCB7IGluc2VydGlvbjogeyBlbDogdGhpcy5lbHMuaWNvbiB9LCB0ZW1wbGF0ZTogdHlwZSA9PT0gJ2Vycm9yJyA/IHRoaXMuSWNvbnMuZXJyb3IgOiB0aGlzLkljb25zLnN1Y2Nlc3MgfSApXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzID0gJ3Nob3dpbmcnXG5cbiAgICAgICAgICAgIHRoaXMuc2hvdyggdHJ1ZSApXG4gICAgICAgICAgICAudGhlbiggKCkgPT4gdGhpcy5oaWRlKCB0cnVlICkgKVxuICAgICAgICAgICAgLnRoZW4oICgpID0+IHRoaXMudGVhcmRvd24oKSApXG4gICAgICAgICAgICAuY2F0Y2goIHJlamVjdCApXG4gICAgICAgIH0gKVxuICAgIH0sXG5cbiAgICB0ZWFyZG93bigpIHtcbiAgICAgICAgaWYoIHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QuY29udGFpbnMoJ3N1Y2Nlc3MnKSApIHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdzdWNjZXNzJylcbiAgICAgICAgdGhpcy5lbHMubWVzc2FnZS50ZXh0Q29udGVudCA9ICcnXG4gICAgICAgIHRoaXMuZWxzLm1lc3NhZ2UudGl0bGUgPSAnJ1xuICAgICAgICBpZiggdGhpcy5lbHMuaWNvbi5maXJzdENoaWxkICkgdGhpcy5lbHMuaWNvbi5yZW1vdmVDaGlsZCggdGhpcy5lbHMuaWNvbi5maXJzdENoaWxkIClcbiAgICAgICAgdGhpcy5yZXNvbHV0aW9uKClcbiAgICB9LFxuXG4gICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL1RvYXN0TWVzc2FnZScpXG5cbn0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7IH0sIHJlcXVpcmUoJy4uLy4uLy4uL2xpYi9NeU9iamVjdCcpLCByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXIucHJvdG90eXBlLCB7XG5cbiAgICBNb2RlbDogcmVxdWlyZSgnLi4vbW9kZWxzL19fcHJvdG9fXycpLFxuXG4gICAgT3B0aW1pemVkUmVzaXplOiByZXF1aXJlKCcuL2xpYi9PcHRpbWl6ZWRSZXNpemUnKSxcblxuICAgIGJpbmRFdmVudCgga2V5LCBldmVudCwgZWwgKSB7XG4gICAgICAgIHZhciBlbHMgPSBlbCA/IFsgZWwgXSA6IEFycmF5LmlzQXJyYXkoIHRoaXMuZWxzWyBrZXkgXSApID8gdGhpcy5lbHNbIGtleSBdIDogWyB0aGlzLmVsc1sga2V5IF0gXVxuICAgICAgICBlbHMuZm9yRWFjaCggZWwgPT4gZWwuYWRkRXZlbnRMaXN0ZW5lciggZXZlbnQgfHwgJ2NsaWNrJywgZSA9PiB0aGlzWyBgb24ke3RoaXMuY2FwaXRhbGl6ZUZpcnN0TGV0dGVyKGtleSl9JHt0aGlzLmNhcGl0YWxpemVGaXJzdExldHRlcihldmVudCl9YCBdKCBlICkgKSApXG4gICAgfSxcblxuICAgIGNhcGl0YWxpemVGaXJzdExldHRlcjogc3RyaW5nID0+IHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zbGljZSgxKSxcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnN1YnZpZXdFbGVtZW50cyA9IFsgXVxuXG4gICAgICAgIGlmKCB0aGlzLnJlcXVpcmVzTG9naW4gJiYgKCAhdGhpcy51c2VyLmlzTG9nZ2VkSW4oKSApICkgcmV0dXJuIHRoaXMuaGFuZGxlTG9naW4oKVxuICAgICAgICBpZiggdGhpcy51c2VyICYmICF0aGlzLmlzQWxsb3dlZCggdGhpcy51c2VyICkgKSByZXR1cm4gdGhpcy5zY29vdEF3YXkoKVxuXG4gICAgICAgIHJldHVybiB0aGlzLmluaXRpYWxpemUoKS5yZW5kZXIoKVxuICAgIH0sXG5cbiAgICBkZWxlZ2F0ZUV2ZW50cygga2V5LCBlbCApIHtcbiAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgdGhpcy5ldmVudHNba2V5XVxuXG4gICAgICAgIGlmKCB0eXBlID09PSBcInN0cmluZ1wiICkgeyB0aGlzLmJpbmRFdmVudCgga2V5LCB0aGlzLmV2ZW50c1trZXldLCBlbCApIH1cbiAgICAgICAgZWxzZSBpZiggQXJyYXkuaXNBcnJheSggdGhpcy5ldmVudHNba2V5XSApICkge1xuICAgICAgICAgICAgdGhpcy5ldmVudHNbIGtleSBdLmZvckVhY2goIGV2ZW50T2JqID0+IHRoaXMuYmluZEV2ZW50KCBrZXksIGV2ZW50T2JqICkgKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5iaW5kRXZlbnQoIGtleSwgdGhpcy5ldmVudHNba2V5XS5ldmVudCApXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZGVsZXRlKCBpc1Nsb3csIGFuaW1hdGU9dHJ1ZSApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlkZSggaXNTbG93LCBhbmltYXRlIClcbiAgICAgICAgLnRoZW4oICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKCB0aGlzLmVscy5jb250YWluZXIgKVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSggdGhpcy5lbWl0KCdkZWxldGVkJykgKVxuICAgICAgICB9IClcbiAgICB9LFxuXG4gICAgZXZlbnRzOiB7fSxcblxuICAgIGdldFRlbXBsYXRlT3B0aW9ucygpIHtcbiAgICAgICAgY29uc3QgcnYgPSBPYmplY3QuYXNzaWduKCB0aGlzLnVzZXIgPyB7IHVzZXI6IHRoaXMudXNlci5kYXRhIH0gOiB7fSApXG5cbiAgICAgICAgaWYoIHRoaXMubW9kZWwgKSB7XG4gICAgICAgICAgICBydi5tb2RlbCA9IHRoaXMubW9kZWwuZGF0YVxuXG4gICAgICAgICAgICBpZiggdGhpcy5tb2RlbC5tZXRhICkgcnYubWV0YSA9IHRoaXMubW9kZWwubWV0YVxuICAgICAgICB9XG5cbiAgICAgICAgaWYoIHRoaXMudGVtcGxhdGVPcHRpb25zICkgcnYub3B0cyA9IHR5cGVvZiB0aGlzLnRlbXBsYXRlT3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJyA/IHRoaXMudGVtcGxhdGVPcHRpb25zKCkgOiB0aGlzLnRlbXBsYXRlT3B0aW9uc1xuXG4gICAgICAgIHJldHVybiBydlxuICAgIH0sXG5cbiAgICBoYW5kbGVMb2dpbigpIHtcbiAgICAgICAgdGhpcy5mYWN0b3J5LmNyZWF0ZSggJ2xvZ2luJywgeyBpbnNlcnRpb246IHsgdmFsdWU6IHsgZWw6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjb250ZW50JykgfSB9IH0gKVxuICAgICAgICAgICAgLm9uY2UoIFwibG9nZ2VkSW5cIiwgKCkgPT4gdGhpcy5vbkxvZ2luKCkgKVxuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIGhpZGUoIGlzU2xvdywgYW5pbWF0ZT10cnVlICkgeyByZXR1cm4gdGhpcy5oaWRlRWwoIHRoaXMuZWxzLmNvbnRhaW5lciwgaXNTbG93LCBhbmltYXRlICkudGhlbiggKCkgPT4gdGhpcy5lbWl0KCdoaWRkZW4nKSApIH0sXG5cbiAgICBfaGlkZUVsKCBlbCwga2xhc3MsIHJlc29sdmUsIGhhc2ggKSB7XG4gICAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdhbmltYXRpb25lbmQnLCB0aGlzWyBoYXNoIF0gKVxuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCBrbGFzcyApXG4gICAgICAgIGRlbGV0ZSB0aGlzW2hhc2hdXG4gICAgICAgIHJlc29sdmUoKVxuICAgIH0sXG5cbiAgICBoaWRlRWwoIGVsLCBpc1Nsb3csIGFuaW1hdGU9dHJ1ZSApIHtcbiAgICAgICAgaWYoIHRoaXMuaXNIaWRkZW4oIGVsICkgKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcblxuICAgICAgICBjb25zdCB0aW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCksXG4gICAgICAgICAgICBoYXNoID0gYCR7dGltZX1IaWRlYFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCByZXNvbHZlID0+IHtcbiAgICAgICAgICAgIGlmKCAhYW5pbWF0ZSApIHJldHVybiByZXNvbHZlKCBlbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKSApXG5cbiAgICAgICAgICAgIGNvbnN0IGtsYXNzID0gYGFuaW1hdGUtb3V0JHsgaXNTbG93ID8gJy1zbG93JyA6ICcnfWBcbiAgICAgICAgICAgIHRoaXNbIGhhc2ggXSA9IGUgPT4gdGhpcy5faGlkZUVsKCBlbCwga2xhc3MsIHJlc29sdmUsIGhhc2ggKVxuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lciggJ2FuaW1hdGlvbmVuZCcsIHRoaXNbIGhhc2ggXSApXG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCBrbGFzcyApXG4gICAgICAgIH0gKVxuICAgIH0sXG5cbiAgICBodG1sVG9GcmFnbWVudCggc3RyICkge1xuICAgICAgICBsZXQgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgICAgICAvLyBtYWtlIHRoZSBwYXJlbnQgb2YgdGhlIGZpcnN0IGRpdiBpbiB0aGUgZG9jdW1lbnQgYmVjb21lcyB0aGUgY29udGV4dCBub2RlXG4gICAgICAgIHJhbmdlLnNlbGVjdE5vZGUoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJkaXZcIikuaXRlbSgwKSlcbiAgICAgICAgcmV0dXJuIHJhbmdlLmNyZWF0ZUNvbnRleHR1YWxGcmFnbWVudCggc3RyIClcbiAgICB9LFxuXG4gICAgaW5pdGlhbGl6ZSgpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oIHRoaXMsIHsgZWxzOiB7IH0sIHNsdXJwOiB7IGF0dHI6ICdkYXRhLWpzJywgdmlldzogJ2RhdGEtdmlldycsIG5hbWU6ICdkYXRhLW5hbWUnIH0sIHZpZXdzOiB7IH0gfSApXG4gICAgfSxcblxuICAgIGlzQWxsb3dlZCggdXNlciApIHtcbiAgICAgICAgaWYoICF0aGlzLnJlcXVpcmVzUm9sZSApIHJldHVybiB0cnVlXG4gICAgICAgIHJldHVybiB0aGlzLnJlcXVpcmVzUm9sZSAmJiB1c2VyLmRhdGEucm9sZXMuaW5jbHVkZXMoIHRoaXMucmVxdWlyZXNSb2xlIClcbiAgICB9LFxuICAgIFxuICAgIGlzSGlkZGVuKCBlbCApIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGVsIHx8IHRoaXMuZWxzLmNvbnRhaW5lclxuICAgICAgICByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2hpZGRlbicpXG4gICAgfSxcblxuICAgIG9uTG9naW4oKSB7XG5cbiAgICAgICAgaWYoICF0aGlzLmlzQWxsb3dlZCggdGhpcy51c2VyICkgKSByZXR1cm4gdGhpcy5zY29vdEF3YXkoKVxuXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSgpLnJlbmRlcigpXG4gICAgfSxcblxuICAgIG9uTmF2aWdhdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hvdygpXG4gICAgfSxcblxuICAgIHNob3dOb0FjY2VzcygpIHtcbiAgICAgICAgYWxlcnQoXCJObyBwcml2aWxlZ2VzLCBzb25cIilcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgcG9zdFJlbmRlcigpIHsgcmV0dXJuIHRoaXMgfSxcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYoIHRoaXMuZGF0YSApIHRoaXMubW9kZWwgPSBPYmplY3QuY3JlYXRlKCB0aGlzLk1vZGVsLCB7IH0gKS5jb25zdHJ1Y3RvciggdGhpcy5kYXRhIClcblxuICAgICAgICB0aGlzLnNsdXJwVGVtcGxhdGUoIHsgdGVtcGxhdGU6IHRoaXMudGVtcGxhdGUoIHRoaXMuZ2V0VGVtcGxhdGVPcHRpb25zKCkgKSwgaW5zZXJ0aW9uOiB0aGlzLmluc2VydGlvbiB8fCB7IGVsOiBkb2N1bWVudC5ib2R5IH0sIGlzVmlldzogdHJ1ZSB9IClcblxuICAgICAgICB0aGlzLnJlbmRlclN1YnZpZXdzKClcblxuICAgICAgICBpZiggdGhpcy5zaXplICkgeyB0aGlzLnNpemUoKTsgdGhpcy5PcHRpbWl6ZWRSZXNpemUuYWRkKCB0aGlzLnNpemUuYmluZCh0aGlzKSApIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5wb3N0UmVuZGVyKClcbiAgICB9LFxuXG4gICAgcmVuZGVyU3Vidmlld3MoKSB7XG4gICAgICAgIHRoaXMuc3Vidmlld0VsZW1lbnRzLmZvckVhY2goIG9iaiA9PiB7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gb2JqLm5hbWVcblxuICAgICAgICAgICAgbGV0IG9wdHMgPSB7IH1cblxuICAgICAgICAgICAgaWYoIHRoaXMuVmlld3MgJiYgdGhpcy5WaWV3c1sgbmFtZSBdICkgb3B0cyA9IHR5cGVvZiB0aGlzLlZpZXdzWyBuYW1lIF0gPT09IFwib2JqZWN0XCIgPyB0aGlzLlZpZXdzWyBuYW1lIF0gOiBSZWZsZWN0LmFwcGx5KCB0aGlzLlZpZXdzWyBuYW1lIF0sIHRoaXMsIFsgXSApXG5cbiAgICAgICAgICAgIHRoaXMudmlld3NbIG5hbWUgXSA9IHRoaXMuZmFjdG9yeS5jcmVhdGUoIGtleSwgT2JqZWN0LmFzc2lnbiggeyBpbnNlcnRpb246IHsgdmFsdWU6IHsgZWw6IG9iai5lbCwgbWV0aG9kOiAnaW5zZXJ0QmVmb3JlJyB9IH0gfSwgeyBvcHRzOiB7IHZhbHVlOiBvcHRzIH0gfSApIClcbiAgICAgICAgICAgIG9iai5lbC5yZW1vdmUoKVxuICAgICAgICB9IClcblxuICAgICAgICBkZWxldGUgdGhpcy5zdWJ2aWV3RWxlbWVudHNcblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICBzY29vdEF3YXkoKSB7XG4gICAgICAgIHRoaXMuVG9hc3Quc2hvdyggJ2Vycm9yJywgJ1lvdSBhcmUgbm90IGFsbG93ZWQgaGVyZS4gIFNvcnJ5LicpXG4gICAgICAgIC5jYXRjaCggZSA9PiB7IHRoaXMuRXJyb3IoIGUgKTsgdGhpcy5lbWl0KCAnbmF2aWdhdGUnLCBgL2AgKSB9IClcbiAgICAgICAgLnRoZW4oICgpID0+IHRoaXMuZW1pdCggJ25hdmlnYXRlJywgYC9gICkgKVxuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIHNob3coIGlzU2xvdywgYW5pbWF0ZT10cnVlICkgeyByZXR1cm4gdGhpcy5zaG93RWwoIHRoaXMuZWxzLmNvbnRhaW5lciwgaXNTbG93LCBhbmltYXRlICkudGhlbiggKCkgPT4gdGhpcy5lbWl0KCdzaG93bicpICkgfSxcblxuICAgIF9zaG93RWwoIGVsLCBrbGFzcywgcmVzb2x2ZSwgaGFzaCApIHtcbiAgICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2FuaW1hdGlvbmVuZCcsIHRoaXNbaGFzaF0gKVxuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCBrbGFzcyApXG4gICAgICAgIGRlbGV0ZSB0aGlzWyBoYXNoIF1cbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgfSxcblxuICAgIHNob3dFbCggZWwsIGlzU2xvdywgYW5pbWF0ZT10cnVlICkge1xuICAgICAgICBpZiggIXRoaXMuaXNIaWRkZW4oIGVsICkgKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcblxuICAgICAgICBjb25zdCB0aW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCksXG4gICAgICAgICAgICBoYXNoID0gYCR7dGltZX1TaG93YFxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggcmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKVxuXG4gICAgICAgICAgICBpZiggIWFuaW1hdGUgKSByZXR1cm4gcmVzb2x2ZSgpXG5cbiAgICAgICAgICAgIGNvbnN0IGtsYXNzID0gYGFuaW1hdGUtaW4keyBpc1Nsb3cgPyAnLXNsb3cnIDogJyd9YFxuICAgICAgICAgICAgdGhpc1sgaGFzaCBdID0gZSA9PiB0aGlzLl9zaG93RWwoIGVsLCBrbGFzcywgcmVzb2x2ZSwgaGFzaCApXG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCAnYW5pbWF0aW9uZW5kJywgdGhpc1sgaGFzaCBdICkgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoIGtsYXNzIClcbiAgICAgICAgfSApICAgICAgICBcbiAgICB9LFxuXG4gICAgc2x1cnBFbCggZWwgKSB7XG4gICAgICAgIHZhciBrZXkgPSBlbC5nZXRBdHRyaWJ1dGUoIHRoaXMuc2x1cnAuYXR0ciApIHx8ICdjb250YWluZXInXG5cbiAgICAgICAgaWYoIGtleSA9PT0gJ2NvbnRhaW5lcicgKSBlbC5jbGFzc0xpc3QuYWRkKCB0aGlzLm5hbWUgKVxuXG4gICAgICAgIHRoaXMuZWxzWyBrZXkgXSA9IEFycmF5LmlzQXJyYXkoIHRoaXMuZWxzWyBrZXkgXSApXG4gICAgICAgICAgICA/IHRoaXMuZWxzWyBrZXkgXS5jb25jYXQoIGVsIClcbiAgICAgICAgICAgIDogKCB0aGlzLmVsc1sga2V5IF0gIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICAgICAgPyBbIHRoaXMuZWxzWyBrZXkgXSwgZWwgXVxuICAgICAgICAgICAgICAgIDogZWxcblxuICAgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5zbHVycC5hdHRyKVxuXG4gICAgICAgIGlmKCB0aGlzLmV2ZW50c1sga2V5IF0gKSB0aGlzLmRlbGVnYXRlRXZlbnRzKCBrZXksIGVsIClcbiAgICB9LFxuXG4gICAgc2x1cnBUZW1wbGF0ZSggb3B0aW9ucyApIHtcbiAgICAgICAgdmFyIGZyYWdtZW50ID0gdGhpcy5odG1sVG9GcmFnbWVudCggb3B0aW9ucy50ZW1wbGF0ZSApLFxuICAgICAgICAgICAgc2VsZWN0b3IgPSBgWyR7dGhpcy5zbHVycC5hdHRyfV1gLFxuICAgICAgICAgICAgdmlld1NlbGVjdG9yID0gYFske3RoaXMuc2x1cnAudmlld31dYCxcbiAgICAgICAgICAgIGZpcnN0RWwgPSBmcmFnbWVudC5xdWVyeVNlbGVjdG9yKCcqJylcblxuICAgICAgICBpZiggb3B0aW9ucy5pc1ZpZXcgfHwgZmlyc3RFbC5nZXRBdHRyaWJ1dGUoIHRoaXMuc2x1cnAuYXR0ciApICkgdGhpcy5zbHVycEVsKCBmaXJzdEVsIClcbiAgICAgICAgZnJhZ21lbnQucXVlcnlTZWxlY3RvckFsbCggYCR7c2VsZWN0b3J9LCAke3ZpZXdTZWxlY3Rvcn1gICkuZm9yRWFjaCggZWwgPT4ge1xuICAgICAgICAgICAgaWYoIGVsLmhhc0F0dHJpYnV0ZSggdGhpcy5zbHVycC5hdHRyICkgKSB7IHRoaXMuc2x1cnBFbCggZWwgKSB9XG4gICAgICAgICAgICBlbHNlIGlmKCBlbC5oYXNBdHRyaWJ1dGUoIHRoaXMuc2x1cnAudmlldyApICkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3Vidmlld0VsZW1lbnRzLnB1c2goIHsgZWwsIHZpZXc6IGVsLmdldEF0dHJpYnV0ZSh0aGlzLnNsdXJwLnZpZXcpLCBuYW1lOiBlbC5nZXRBdHRyaWJ1dGUodGhpcy5zbHVycC5uYW1lKSB9IClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSApXG4gICAgICAgICAgXG4gICAgICAgIG9wdGlvbnMuaW5zZXJ0aW9uLm1ldGhvZCA9PT0gJ2luc2VydEJlZm9yZSdcbiAgICAgICAgICAgID8gb3B0aW9ucy5pbnNlcnRpb24uZWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoIGZyYWdtZW50LCBvcHRpb25zLmluc2VydGlvbi5lbCApXG4gICAgICAgICAgICA6IG9wdGlvbnMuaW5zZXJ0aW9uLmVsWyBvcHRpb25zLmluc2VydGlvbi5tZXRob2QgfHwgJ2FwcGVuZENoaWxkJyBdKCBmcmFnbWVudCApXG5cbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG59IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSgge1xuXG4gICAgYWRkKGNhbGxiYWNrKSB7XG4gICAgICAgIGlmKCAhdGhpcy5jYWxsYmFja3MubGVuZ3RoICkgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMub25SZXNpemUuYmluZCh0aGlzKSApXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spXG4gICAgfSxcblxuICAgIG9uUmVzaXplKCkge1xuICAgICAgIGlmKCB0aGlzLnJ1bm5pbmcgKSByZXR1cm5cblxuICAgICAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlXG4gICAgICAgIFxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgICA/IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIHRoaXMucnVuQ2FsbGJhY2tzLmJpbmQodGhpcykgKVxuICAgICAgICAgICAgOiBzZXRUaW1lb3V0KCB0aGlzLnJ1bkNhbGxiYWNrcywgNjYgKVxuICAgIH0sXG5cbiAgICBydW5DYWxsYmFja3MoKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzID0gdGhpcy5jYWxsYmFja3MuZmlsdGVyKCBjYWxsYmFjayA9PiBjYWxsYmFjaygpIClcbiAgICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2UgXG4gICAgfVxuXG59LCB7IGNhbGxiYWNrczogeyB3cml0YWJsZTogdHJ1ZSwgdmFsdWU6IFtdIH0sIHJ1bm5pbmc6IHsgd3JpdGFibGU6IHRydWUsIHZhbHVlOiBmYWxzZSB9IH0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBwID0+XG5gPGZvb3Rlcj5cbiAgICA8ZGl2IGNsYXNzPVwiY29udGFjdFwiPlxuICAgICAgICA8ZGl2PiZjb3B5OyAyMDE3IHwgQWxsZWdhbiBJbnRlcm5ldCBXaXphcmQ8L2Rpdj5cbiAgICAgICAgPGRpdj4xMjMgQmF5cm9uIExhbmUgfCBBbGxlZ2FuLCBNSSAxMjM0NSB8IDEyMy40NTYuNzg5MDwvZGl2PlxuICAgICAgICA8ZGl2PnRoZV93aXpAYWl3LmNvbTwvZGl2PlxuICAgIDwvZGl2PlxuPC9mb290ZXI+YFxuIiwibW9kdWxlLmV4cG9ydHMgPSAoKSA9PlxuYDxuYXY+XG4gICAgPGRpdiBjbGFzcz1cImNvbnRhY3RcIj5cbiAgICAgICAgPGRpdj5waG9uZTogMTIzLjQ1Ni43ODkwIHwgZW1haWw6IHRoZV93aXpAYWl3LmNvbTwvZGl2PlxuICAgIDwvZGl2PlxuICAgIDx1bCBkYXRhLWpzPVwibmF2XCI+XG4gICAgICAgIDxsaSBkYXRhLW5hbWU9XCJob21lXCI+SG9tZTwvbGk+XG4gICAgICAgIDxsaSBkYXRhLW5hbWU9XCJzZXJ2aWNlc1wiPlNlcnZpY2VzPC9saT5cbiAgICAgICAgPGxpIGRhdGEtbmFtZT1cImludGVybmV0XCI+TG9jYWwgSW50ZXJuZXQhPC9saT5cbiAgICA8L3VsPlxuPC9uYXY+YFxuIiwibW9kdWxlLmV4cG9ydHMgPSAoKSA9PlxuYDxkaXY+XG4gICAgPGRpdj5cbiAgICAgICAgPGltZyBzcmM9XCIvc3RhdGljL2ltZy9sb2dvLnN2Z1wiPlxuICAgIDwvZGl2PlxuICAgIDxkaXY+XG4gICAgICAgIDxoMj5NYWtlIFlvdXIgVGVjaCBQcm9ibGVtcyBNYWdpY2FsbHkgRGlzYXBwZWFyITwvaDI+XG4gICAgICAgIDxwPkNvbXB1dGVycy4gQ2FuJ3QgbGl2ZSB3aXRoICdlbSwgY2FuJ3QgbGl2ZSB3aXRob3V0ICdlbS4gVGhleSdyZSBhIGh1Z2UgcGFydCBvZiBvdXIgbGl2ZXMgdGhlc2UgZGF5cywgYnV0IHVuZm9ydHVuYXRlbHlcbiAgICAgICAgdGhleSBoYXZlbid0IGdvdHRlbiBhbnkgbGVzcyBjb21wbGljYXRlZC4gVGhpbmdzIGNhbiBhbmQgZG8gZ28gd3JvbmcgYWxsIHRoZSB0aW1lLCBhbmQgdGhlbiB5b3UgZW5kIHVwIHNwZW5kaW5nIGhvdXJzXG4gICAgICAgIGFuZCBob3VycyBvZiB5b3VyIHZhbHVhYmxlIHRpbWUgdHJ5aW5nIHRvIGZpZ3VyZSBvdXQgd2hhdCB0aGUgaGVjayBoYXBwZW5lZCBhbmQgZml4IGl0LiBMaWZlJ3MgdG9vIHNob3J0IGZvciBhbGwgdGhhdCBmcnVzdHJhdGlvbi5cbiAgICAgICAgV2h5IG5vdCBoaXJlIGEgcHJvZmVzc2lvbmFsIHRvIHRha2UgY2FyZSBvZiBpdCBxdWlja2x5IGFuZCBwYWlubGVzc2x5PyBHaXZlIFRoZSBXaXphcmQgYSBjYWxsITwvcD5cbiAgICAgICAgPHA+QWxsZWdhbiBJbnRlcm5ldCBXaXphcmQgaXMgaGVyZSB0byBhc3Npc3QgdGhlIGNpdGl6ZW5zIG9mIEFsbGVnYW4gd2l0aCBhbGwgb2YgdGhlaXIgdGVjaCBuZWVkcy4gV2hldGhlciB5b3UgYXJlIGFcbiAgICAgICAgbm9ybWFsIGhvbWUgdXNlciBvciBhIHNtYWxsIGJ1c2luZXNzLCB3ZSB3aWxsIHVzZSBvdXIgMTUrIHllYXJzIG9mIGV4cGVyaWVuY2UgaW4gdGhlIHRlY2ggaW5kdXN0cnkgdG8gc29sdmUgeW91ciBwcm9ibGVtc1xuICAgICAgICB3aXRoIHNwZWVkLCBjb3VydGVzeSwgYW5kIHByb2Zlc3Npb25hbGlzbS4gV2FudCB0byBmaW5kIG91dCBtb3JlPyBDbGljayA8c3BhbiBjbGFzcz1cImxpbmtcIiBkYXRhLWpzPVwic2VydmljZXNcIj5oZXJlPC9zcGFuPlxuICAgICAgICBmb3IgYSBsaXN0IG9mIG91ciBzZXJ2aWNlcy48L3A+XG4gICAgICAgIDxwPjxzcGFuIGNsYXNzPVwibm90aWNlXCI+U3BlY2lhbCBub3RpY2U8L3NwYW4+OiB3ZSBhcmUgY29uc2lkZXJpbmcgZXhwYW5kaW5nIG91ciBidXNpbmVzcyB0byBwcm92aWRlIGludGVybmV0IHNlcnZpY2UgdG8gQWxsZWdhbi5cbiAgICAgICAgQ2xpY2sgPHNwYW4gY2xhc3M9XCJsaW5rXCIgZGF0YS1qcz1cImludGVybmV0XCI+aGVyZTwvc3Bhbj4gdG8gZmluZCBvdXQgbW9yZS48L3A+XG4gICAgPC9kaXY+ICAgICAgICBcbjwvZGl2PmBcbiIsIm1vZHVsZS5leHBvcnRzID0gKCkgPT5cbmA8ZGl2PlxuICAgIDxkaXY+XG4gICAgICAgIDxoMj5Mb2NhbCBJbnRlcm5ldCBTZXJ2aWNlIGZvciBBbGxlZ2FuPC9oMj5cbiAgICAgICAgPHA+Tm90IGhhcHB5IHdpdGggeW91ciBpbnRlcm5ldCBvcHRpb25zIGluIEFsbGVnYW4/IFRpcmVkIG9mIHBheWluZyB0b28gbXVjaCBmb3IgbG91c3kgc3BlZWRzIGFuZCBjb25zdGFudCBzZXJ2aWNlIGludGVycnVwdGlvbnM/XG4gICAgICAgIFdlbGwsIHlvdSdyZSBpbiBsdWNrLCBiZWNhdXNlIEFsbGVnYW4gSW50ZXJuZXQgV2l6YXJkIGlzIGN1cnJlbnRseSBjb25zaWRlcmluZyBsYXVuY2hpbmcgb3VyIG93biBpbnRlcm5ldCBzZXJ2aWNlIGZvclxuICAgICAgICB0aGUgZmluZSBjaXRpemVucyBvZiBBbGxlZ2FuLiBXZSBiZWxpZXZlIHRoZXJlJ3Mgbm90IG5lYXJseSBlbm91Z2ggZnJlZWRvbSBhbmQgY2hvaWNlIHdoZW4gaXQgY29tZXMgdG8gaW50ZXJuZXQgcHJvdmlkZXJzLCBhbmRcbiAgICAgICAgd2UnZCBsaWtlIHRvIHVzZSBvdXIgdGVjaCBza2lsbHMgdG8gY2hhbmdlIHRoYXQgYW5kIG9mZmVyIEFsbGVnYW4gZmFzdCwgcmVsaWFibGUgc2VydmljZSBhdCBhIHJlYXNvbmFibGUgcHJpY2UuXG4gICAgICAgIExldCdzIGdpdmUgdGhvc2UgZmF0IGNhdCB0ZWxlY29tcyBzb21lIHJlYWwgY29tcGV0aXRpb24hPC9wPlxuICAgICAgICA8cD5JZiB0aGlzIHNvdW5kcyBnb29kIHRvIHlvdSwgcGxlYXNlIGxlYXZlIHlvdXIgbmFtZSBhbmQgY29udGFjdCBpbmZvLCBhbmQgd2UnbGwgbGV0IHlvdSBrbm93IGhvdyB0aGluZ3MgYXJlIGRldmVsb3BpbmcuXG4gICAgICAgIFRoYW5rIHlvdSBmb3IgeW91ciBpbnRlcmVzdCE8L3A+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cImJvcmRlclwiPjwvZGl2PlxuICAgIDxmb3JtPlxuICAgICAgICA8aW5wdXQgZGF0YS1qcz1cIm5hbWVcIiB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiTmFtZVwiPlxuICAgICAgICA8aW5wdXQgZGF0YS1qcz1cImNvbnRhY3RcIiB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiRW1haWwgb3IgUGhvbmUgTnVtYmVyXCI+XG4gICAgICAgIDxpbnB1dCBkYXRhLWpzPVwiYWRkcmVzc1wiIHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCJBZGRyZXNzXCI+XG4gICAgICAgIDxidXR0b24gZGF0YS1qcz1cInN1Ym1pdEJ0blwiIHR5cGU9XCJidXR0b25cIj5TdWJtaXQ8L2J1dHRvbj5cbiAgICA8L2Zvcm0+XG48L2Rpdj5gIiwibW9kdWxlLmV4cG9ydHMgPSAoKSA9PlxuYDxkaXY+XG4gICAgPGgxPk91ciBTZXJ2aWNlczwvaDE+XG4gICAgPGRpdiBjbGFzcz1cImludHJvXCI+XG4gICAgICAgIDxwPldhbnQgdG8gaW1wcm92ZSB5b3VyIGhvbWUgbmV0d29yaz8gUHJvdGVjdCB5b3VyIGtpZHMgZnJvbSBpbmFwcHJvcHJpYXRlIGNvbnRlbnQgb24gdGhlIHdlYj8gTmVlZCBoZWxwIGV4cGxvcmluZ1xuICAgICAgICB5b3VyIGludGVybmV0IHNlcnZpY2Ugb3B0aW9ucz8gQ2FuJ3QgZmlndXJlIG91dCB3aHkgYSB3ZWIgcGFnZSBpc24ndCB3b3JraW5nPyBNYXliZSB5b3UncmUgYSBidXNpbmVzcyBhbmQgd2FudCB0byBidWlsZFxuICAgICAgICBhIG5ldyB3ZWJzaXRlIG9yIGltcHJvdmUgeW91ciBjdXJyZW50IG9uZS4gRnJvbSBnZW5lcmFsIHRlY2ggc3VwcG9ydCB0byB3ZWIgZGV2ZWxvcG1lbnQsIHdlJ3ZlIGdvdCB5b3UgY292ZXJlZCE8L3A+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cImJvcmRlclwiPjwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJjYXRlZ29yaWVzXCI+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDM+R2VuZXJhbCBUZWNoIFN1cHBvcnQ8L2gzPlxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgIDxsaT5NYWMgYW5kIFBDLiBMYXB0b3AsIGRlc2t0b3AsIG1vYmlsZSwgYW5kIHRhYmxldC4gVGVsbCB1cyB5b3VyIHByb2JsZW0gYW5kIHdlJ2xsIGZpeCBpdCE8L2xpPlxuICAgICAgICAgICAgPC91bD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDM+SW50ZXJuZXQgU2VydmljZSBBZHZpY2U8L2gzPlxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgIDxsaT5XZSdsbCB0YWtlIGEgbG9vayBhdCB3aGVyZSB5b3UgbGl2ZSBhbmQgbGV0IHlvdSBrbm93IHdoYXQgeW91ciBiZXN0IG9wdGlvbnMgYXJlIGZvciBjb25uZWN0aW5nXG4gICAgICAgICAgICAgICAgdG8gdGhlIGludGVybmV0PC9saT5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgzPkRhdGEgUmVjb3ZlcnkgYW5kIEJhY2t1cHM8L2gzPlxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgIDxsaT5IYXJkIGRyaXZlIGNyYXNoPyBXZSdsbCBoZWxwIHlvdSBnZXQgeW91ciB2YWx1YWJsZSBkYXRhIGJhY2s8L2xpPlxuICAgICAgICAgICAgICAgIDxsaT5BbmQgd2UnbGwgaGVscCB5b3UgYmFjayB5b3VyIGRhdGEgdXAgc28gdGhhdCBpdCdzIHNhZmUgZm9yIHRoZSBmdXR1cmU8L2xpPlxuICAgICAgICAgICAgPC91bD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDM+TmV0d29ya3M8L2gzPlxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgIDxsaT5JbnN0YWxsYXRpb24gb2Ygd2lyZWQgYW5kIHdpcmVsZXNzIG5ldHdvcmtzPC9saT5cbiAgICAgICAgICAgICAgICA8bGk+VHJvdWJsZXNob290aW5nIGZvciBpbnRlcm5ldCBjb25uZWN0aW9uIGlzc3VlczwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPkNvbmZpZ3VyYXRpb24gb2YgbW9kZW1zIGFuZCByb3V0ZXJzPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgzPkNvbXB1dGVyIFNlY3VyaXR5PC9oMz5cbiAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICA8bGk+S2VlcCB5b3VyIGtpZHMgc2FmZSBmcm9tIGluYXBwcm9wcmlhdGUgY29udGVudDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPkZpbmQgYW5kIGVsaW1pbmF0ZSB2aXJ1c2VzLCBtYWx3YXJlLCBhbmQgc3B5d2FyZTwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlNldCB1cCBhbnRpdmlydXMgc29mdHdhcmUgYW5kIGZpcmV3YWxscyBmb3IgZnVydGhlciBwcm90ZWN0aW9uPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDM+SGVscCBmb3IgQnVzaW5lc3NlczwvaDM+XG4gICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgPGxpPkZ1bGx5IGN1c3RvbWl6YWJsZSB3ZWJzaXRlcyB0aGF0IHdpbGwgaW1wcm92ZSB5b3VyIGJyYW5kIGFuZCBvcHRpbWl6ZSB5b3VyIHdvcmtmbG93PC9saT5cbiAgICAgICAgICAgICAgICA8bGk+U2V0dGluZyB1cCBjb21wYW55IGVtYWlsPC9saT5cbiAgICAgICAgICAgICAgICA8bGk+U2VydmVyIGluc3RhbGxhdGlvbjwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbjwvZGl2PmAiLCJtb2R1bGUuZXhwb3J0cyA9ICgpID0+IGA8ZGl2PjwvZGl2PmBcbiIsIm1vZHVsZS5leHBvcnRzID0gKCkgPT4gXG5gPGRpdiBjbGFzcz1cImhpZGRlblwiPlxuICAgIDxkaXYgZGF0YS1qcz1cImljb25cIj48L2Rpdj5cbiAgICA8ZGl2PlxuICAgICAgICA8ZGl2IGRhdGEtanM9XCJ0aXRsZVwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGRhdGEtanM9XCJtZXNzYWdlXCI+PC9kaXY+XG4gICAgPC9kaXY+XG48L2Rpdj5gIiwibW9kdWxlLmV4cG9ydHMgPSAocD17fSkgPT4gYDxzdmcgdmVyc2lvbj1cIjEuMVwiIGRhdGEtanM9XCIke3AubmFtZSB8fCAnY2hlY2ttYXJrJ31cIiBjbGFzcz1cImNoZWNrbWFya1wiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiB4PVwiMHB4XCIgeT1cIjBweFwiXG5cdCB3aWR0aD1cIjk3LjYxOXB4XCIgaGVpZ2h0PVwiOTcuNjE4cHhcIiB2aWV3Qm94PVwiMCAwIDk3LjYxOSA5Ny42MThcIiBzdHlsZT1cImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgOTcuNjE5IDk3LjYxODtcIlxuXHQgeG1sOnNwYWNlPVwicHJlc2VydmVcIj5cbjxnPlxuXHQ8cGF0aCBkPVwiTTk2LjkzOSwxNy4zNThMODMuOTY4LDUuOTU5Yy0wLjM5OC0wLjM1Mi0wLjkyNy0wLjUzMS0xLjQ0OS0wLjQ5NEM4MS45OSw1LjUsODEuNDk2LDUuNzQzLDgxLjE0Niw2LjE0MkwzNC4xLDU5LjY4OFxuXHRcdEwxNy4zNzIsMzcuNTQ3Yy0wLjMxOS0wLjQyMi0wLjc5NC0wLjcwMS0xLjMxOS0wLjc3M2MtMC41MjQtMC4wNzgtMS4wNTksMC4wNjQtMS40ODEsMC4zODVMMC43OTQsNDcuNTY3XG5cdFx0Yy0wLjg4MSwwLjY2Ni0xLjA1NiwxLjkyLTAuMzksMi44MDFsMzAuOTc0LDQwLjk5NmMwLjM2MiwwLjQ3OSwwLjkyMiwwLjc3MSwxLjUyMiwwLjc5M2MwLjAyNCwwLDAuMDQ5LDAsMC4wNzMsMFxuXHRcdGMwLjU3NCwwLDEuMTIyLTAuMjQ2LDEuNTAzLTAuNjhsNjIuNjQ0LTcxLjI5N0M5Ny44NSwxOS4zNTEsOTcuNzY5LDE4LjA4Niw5Ni45MzksMTcuMzU4elwiLz5cbjwvZz48L3N2Zz5gXG4iLCJtb2R1bGUuZXhwb3J0cyA9IChwPXt9KSA9PiBgPHN2ZyB2ZXJzaW9uPVwiMS4xXCIgZGF0YS1qcz1cIiR7cC5uYW1lIHx8ICdlcnJvcid9XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHg9XCIwcHhcIiB5PVwiMHB4XCIgdmlld0JveD1cIjAgMCAxOC45NzggMTguOTc4XCIgc3R5bGU9XCJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDE4Ljk3OCAxOC45Nzg7XCIgeG1sOnNwYWNlPVwicHJlc2VydmVcIj5cclxuPGc+XHJcbiAgICA8cGF0aCBkPVwiTTE2LjA4OCwxLjY3NWMtMC4xMzMtMC4xMDQtMC4zMDYtMC4xNDQtMC40Ny0wLjEwNWMtMC4wMTMsMC4wMDItMS4yNjEsMC4yOS0yLjU5NCwwLjI5XHJcbiAgICAgICAgYy0xLjc4OCwwLTIuNzg5LTAuNDc2LTIuOTc1LTEuNDE1QzkuOTk5LDAuMTkxLDkuNzc5LDAuMDA3LDkuNTIxLDBjLTAuMjU3LTAuMDA3LTAuNDg3LDAuMTY3LTAuNTUsMC40MThcclxuICAgICAgICBDOC43MjcsMS4zODYsNy43MSwxLjg3Nyw1Ljk1LDEuODc3Yy0xLjMzMiwwLTIuNTcxLTAuMzAyLTIuNTgzLTAuMzA1Yy0wLjE2Ni0wLjA0LTAuMzQtMC4wMDQtMC40NzQsMC4xMDJcclxuICAgICAgICBDMi43NiwxLjc3NywyLjY4MSwxLjkzOCwyLjY4MSwyLjEwOHY0Ljg2OWMwLDAuMDQsMC4wMDQsMC4wNzgsMC4wMTMsMC4xMTVjMC4wNTcsMS42NDcsMC42NSw4LjcxNCw2LjUyOCwxMS44MjJcclxuICAgICAgICBjMC4wOCwwLjA0MywwLjE2OSwwLjA2NCwwLjI1OCwwLjA2NGMwLjA5MiwwLDAuMTgzLTAuMDIxLDAuMjY2LTAuMDY2YzUuNzQtMy4xMzcsNi40NDUtMTAuMTE1LDYuNTMyLTExLjc5MVxyXG4gICAgICAgIGMwLjAxMi0wLjA0NiwwLjAxOS0wLjA5NCwwLjAxOS0wLjE0NFYyLjEwOEMxNi4yOTcsMS45MzksMTYuMjE5LDEuNzgsMTYuMDg4LDEuNjc1eiBNMTUuMTksNi44NTdcclxuICAgICAgICBjLTAuMDA3LDAuMDMxLTAuMDEyLDAuMDY0LTAuMDEzLDAuMDk3Yy0wLjA1MywxLjI5OC0wLjU3NCw3LjgzMi01LjcwMSwxMC44MzhjLTUuMjE1LTIuOTY1LTUuNjQ2LTkuNTI2LTUuNjgtMTAuODNcclxuICAgICAgICBjMC0wLjAyOS0wLjAwNC0wLjA1OC0wLjAwOS0wLjA4NVYyLjc4NEM0LjMyMiwyLjg3Nyw1LjExMiwyLjk4Miw1Ljk1LDIuOTgyYzEuOTExLDAsMi45NjUtMC41NCwzLjUzNy0xLjIwOFxyXG4gICAgICAgIGMwLjU1MywwLjY2MSwxLjU5OSwxLjE5MSwzLjUzNiwxLjE5MWMwLjgzOSwwLDEuNjMxLTAuMTAxLDIuMTY2LTAuMTg4TDE1LjE5LDYuODU3TDE1LjE5LDYuODU3elwiLz5cclxuICAgIDxwb2x5Z29uIHBvaW50cz1cIjEwLjI0MSwxMS4yMzcgMTAuNTI5LDUuMzExIDguNDQ5LDUuMzExIDguNzUsMTEuMjM3IFx0XHRcIi8+XHJcbiAgICA8cGF0aCBkPVwiTTkuNDk2LDExLjg5MWMtMC42OTQsMC0xLjE3OCwwLjQ5OC0xLjE3OCwxLjE4OWMwLDAuNjgyLDAuNDcxLDEuMTkxLDEuMTc4LDEuMTkxXHJcbiAgICAgICAgYzAuNzA2LDAsMS4xNjQtMC41MSwxLjE2NC0xLjE5MUMxMC42NDcsMTIuMzg5LDEwLjE4OSwxMS44OTEsOS40OTYsMTEuODkxelwiLz5cclxuPC9nPjwvc3ZnPmBcclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgICBjb25zdHJ1Y3RvciggZGF0YSwgb3B0cz17fSApIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbiggdGhpcywgeyBzdG9yZTogeyB9LCBkYXRhIH0sIG9wdHMgKVxuXG4gICAgICAgIGlmKCB0aGlzLnN0b3JlQnkgKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3JlQnkuZm9yRWFjaCgga2V5ID0+IHRoaXMuc3RvcmVbIGtleSBdID0geyB9IClcbiAgICAgICAgICAgIHRoaXMuX3N0b3JlKClcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIF9zdG9yZSgpIHtcbiAgICAgICAgdGhpcy5kYXRhLmZvckVhY2goIGRhdHVtID0+IHRoaXMuc3RvcmVCeS5mb3JFYWNoKCBhdHRyID0+IHRoaXMuX3N0b3JlQXR0ciggZGF0dW0sIGF0dHIgKSApIClcbiAgICB9LFxuXG4gICAgX3N0b3JlQXR0ciggZGF0dW0sIGF0dHIgKSB7XG4gICAgICAgIHRoaXMuc3RvcmVbIGF0dHIgXVsgZGF0dW1bIGF0dHIgXSBdID1cbiAgICAgICAgICAgIHRoaXMuc3RvcmVbIGF0dHIgXVsgZGF0dW1bIGF0dHIgXSBdXG4gICAgICAgICAgICAgICAgPyBBcnJheS5pc0FycmF5KCB0aGlzLnN0b3JlWyBhdHRyIF1bIGRhdHVtWyBhdHRyIF0gXSApXG4gICAgICAgICAgICAgICAgICAgID8gdGhpcy5zdG9yZVsgYXR0ciBdWyBkYXR1bVsgYXR0ciBdIF0uY29uY2F0KCBkYXR1bSApXG4gICAgICAgICAgICAgICAgICAgIDpbIHRoaXMuc3RvcmVbIGF0dHIgXVsgZGF0dW1bIGF0dHIgXSBdLCBkYXR1bSBdXG4gICAgICAgICAgICAgICAgOiBkYXR1bVxuICAgIH1cblxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBlcnIgPT4geyBjb25zb2xlLmxvZyggZXJyLnN0YWNrIHx8IGVyciApIH1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgZ2V0SW50UmFuZ2UoIGludCApIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oIEFycmF5KCBpbnQgKS5rZXlzKCkgKVxuICAgIH0sXG5cbiAgICBnZXRSYW5kb21JbmNsdXNpdmVJbnRlZ2VyKCBtaW4sIG1heCApIHtcbiAgICAgICAgbWluID0gTWF0aC5jZWlsKG1pbilcbiAgICAgICAgbWF4ID0gTWF0aC5mbG9vcihtYXgpXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluXG4gICAgfSxcblxuICAgIG9taXQoIG9iaiwga2V5cyApIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKCBvYmogKS5maWx0ZXIoIGtleSA9PiAha2V5cy5pbmNsdWRlcygga2V5ICkgKS5yZWR1Y2UoICggbWVtbywga2V5ICkgPT4gT2JqZWN0LmFzc2lnbiggbWVtbywgeyBba2V5XTogb2JqW2tleV0gfSApLCB7IH0gKVxuICAgIH0sXG5cbiAgICBwaWNrKCBvYmosIGtleXMgKSB7XG4gICAgICAgIHJldHVybiBrZXlzLnJlZHVjZSggKCBtZW1vLCBrZXkgKSA9PiBPYmplY3QuYXNzaWduKCBtZW1vLCB7IFtrZXldOiBvYmpba2V5XSB9ICksIHsgfSApXG4gICAgfSxcblxuICAgIEVycm9yOiByZXF1aXJlKCcuL015RXJyb3InKSxcblxuICAgIFA6ICggZnVuLCBhcmdzPVsgXSwgdGhpc0FyZyApID0+XG4gICAgICAgIG5ldyBQcm9taXNlKCAoIHJlc29sdmUsIHJlamVjdCApID0+IFJlZmxlY3QuYXBwbHkoIGZ1biwgdGhpc0FyZyB8fCB0aGlzLCBhcmdzLmNvbmNhdCggKCBlLCAuLi5jYWxsYmFjayApID0+IGUgPyByZWplY3QoZSkgOiByZXNvbHZlKGNhbGxiYWNrKSApICkgKSxcbiAgICBcbiAgICBjb25zdHJ1Y3RvcigpIHsgcmV0dXJuIHRoaXMgfVxufVxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEF0IGxlYXN0IGdpdmUgc29tZSBraW5kIG9mIGNvbnRleHQgdG8gdGhlIHVzZXJcbiAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4gKCcgKyBlciArICcpJyk7XG4gICAgICAgIGVyci5jb250ZXh0ID0gZXI7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIGlmICh0aGlzLl9ldmVudHMpIHtcbiAgICB2YXIgZXZsaXN0ZW5lciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGV2bGlzdGVuZXIpKVxuICAgICAgcmV0dXJuIDE7XG4gICAgZWxzZSBpZiAoZXZsaXN0ZW5lcilcbiAgICAgIHJldHVybiBldmxpc3RlbmVyLmxlbmd0aDtcbiAgfVxuICByZXR1cm4gMDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICByZXR1cm4gZW1pdHRlci5saXN0ZW5lckNvdW50KHR5cGUpO1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiLypcbiAqIHNtb290aHNjcm9sbCBwb2x5ZmlsbCAtIHYwLjMuNVxuICogaHR0cHM6Ly9pYW1kdXN0YW4uZ2l0aHViLmlvL3Ntb290aHNjcm9sbFxuICogMjAxNiAoYykgRHVzdGFuIEthc3RlbiwgSmVyZW1pYXMgTWVuaWNoZWxsaSAtIE1JVCBMaWNlbnNlXG4gKi9cblxuKGZ1bmN0aW9uKHcsIGQsIHVuZGVmaW5lZCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLypcbiAgICogYWxpYXNlc1xuICAgKiB3OiB3aW5kb3cgZ2xvYmFsIG9iamVjdFxuICAgKiBkOiBkb2N1bWVudFxuICAgKiB1bmRlZmluZWQ6IHVuZGVmaW5lZFxuICAgKi9cblxuICAvLyBwb2x5ZmlsbFxuICBmdW5jdGlvbiBwb2x5ZmlsbCgpIHtcbiAgICAvLyByZXR1cm4gd2hlbiBzY3JvbGxCZWhhdmlvciBpbnRlcmZhY2UgaXMgc3VwcG9ydGVkXG4gICAgaWYgKCdzY3JvbGxCZWhhdmlvcicgaW4gZC5kb2N1bWVudEVsZW1lbnQuc3R5bGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIGdsb2JhbHNcbiAgICAgKi9cbiAgICB2YXIgRWxlbWVudCA9IHcuSFRNTEVsZW1lbnQgfHwgdy5FbGVtZW50O1xuICAgIHZhciBTQ1JPTExfVElNRSA9IDQ2ODtcblxuICAgIC8qXG4gICAgICogb2JqZWN0IGdhdGhlcmluZyBvcmlnaW5hbCBzY3JvbGwgbWV0aG9kc1xuICAgICAqL1xuICAgIHZhciBvcmlnaW5hbCA9IHtcbiAgICAgIHNjcm9sbDogdy5zY3JvbGwgfHwgdy5zY3JvbGxUbyxcbiAgICAgIHNjcm9sbEJ5OiB3LnNjcm9sbEJ5LFxuICAgICAgZWxTY3JvbGw6IEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbCB8fCBzY3JvbGxFbGVtZW50LFxuICAgICAgc2Nyb2xsSW50b1ZpZXc6IEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbEludG9WaWV3XG4gICAgfTtcblxuICAgIC8qXG4gICAgICogZGVmaW5lIHRpbWluZyBtZXRob2RcbiAgICAgKi9cbiAgICB2YXIgbm93ID0gdy5wZXJmb3JtYW5jZSAmJiB3LnBlcmZvcm1hbmNlLm5vd1xuICAgICAgPyB3LnBlcmZvcm1hbmNlLm5vdy5iaW5kKHcucGVyZm9ybWFuY2UpIDogRGF0ZS5ub3c7XG5cbiAgICAvKipcbiAgICAgKiBjaGFuZ2VzIHNjcm9sbCBwb3NpdGlvbiBpbnNpZGUgYW4gZWxlbWVudFxuICAgICAqIEBtZXRob2Qgc2Nyb2xsRWxlbWVudFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzY3JvbGxFbGVtZW50KHgsIHkpIHtcbiAgICAgIHRoaXMuc2Nyb2xsTGVmdCA9IHg7XG4gICAgICB0aGlzLnNjcm9sbFRvcCA9IHk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcmV0dXJucyByZXN1bHQgb2YgYXBwbHlpbmcgZWFzZSBtYXRoIGZ1bmN0aW9uIHRvIGEgbnVtYmVyXG4gICAgICogQG1ldGhvZCBlYXNlXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGtcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGVhc2Uoaykge1xuICAgICAgcmV0dXJuIDAuNSAqICgxIC0gTWF0aC5jb3MoTWF0aC5QSSAqIGspKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBpbmRpY2F0ZXMgaWYgYSBzbW9vdGggYmVoYXZpb3Igc2hvdWxkIGJlIGFwcGxpZWRcbiAgICAgKiBAbWV0aG9kIHNob3VsZEJhaWxPdXRcbiAgICAgKiBAcGFyYW0ge051bWJlcnxPYmplY3R9IHhcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzaG91bGRCYWlsT3V0KHgpIHtcbiAgICAgIGlmICh0eXBlb2YgeCAhPT0gJ29iamVjdCdcbiAgICAgICAgICAgIHx8IHggPT09IG51bGxcbiAgICAgICAgICAgIHx8IHguYmVoYXZpb3IgPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgfHwgeC5iZWhhdmlvciA9PT0gJ2F1dG8nXG4gICAgICAgICAgICB8fCB4LmJlaGF2aW9yID09PSAnaW5zdGFudCcpIHtcbiAgICAgICAgLy8gZmlyc3QgYXJnIG5vdCBhbiBvYmplY3QvbnVsbFxuICAgICAgICAvLyBvciBiZWhhdmlvciBpcyBhdXRvLCBpbnN0YW50IG9yIHVuZGVmaW5lZFxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiB4ID09PSAnb2JqZWN0J1xuICAgICAgICAgICAgJiYgeC5iZWhhdmlvciA9PT0gJ3Ntb290aCcpIHtcbiAgICAgICAgLy8gZmlyc3QgYXJndW1lbnQgaXMgYW4gb2JqZWN0IGFuZCBiZWhhdmlvciBpcyBzbW9vdGhcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyB0aHJvdyBlcnJvciB3aGVuIGJlaGF2aW9yIGlzIG5vdCBzdXBwb3J0ZWRcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2JlaGF2aW9yIG5vdCB2YWxpZCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGZpbmRzIHNjcm9sbGFibGUgcGFyZW50IG9mIGFuIGVsZW1lbnRcbiAgICAgKiBAbWV0aG9kIGZpbmRTY3JvbGxhYmxlUGFyZW50XG4gICAgICogQHBhcmFtIHtOb2RlfSBlbFxuICAgICAqIEByZXR1cm5zIHtOb2RlfSBlbFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZpbmRTY3JvbGxhYmxlUGFyZW50KGVsKSB7XG4gICAgICB2YXIgaXNCb2R5O1xuICAgICAgdmFyIGhhc1Njcm9sbGFibGVTcGFjZTtcbiAgICAgIHZhciBoYXNWaXNpYmxlT3ZlcmZsb3c7XG5cbiAgICAgIGRvIHtcbiAgICAgICAgZWwgPSBlbC5wYXJlbnROb2RlO1xuXG4gICAgICAgIC8vIHNldCBjb25kaXRpb24gdmFyaWFibGVzXG4gICAgICAgIGlzQm9keSA9IGVsID09PSBkLmJvZHk7XG4gICAgICAgIGhhc1Njcm9sbGFibGVTcGFjZSA9XG4gICAgICAgICAgZWwuY2xpZW50SGVpZ2h0IDwgZWwuc2Nyb2xsSGVpZ2h0IHx8XG4gICAgICAgICAgZWwuY2xpZW50V2lkdGggPCBlbC5zY3JvbGxXaWR0aDtcbiAgICAgICAgaGFzVmlzaWJsZU92ZXJmbG93ID1cbiAgICAgICAgICB3LmdldENvbXB1dGVkU3R5bGUoZWwsIG51bGwpLm92ZXJmbG93ID09PSAndmlzaWJsZSc7XG4gICAgICB9IHdoaWxlICghaXNCb2R5ICYmICEoaGFzU2Nyb2xsYWJsZVNwYWNlICYmICFoYXNWaXNpYmxlT3ZlcmZsb3cpKTtcblxuICAgICAgaXNCb2R5ID0gaGFzU2Nyb2xsYWJsZVNwYWNlID0gaGFzVmlzaWJsZU92ZXJmbG93ID0gbnVsbDtcblxuICAgICAgcmV0dXJuIGVsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHNlbGYgaW52b2tlZCBmdW5jdGlvbiB0aGF0LCBnaXZlbiBhIGNvbnRleHQsIHN0ZXBzIHRocm91Z2ggc2Nyb2xsaW5nXG4gICAgICogQG1ldGhvZCBzdGVwXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzdGVwKGNvbnRleHQpIHtcbiAgICAgIHZhciB0aW1lID0gbm93KCk7XG4gICAgICB2YXIgdmFsdWU7XG4gICAgICB2YXIgY3VycmVudFg7XG4gICAgICB2YXIgY3VycmVudFk7XG4gICAgICB2YXIgZWxhcHNlZCA9ICh0aW1lIC0gY29udGV4dC5zdGFydFRpbWUpIC8gU0NST0xMX1RJTUU7XG5cbiAgICAgIC8vIGF2b2lkIGVsYXBzZWQgdGltZXMgaGlnaGVyIHRoYW4gb25lXG4gICAgICBlbGFwc2VkID0gZWxhcHNlZCA+IDEgPyAxIDogZWxhcHNlZDtcblxuICAgICAgLy8gYXBwbHkgZWFzaW5nIHRvIGVsYXBzZWQgdGltZVxuICAgICAgdmFsdWUgPSBlYXNlKGVsYXBzZWQpO1xuXG4gICAgICBjdXJyZW50WCA9IGNvbnRleHQuc3RhcnRYICsgKGNvbnRleHQueCAtIGNvbnRleHQuc3RhcnRYKSAqIHZhbHVlO1xuICAgICAgY3VycmVudFkgPSBjb250ZXh0LnN0YXJ0WSArIChjb250ZXh0LnkgLSBjb250ZXh0LnN0YXJ0WSkgKiB2YWx1ZTtcblxuICAgICAgY29udGV4dC5tZXRob2QuY2FsbChjb250ZXh0LnNjcm9sbGFibGUsIGN1cnJlbnRYLCBjdXJyZW50WSk7XG5cbiAgICAgIC8vIHNjcm9sbCBtb3JlIGlmIHdlIGhhdmUgbm90IHJlYWNoZWQgb3VyIGRlc3RpbmF0aW9uXG4gICAgICBpZiAoY3VycmVudFggIT09IGNvbnRleHQueCB8fCBjdXJyZW50WSAhPT0gY29udGV4dC55KSB7XG4gICAgICAgIHcucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHN0ZXAuYmluZCh3LCBjb250ZXh0KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogc2Nyb2xscyB3aW5kb3cgd2l0aCBhIHNtb290aCBiZWhhdmlvclxuICAgICAqIEBtZXRob2Qgc21vb3RoU2Nyb2xsXG4gICAgICogQHBhcmFtIHtPYmplY3R8Tm9kZX0gZWxcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5XG4gICAgICovXG4gICAgZnVuY3Rpb24gc21vb3RoU2Nyb2xsKGVsLCB4LCB5KSB7XG4gICAgICB2YXIgc2Nyb2xsYWJsZTtcbiAgICAgIHZhciBzdGFydFg7XG4gICAgICB2YXIgc3RhcnRZO1xuICAgICAgdmFyIG1ldGhvZDtcbiAgICAgIHZhciBzdGFydFRpbWUgPSBub3coKTtcblxuICAgICAgLy8gZGVmaW5lIHNjcm9sbCBjb250ZXh0XG4gICAgICBpZiAoZWwgPT09IGQuYm9keSkge1xuICAgICAgICBzY3JvbGxhYmxlID0gdztcbiAgICAgICAgc3RhcnRYID0gdy5zY3JvbGxYIHx8IHcucGFnZVhPZmZzZXQ7XG4gICAgICAgIHN0YXJ0WSA9IHcuc2Nyb2xsWSB8fCB3LnBhZ2VZT2Zmc2V0O1xuICAgICAgICBtZXRob2QgPSBvcmlnaW5hbC5zY3JvbGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzY3JvbGxhYmxlID0gZWw7XG4gICAgICAgIHN0YXJ0WCA9IGVsLnNjcm9sbExlZnQ7XG4gICAgICAgIHN0YXJ0WSA9IGVsLnNjcm9sbFRvcDtcbiAgICAgICAgbWV0aG9kID0gc2Nyb2xsRWxlbWVudDtcbiAgICAgIH1cblxuICAgICAgLy8gc2Nyb2xsIGxvb3Bpbmcgb3ZlciBhIGZyYW1lXG4gICAgICBzdGVwKHtcbiAgICAgICAgc2Nyb2xsYWJsZTogc2Nyb2xsYWJsZSxcbiAgICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICAgIHN0YXJ0VGltZTogc3RhcnRUaW1lLFxuICAgICAgICBzdGFydFg6IHN0YXJ0WCxcbiAgICAgICAgc3RhcnRZOiBzdGFydFksXG4gICAgICAgIHg6IHgsXG4gICAgICAgIHk6IHlcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogT1JJR0lOQUwgTUVUSE9EUyBPVkVSUklERVNcbiAgICAgKi9cblxuICAgIC8vIHcuc2Nyb2xsIGFuZCB3LnNjcm9sbFRvXG4gICAgdy5zY3JvbGwgPSB3LnNjcm9sbFRvID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBhdm9pZCBzbW9vdGggYmVoYXZpb3IgaWYgbm90IHJlcXVpcmVkXG4gICAgICBpZiAoc2hvdWxkQmFpbE91dChhcmd1bWVudHNbMF0pKSB7XG4gICAgICAgIG9yaWdpbmFsLnNjcm9sbC5jYWxsKFxuICAgICAgICAgIHcsXG4gICAgICAgICAgYXJndW1lbnRzWzBdLmxlZnQgfHwgYXJndW1lbnRzWzBdLFxuICAgICAgICAgIGFyZ3VtZW50c1swXS50b3AgfHwgYXJndW1lbnRzWzFdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTEVUIFRIRSBTTU9PVEhORVNTIEJFR0lOIVxuICAgICAgc21vb3RoU2Nyb2xsLmNhbGwoXG4gICAgICAgIHcsXG4gICAgICAgIGQuYm9keSxcbiAgICAgICAgfn5hcmd1bWVudHNbMF0ubGVmdCxcbiAgICAgICAgfn5hcmd1bWVudHNbMF0udG9wXG4gICAgICApO1xuICAgIH07XG5cbiAgICAvLyB3LnNjcm9sbEJ5XG4gICAgdy5zY3JvbGxCeSA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gYXZvaWQgc21vb3RoIGJlaGF2aW9yIGlmIG5vdCByZXF1aXJlZFxuICAgICAgaWYgKHNob3VsZEJhaWxPdXQoYXJndW1lbnRzWzBdKSkge1xuICAgICAgICBvcmlnaW5hbC5zY3JvbGxCeS5jYWxsKFxuICAgICAgICAgIHcsXG4gICAgICAgICAgYXJndW1lbnRzWzBdLmxlZnQgfHwgYXJndW1lbnRzWzBdLFxuICAgICAgICAgIGFyZ3VtZW50c1swXS50b3AgfHwgYXJndW1lbnRzWzFdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTEVUIFRIRSBTTU9PVEhORVNTIEJFR0lOIVxuICAgICAgc21vb3RoU2Nyb2xsLmNhbGwoXG4gICAgICAgIHcsXG4gICAgICAgIGQuYm9keSxcbiAgICAgICAgfn5hcmd1bWVudHNbMF0ubGVmdCArICh3LnNjcm9sbFggfHwgdy5wYWdlWE9mZnNldCksXG4gICAgICAgIH5+YXJndW1lbnRzWzBdLnRvcCArICh3LnNjcm9sbFkgfHwgdy5wYWdlWU9mZnNldClcbiAgICAgICk7XG4gICAgfTtcblxuICAgIC8vIEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbCBhbmQgRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsVG9cbiAgICBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGwgPSBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxUbyA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gYXZvaWQgc21vb3RoIGJlaGF2aW9yIGlmIG5vdCByZXF1aXJlZFxuICAgICAgaWYgKHNob3VsZEJhaWxPdXQoYXJndW1lbnRzWzBdKSkge1xuICAgICAgICBvcmlnaW5hbC5lbFNjcm9sbC5jYWxsKFxuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIGFyZ3VtZW50c1swXS5sZWZ0IHx8IGFyZ3VtZW50c1swXSxcbiAgICAgICAgICAgIGFyZ3VtZW50c1swXS50b3AgfHwgYXJndW1lbnRzWzFdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTEVUIFRIRSBTTU9PVEhORVNTIEJFR0lOIVxuICAgICAgc21vb3RoU2Nyb2xsLmNhbGwoXG4gICAgICAgICAgdGhpcyxcbiAgICAgICAgICB0aGlzLFxuICAgICAgICAgIGFyZ3VtZW50c1swXS5sZWZ0LFxuICAgICAgICAgIGFyZ3VtZW50c1swXS50b3BcbiAgICAgICk7XG4gICAgfTtcblxuICAgIC8vIEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbEJ5XG4gICAgRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsQnkgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmcwID0gYXJndW1lbnRzWzBdO1xuXG4gICAgICBpZiAodHlwZW9mIGFyZzAgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHRoaXMuc2Nyb2xsKHtcbiAgICAgICAgICBsZWZ0OiBhcmcwLmxlZnQgKyB0aGlzLnNjcm9sbExlZnQsXG4gICAgICAgICAgdG9wOiBhcmcwLnRvcCArIHRoaXMuc2Nyb2xsVG9wLFxuICAgICAgICAgIGJlaGF2aW9yOiBhcmcwLmJlaGF2aW9yXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zY3JvbGwoXG4gICAgICAgICAgdGhpcy5zY3JvbGxMZWZ0ICsgYXJnMCxcbiAgICAgICAgICB0aGlzLnNjcm9sbFRvcCArIGFyZ3VtZW50c1sxXVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxJbnRvVmlld1xuICAgIEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbEludG9WaWV3ID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBhdm9pZCBzbW9vdGggYmVoYXZpb3IgaWYgbm90IHJlcXVpcmVkXG4gICAgICBpZiAoc2hvdWxkQmFpbE91dChhcmd1bWVudHNbMF0pKSB7XG4gICAgICAgIG9yaWdpbmFsLnNjcm9sbEludG9WaWV3LmNhbGwodGhpcywgYXJndW1lbnRzWzBdIHx8IHRydWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIExFVCBUSEUgU01PT1RITkVTUyBCRUdJTiFcbiAgICAgIHZhciBzY3JvbGxhYmxlUGFyZW50ID0gZmluZFNjcm9sbGFibGVQYXJlbnQodGhpcyk7XG4gICAgICB2YXIgcGFyZW50UmVjdHMgPSBzY3JvbGxhYmxlUGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgdmFyIGNsaWVudFJlY3RzID0gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgaWYgKHNjcm9sbGFibGVQYXJlbnQgIT09IGQuYm9keSkge1xuICAgICAgICAvLyByZXZlYWwgZWxlbWVudCBpbnNpZGUgcGFyZW50XG4gICAgICAgIHNtb290aFNjcm9sbC5jYWxsKFxuICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgc2Nyb2xsYWJsZVBhcmVudCxcbiAgICAgICAgICBzY3JvbGxhYmxlUGFyZW50LnNjcm9sbExlZnQgKyBjbGllbnRSZWN0cy5sZWZ0IC0gcGFyZW50UmVjdHMubGVmdCxcbiAgICAgICAgICBzY3JvbGxhYmxlUGFyZW50LnNjcm9sbFRvcCArIGNsaWVudFJlY3RzLnRvcCAtIHBhcmVudFJlY3RzLnRvcFxuICAgICAgICApO1xuICAgICAgICAvLyByZXZlYWwgcGFyZW50IGluIHZpZXdwb3J0XG4gICAgICAgIHcuc2Nyb2xsQnkoe1xuICAgICAgICAgIGxlZnQ6IHBhcmVudFJlY3RzLmxlZnQsXG4gICAgICAgICAgdG9wOiBwYXJlbnRSZWN0cy50b3AsXG4gICAgICAgICAgYmVoYXZpb3I6ICdzbW9vdGgnXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcmV2ZWFsIGVsZW1lbnQgaW4gdmlld3BvcnRcbiAgICAgICAgdy5zY3JvbGxCeSh7XG4gICAgICAgICAgbGVmdDogY2xpZW50UmVjdHMubGVmdCxcbiAgICAgICAgICB0b3A6IGNsaWVudFJlY3RzLnRvcCxcbiAgICAgICAgICBiZWhhdmlvcjogJ3Ntb290aCdcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAvLyBjb21tb25qc1xuICAgIG1vZHVsZS5leHBvcnRzID0geyBwb2x5ZmlsbDogcG9seWZpbGwgfTtcbiAgfSBlbHNlIHtcbiAgICAvLyBnbG9iYWxcbiAgICBwb2x5ZmlsbCgpO1xuICB9XG59KSh3aW5kb3csIGRvY3VtZW50KTtcbiJdfQ==
