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

module.exports = Object.create(Object.assign({}, require('./__proto__.js'), {

    data: {}

}), { resource: { value: 'person' } });

},{"./__proto__.js":7}],7:[function(require,module,exports){
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

        return this.Xhr({ method: 'patch', id: id, resource: this.resource, headers: this.headers || {}, data: JSON.stringify(data) }).then(function (response) {
            _this3.data = _this3.data ? _this3.data.concat(response) : [response];

            if (_this3.store) Object.keys(_this3.store).forEach(function (attr) {
                return _this3._store(response, attr);
            });

            return Promise.resolve(response);
        });
    },
    post: function post(model) {
        var _this4 = this;

        return this.Xhr({ method: 'post', resource: this.resource, headers: this.headers || {}, data: JSON.stringify(model) }).then(function (response) {
            _this4.data = _this4.data ? _this4.data.concat(response) : [response];

            if (_this4.store) Object.keys(_this4.store).forEach(function (attr) {
                return _this4._store(response, attr);
            });

            return Promise.resolve(response);
        });
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

    model: require('../models/Person'),

    onSubmitBtnClick: function onSubmitBtnClick() {
        var _this = this;

        if (this.submitting) return;

        this.submitting = true;

        return this.getFormData().then(function () {
            return _this.submit();
        }).then(function () {
            _this.isSubmitting = false;
            return _this.Toast.showMessage('success', "Info sent! We'll keep you posted!").then(function () {
                _this.emit('navigate', '/');
                _this.els.name.value = '';
                _this.els.contact.value = '';
                _this.els.address.value = '';
            });
        }).catch(function (e) {
            _this.Error(e);_this.submitting = false;
        });
    },
    getFormData: function getFormData() {
        var _this2 = this;

        Object.keys(this.els).forEach(function (attr) {
            var el = _this2.els[attr];

            if (el.tagName !== "INPUT") return;
            _this2.model.data[attr] = el.value;
        });

        return Promise.resolve();
    },
    submit: function submit() {
        var _this3 = this;

        return this.model.post(this.model.data).catch(function (e) {
            _this3.Toast.showMessage('error', e.message);_this3.submitting = false;
        });
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

            _this2.show().then(function () {
                return _this2.hide();
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
    hide: function hide() {
        var _this5 = this;

        if (!document.body.contains(this.els.container) || this.isHidden()) {
            return Promise.resolve();
        } else if (this.els.container.classList.contains('hide')) {
            return new Promise(function (resolve) {
                return _this5.once('hidden', resolve);
            });
        } else {
            return new Promise(function (resolve) {
                _this5.onHiddenProxy = function (e) {
                    return _this5.onHidden(resolve);
                };
                _this5.els.container.addEventListener('transitionend', _this5.onHiddenProxy);
                _this5.els.container.classList.add('hide');
            });
        }
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
    isHidden: function isHidden() {
        return this.els.container.classList.contains('hidden');
    },
    onHidden: function onHidden(resolve) {
        this.els.container.removeEventListener('transitionend', this.onHiddenProxy);
        this.els.container.classList.add('hidden');
        resolve(this.emit('hidden'));
    },
    onLogin: function onLogin() {

        if (!this.isAllowed(this.user)) return this.scootAway();

        this.initialize().render();
    },
    onNavigation: function onNavigation() {
        return this.show();
    },
    onShown: function onShown(resolve) {
        this.els.container.removeEventListener('transitionend', this.onShownProxy);
        if (this.size) this.size();
        this.emit('shown');
        resolve(this.showing = false);
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
        var _this6 = this;

        this.subviewElements.forEach(function (obj) {
            var name = obj.name;

            var opts = {};

            if (_this6.Views && _this6.Views[name]) opts = _typeof(_this6.Views[name]) === "object" ? _this6.Views[name] : Reflect.apply(_this6.Views[name], _this6, []);

            _this6.views[name] = _this6.factory.create(key, Object.assign({ insertion: { value: { el: obj.el, method: 'insertBefore' } } }, { opts: { value: opts } }));
            obj.el.remove();
        });

        delete this.subviewElements;

        return this;
    },
    scootAway: function scootAway() {
        var _this7 = this;

        this.Toast.show('error', 'You are not allowed here.  Sorry.').catch(function (e) {
            _this7.Error(e);_this7.emit('navigate', '/');
        }).then(function () {
            return _this7.emit('navigate', '/');
        });

        return this;
    },
    setupShow: function setupShow(resolve) {
        var _this8 = this;

        this.onShownProxy = function (e) {
            return _this8.onShown(resolve);
        };
        this.els.container.addEventListener('transitionend', this.onShownProxy);
        this.els.container.classList.remove('hide');
    },
    show: function show() {
        var _this9 = this;

        if (this.showing) return new Promise(function (resolve) {
            return _this9.once('shown', resolve);
        });

        var classList = this.els.container.classList,
            isHidden = classList.contains('hidden'),
            isHiding = classList.contains('hide');

        var resolution = !isHidden && !isHiding ? function (resolve) {
            return resolve();
        } : isHidden ? function (resolve) {
            return window.requestAnimationFrame(function () {
                _this9.els.container.classList.remove('hidden');
                window.requestAnimationFrame(function () {
                    return _this9.setupShow(resolve);
                });
            });
        } : isHiding ? function (resolve) {
            _this9.els.container.removeEventListener('transitionend', _this9.onHiddenProxy);
            window.requestAnimationFrame(function () {
                return _this9.setupShow(resolve);
            });
        } : function (resolve) {
            return resolve();
        };

        return new Promise(resolution);
    },
    slurpEl: function slurpEl(el) {
        var key = el.getAttribute(this.slurp.attr) || 'container';

        if (key === 'container') el.classList.add(this.name);

        this.els[key] = Array.isArray(this.els[key]) ? this.els[key].concat(el) : this.els[key] !== undefined ? [this.els[key], el] : el;

        el.removeAttribute(this.slurp.attr);

        if (this.events[key]) this.delegateEvents(key, el);
    },
    slurpTemplate: function slurpTemplate(options) {
        var _this10 = this;

        var fragment = this.htmlToFragment(options.template),
            selector = '[' + this.slurp.attr + ']',
            viewSelector = '[' + this.slurp.view + ']',
            firstEl = fragment.querySelector('*');

        if (options.isView || firstEl.getAttribute(this.slurp.attr)) this.slurpEl(firstEl);
        fragment.querySelectorAll(selector + ', ' + viewSelector).forEach(function (el) {
            if (el.hasAttribute(_this10.slurp.attr)) {
                _this10.slurpEl(el);
            } else if (el.hasAttribute(_this10.slurp.view)) {
                _this10.subviewElements.push({ el: el, view: el.getAttribute(_this10.slurp.view), name: el.getAttribute(_this10.slurp.name) });
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
    return "<div>\n    <div>\n        <h2>Local Internet Service for Allegan</h2>\n        <p>Not happy with your internet options in Allegan? Tired of paying too much for lousy speeds and constant service interruptions?\n        Well, you're in luck, because Allegan Internet Wizard is currently considering launching our own internet service for\n        the fine citizens of Allegan. We believe there's not nearly enough freedom and choice when it comes to internet providers, and\n        we'd like to use our tech skills to change that and offer Allegan fast, reliable service at a reasonable price.\n        Let's give those fat cat telecoms some real competition!</p>\n        <p>If this sounds good to you, please leave your name and contact info, and we'll let you know how things are developing.\n        Thank you for your interest!</p>\n    </div>\n    <div class=\"border\"></div>\n    <form>\n        <input data-js=\"name\" type=\"text\" id=\"name\" placeholder=\"Name\">\n        <input data-js=\"contact\" type=\"text\" id=\"contact\" placeholder=\"Email or Phone Number\">\n        <input data-js=\"address\" type=\"text\" id=\"address\" placeholder=\"Address\">\n    </form>\n    <button data-js=\"submitBtn\">Submit</button>\n</div>";
};

},{}],22:[function(require,module,exports){
"use strict";

module.exports = function () {
    return "<div>\n    <h1>Our Services</h1>\n    <div class=\"intro\">\n        <p>Want to improve your home network? Protect your kids from inappropriate content on the web? Need help exploring\n        your internet service options? Can't figure out why a web page isn't working? Maybe you're a business and could use\n        some assistance on how to present yourself online. From general tech support to complex, specific problems, we've got\n        you covered!</p>\n    </div>\n    <div class=\"border\"></div>\n    <div class=\"categories\">\n        <div>\n            <h3>General Tech Support</h3>\n            <ul>\n                <li>Mac and PC. Laptop, desktop, mobile, and tablet. Tell us your problem and we'll fix it!</li>\n            </ul>\n        </div>\n        <div>\n            <h3>Internet Service Advice</h3>\n            <ul>\n                <li>We'll take a look at where you live and let you know what your best options are for connecting\n                to the internet</li>\n            </ul>\n        </div>\n        <div>\n            <h3>Data Recovery and Backups</h3>\n            <ul>\n                <li>Hard drive crash? We'll help you get your valuable data back</li>\n                <li>And we'll help you back your data up so that it's safe for the future</li>\n            </ul>\n        </div>\n        <div>\n            <h3>Networks</h3>\n            <ul>\n                <li>Installation of wired and wireless networks</li>\n                <li>Troubleshooting for internet connection issues</li>\n                <li>Configuration of modems and routers</li>\n            </ul>\n        </div>\n        <div>\n            <h3>Computer Security</h3>\n            <ul>\n                <li>Keep your kids safe from inappropriate content</li>\n                <li>Find and eliminate viruses, malware, and spyware</li>\n                <li>Set up antivirus software and firewalls for further protection</li>\n            </ul>\n       </div>\n        <div>\n            <h3>Help for Businesses</h3>\n            <ul>\n                <li>Marketing and branding</li>\n                <li>Server installation</li>\n            </ul>\n        </div>\n    </div>\n</div>";
};

},{}],23:[function(require,module,exports){
"use strict";

module.exports = function (p) {
    return "" + "<div class=\"clearfix hide hidden\">\n    <div data-js=\"icon\"></div>\n    <div>\n        <div data-js=\"title\"></div>\n        <div data-js=\"message\"></div>\n    </div>\n</div>";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvanMvLlRlbXBsYXRlTWFwLmpzIiwiY2xpZW50L2pzLy5WaWV3TWFwLmpzIiwiY2xpZW50L2pzL1hoci5qcyIsImNsaWVudC9qcy9mYWN0b3J5L1ZpZXcuanMiLCJjbGllbnQvanMvbWFpbi5qcyIsImNsaWVudC9qcy9tb2RlbHMvUGVyc29uLmpzIiwiY2xpZW50L2pzL21vZGVscy9fX3Byb3RvX18uanMiLCJjbGllbnQvanMvcG9seWZpbGwuanMiLCJjbGllbnQvanMvcm91dGVyLmpzIiwiY2xpZW50L2pzL3ZpZXdzL0Zvb3Rlci5qcyIsImNsaWVudC9qcy92aWV3cy9IZWFkZXIuanMiLCJjbGllbnQvanMvdmlld3MvSG9tZS5qcyIsImNsaWVudC9qcy92aWV3cy9JbnRlcm5ldC5qcyIsImNsaWVudC9qcy92aWV3cy9TZXJ2aWNlcy5qcyIsImNsaWVudC9qcy92aWV3cy9Ub2FzdC5qcyIsImNsaWVudC9qcy92aWV3cy9fX3Byb3RvX18uanMiLCJjbGllbnQvanMvdmlld3MvbGliL09wdGltaXplZFJlc2l6ZS5qcyIsImNsaWVudC9qcy92aWV3cy90ZW1wbGF0ZXMvRm9vdGVyLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9IZWFkZXIuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL0hvbWUuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL0ludGVybmV0LmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9TZXJ2aWNlcy5qcyIsImNsaWVudC9qcy92aWV3cy90ZW1wbGF0ZXMvVG9hc3QuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi9jaGVja21hcmsuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi9lcnJvci5qcyIsImxpYi9Nb2RlbC5qcyIsImxpYi9NeUVycm9yLmpzIiwibGliL015T2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCJub2RlX21vZHVsZXMvc21vb3Roc2Nyb2xsLXBvbHlmaWxsL2Rpc3Qvc21vb3Roc2Nyb2xsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxPQUFPLE9BQVAsR0FBZTtBQUNkLFNBQVEsUUFBUSwwQkFBUixDQURNO0FBRWQsU0FBUSxRQUFRLDBCQUFSLENBRk07QUFHZCxPQUFNLFFBQVEsd0JBQVIsQ0FIUTtBQUlkLFdBQVUsUUFBUSw0QkFBUixDQUpJO0FBS2QsV0FBVSxRQUFRLDRCQUFSLENBTEk7QUFNZCxRQUFPLFFBQVEseUJBQVI7QUFOTyxDQUFmOzs7OztBQ0FBLE9BQU8sT0FBUCxHQUFlO0FBQ2QsU0FBUSxRQUFRLGdCQUFSLENBRE07QUFFZCxTQUFRLFFBQVEsZ0JBQVIsQ0FGTTtBQUdkLE9BQU0sUUFBUSxjQUFSLENBSFE7QUFJZCxXQUFVLFFBQVEsa0JBQVIsQ0FKSTtBQUtkLFdBQVUsUUFBUSxrQkFBUixDQUxJO0FBTWQsUUFBTyxRQUFRLGVBQVI7QUFOTyxDQUFmOzs7OztBQ0FBLE9BQU8sT0FBUCxHQUFpQixPQUFPLE1BQVAsQ0FBZSxPQUFPLE1BQVAsQ0FBZSxFQUFmLEVBQW1CLFFBQVEsb0JBQVIsQ0FBbkIsRUFBa0Q7O0FBRTlFLGFBQVM7QUFFTCxtQkFGSyx1QkFFUSxJQUZSLEVBRWU7QUFBQTs7QUFDaEIsZ0JBQUksTUFBTSxJQUFJLGNBQUosRUFBVjs7QUFFQSxnQkFBSSxLQUFLLFVBQVQsRUFBc0IsSUFBSSxnQkFBSixDQUFzQixVQUF0QixFQUFrQztBQUFBLHVCQUNwRCxLQUFLLFVBQUwsQ0FBaUIsRUFBRSxnQkFBRixHQUFxQixLQUFLLEtBQUwsQ0FBYyxFQUFFLE1BQUYsR0FBVyxFQUFFLEtBQWYsR0FBeUIsR0FBckMsQ0FBckIsR0FBa0UsQ0FBbkYsQ0FEb0Q7QUFBQSxhQUFsQzs7QUFJdEIsbUJBQU8sSUFBSSxPQUFKLENBQWEsVUFBRSxPQUFGLEVBQVcsTUFBWCxFQUF1Qjs7QUFFdkMsb0JB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHM9e1xuXHRGb290ZXI6IHJlcXVpcmUoJy4vdmlld3MvdGVtcGxhdGVzL0Zvb3RlcicpLFxuXHRIZWFkZXI6IHJlcXVpcmUoJy4vdmlld3MvdGVtcGxhdGVzL0hlYWRlcicpLFxuXHRIb21lOiByZXF1aXJlKCcuL3ZpZXdzL3RlbXBsYXRlcy9Ib21lJyksXG5cdEludGVybmV0OiByZXF1aXJlKCcuL3ZpZXdzL3RlbXBsYXRlcy9JbnRlcm5ldCcpLFxuXHRTZXJ2aWNlczogcmVxdWlyZSgnLi92aWV3cy90ZW1wbGF0ZXMvU2VydmljZXMnKSxcblx0VG9hc3Q6IHJlcXVpcmUoJy4vdmlld3MvdGVtcGxhdGVzL1RvYXN0Jylcbn0iLCJtb2R1bGUuZXhwb3J0cz17XG5cdEZvb3RlcjogcmVxdWlyZSgnLi92aWV3cy9Gb290ZXInKSxcblx0SGVhZGVyOiByZXF1aXJlKCcuL3ZpZXdzL0hlYWRlcicpLFxuXHRIb21lOiByZXF1aXJlKCcuL3ZpZXdzL0hvbWUnKSxcblx0SW50ZXJuZXQ6IHJlcXVpcmUoJy4vdmlld3MvSW50ZXJuZXQnKSxcblx0U2VydmljZXM6IHJlcXVpcmUoJy4vdmlld3MvU2VydmljZXMnKSxcblx0VG9hc3Q6IHJlcXVpcmUoJy4vdmlld3MvVG9hc3QnKVxufSIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSggT2JqZWN0LmFzc2lnbigge30sIHJlcXVpcmUoJy4uLy4uL2xpYi9NeU9iamVjdCcpLCB7XG5cbiAgICBSZXF1ZXN0OiB7XG5cbiAgICAgICAgY29uc3RydWN0b3IoIGRhdGEgKSB7XG4gICAgICAgICAgICBsZXQgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuICAgICAgICAgICAgaWYoIGRhdGEub25Qcm9ncmVzcyApIHJlcS5hZGRFdmVudExpc3RlbmVyKCBcInByb2dyZXNzXCIsIGUgPT5cbiAgICAgICAgICAgICAgICBkYXRhLm9uUHJvZ3Jlc3MoIGUubGVuZ3RoQ29tcHV0YWJsZSA/IE1hdGguZmxvb3IoICggZS5sb2FkZWQgLyBlLnRvdGFsICkgKiAxMDAgKSA6IDAgKSBcbiAgICAgICAgICAgIClcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUsIHJlamVjdCApID0+IHtcblxuICAgICAgICAgICAgICAgIHJlcS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgWyA1MDAsIDQwNCwgNDAxIF0uaW5jbHVkZXMoIHRoaXMuc3RhdHVzIClcbiAgICAgICAgICAgICAgICAgICAgICAgID8gcmVqZWN0KCBKU09OLnBhcnNlKCB0aGlzLnJlc3BvbnNlICkgKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiByZXNvbHZlKCBKU09OLnBhcnNlKCB0aGlzLnJlc3BvbnNlICkgKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmKCBkYXRhLm1ldGhvZCA9PT0gXCJnZXRcIiB8fCBkYXRhLm1ldGhvZCA9PT0gXCJvcHRpb25zXCIgKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBxcyA9IGRhdGEucXMgPyBgPyR7ZGF0YS5xc31gIDogJycgXG4gICAgICAgICAgICAgICAgICAgIHJlcS5vcGVuKCBkYXRhLm1ldGhvZCwgYC8ke2RhdGEucmVzb3VyY2V9JHtxc31gIClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRIZWFkZXJzKCByZXEsIGRhdGEuaGVhZGVycyApXG4gICAgICAgICAgICAgICAgICAgIHJlcS5zZW5kKG51bGwpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGF0aCA9IGAvJHtkYXRhLnJlc291cmNlfWAgKyAoIGRhdGEuaWQgPyBgLyR7ZGF0YS5pZH1gIDogJycgKTtcbiAgICAgICAgICAgICAgICAgICAgcmVxLm9wZW4oIGRhdGEubWV0aG9kLnRvVXBwZXJDYXNlKCksIHBhdGgsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0SGVhZGVycyggcmVxLCBkYXRhLmhlYWRlcnMgKVxuICAgICAgICAgICAgICAgICAgICByZXEuc2VuZCggZGF0YS5kYXRhIHx8IG51bGwgKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmKCBkYXRhLm9uUHJvZ3Jlc3MgKSBkYXRhLm9uUHJvZ3Jlc3MoICdzZW50JyApXG4gICAgICAgICAgICB9IClcbiAgICAgICAgfSxcblxuICAgICAgICBwbGFpbkVzY2FwZSggc1RleHQgKSB7XG4gICAgICAgICAgICAvKiBob3cgc2hvdWxkIEkgdHJlYXQgYSB0ZXh0L3BsYWluIGZvcm0gZW5jb2Rpbmc/IHdoYXQgY2hhcmFjdGVycyBhcmUgbm90IGFsbG93ZWQ/IHRoaXMgaXMgd2hhdCBJIHN1cHBvc2UuLi46ICovXG4gICAgICAgICAgICAvKiBcIjRcXDNcXDcgLSBFaW5zdGVpbiBzYWlkIEU9bWMyXCIgLS0tLT4gXCI0XFxcXDNcXFxcN1xcIC1cXCBFaW5zdGVpblxcIHNhaWRcXCBFXFw9bWMyXCIgKi9cbiAgICAgICAgICAgIHJldHVybiBzVGV4dC5yZXBsYWNlKC9bXFxzXFw9XFxcXF0vZywgXCJcXFxcJCZcIik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0SGVhZGVycyggcmVxLCBoZWFkZXJzPXt9ICkge1xuICAgICAgICAgICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoIFwiQWNjZXB0XCIsIGhlYWRlcnMuYWNjZXB0IHx8ICdhcHBsaWNhdGlvbi9qc29uJyApXG4gICAgICAgICAgICByZXEuc2V0UmVxdWVzdEhlYWRlciggXCJDb250ZW50LVR5cGVcIiwgaGVhZGVycy5jb250ZW50VHlwZSB8fCAndGV4dC9wbGFpbicgKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9mYWN0b3J5KCBkYXRhICkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZSggdGhpcy5SZXF1ZXN0LCB7IH0gKS5jb25zdHJ1Y3RvciggZGF0YSApXG4gICAgfSxcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgIGlmKCAhWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlLnNlbmRBc0JpbmFyeSApIHtcbiAgICAgICAgICBYTUxIdHRwUmVxdWVzdC5wcm90b3R5cGUuc2VuZEFzQmluYXJ5ID0gZnVuY3Rpb24oc0RhdGEpIHtcbiAgICAgICAgICAgIHZhciBuQnl0ZXMgPSBzRGF0YS5sZW5ndGgsIHVpOERhdGEgPSBuZXcgVWludDhBcnJheShuQnl0ZXMpO1xuICAgICAgICAgICAgZm9yICh2YXIgbklkeCA9IDA7IG5JZHggPCBuQnl0ZXM7IG5JZHgrKykge1xuICAgICAgICAgICAgICB1aThEYXRhW25JZHhdID0gc0RhdGEuY2hhckNvZGVBdChuSWR4KSAmIDB4ZmY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNlbmQodWk4RGF0YSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9mYWN0b3J5LmJpbmQodGhpcylcbiAgICB9XG5cbn0gKSwgeyB9ICkuY29uc3RydWN0b3IoKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCB7XG5cbiAgICBjcmVhdGUoIG5hbWUsIG9wdHMgKSB7XG4gICAgICAgIGNvbnN0IGxvd2VyID0gbmFtZVxuICAgICAgICBuYW1lID0gbmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG5hbWUuc2xpY2UoMSlcbiAgICAgICAgcmV0dXJuIE9iamVjdC5jcmVhdGUoXG4gICAgICAgICAgICB0aGlzLlZpZXdzWyBuYW1lIF0sXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKCB7XG4gICAgICAgICAgICAgICAgVG9hc3Q6IHsgdmFsdWU6IHRoaXMuVG9hc3QgfSxcbiAgICAgICAgICAgICAgICBuYW1lOiB7IHZhbHVlOiBuYW1lIH0sXG4gICAgICAgICAgICAgICAgZmFjdG9yeTogeyB2YWx1ZTogdGhpcyB9LFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiB7IHZhbHVlOiB0aGlzLlRlbXBsYXRlc1sgbmFtZSBdIH0sXG4gICAgICAgICAgICB9LCBvcHRzIClcbiAgICAgICAgKS5jb25zdHJ1Y3RvcigpXG4gICAgfSxcblxufSwge1xuICAgIFRlbXBsYXRlczogeyB2YWx1ZTogcmVxdWlyZSgnLi4vLlRlbXBsYXRlTWFwJykgfSxcbiAgICBUb2FzdDogeyB2YWx1ZTogcmVxdWlyZSgnLi4vdmlld3MvVG9hc3QnKSB9LFxuICAgIFZpZXdzOiB7IHZhbHVlOiByZXF1aXJlKCcuLi8uVmlld01hcCcpIH1cbn0gKVxuIiwiXG5jb25zdCByb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcicpLFxuICAgIG9uTG9hZCA9IG5ldyBQcm9taXNlKCByZXNvbHZlID0+IHdpbmRvdy5vbmxvYWQgPSAoKSA9PiByZXNvbHZlKCkgKVxuXG5yZXF1aXJlKCcuL3BvbHlmaWxsJylcblxub25Mb2FkLnRoZW4oICgpID0+IHJvdXRlci5pbml0aWFsaXplKCkgKVxuLmNhdGNoKCBlID0+IGNvbnNvbGUubG9nKCBgRXJyb3IgaW5pdGlhbGl6aW5nIGNsaWVudCAtPiAke2Uuc3RhY2sgfHwgZX1gICkgKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi9fX3Byb3RvX18uanMnKSwge1xuXG4gICAgZGF0YTogeyB9XG5cbn0gKSwgeyByZXNvdXJjZTogeyB2YWx1ZTogJ3BlcnNvbicgfSB9ICkiLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHsgfSwgcmVxdWlyZSgnLi4vLi4vLi4vbGliL015T2JqZWN0JyksIHJlcXVpcmUoJy4uLy4uLy4uL2xpYi9Nb2RlbCcpLCByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXIucHJvdG90eXBlLCB7XG5cbiAgICBYaHI6IHJlcXVpcmUoJy4uL1hocicpLFxuXG4gICAgZGVsZXRlKCBpZCApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuWGhyKCB7IG1ldGhvZDogJ0RFTEVURScsIHJlc291cmNlOiB0aGlzLnJlc291cmNlLCBpZCB9IClcbiAgICAgICAgLnRoZW4oIGlkID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRhdHVtID0gdGhpcy5kYXRhLmZpbmQoIGRhdHVtID0+IGRhdHVtLmlkID09IGlkIClcblxuICAgICAgICAgICAgaWYoIHRoaXMuc3RvcmUgKSB7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoIHRoaXMuc3RvcmUgKS5mb3JFYWNoKCBhdHRyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdG9yZVsgYXR0ciBdWyBkYXR1bVsgYXR0ciBdIF0gPSB0aGlzLnN0b3JlWyBhdHRyIF1bIGRhdHVtWyBhdHRyIF0gXS5maWx0ZXIoIGRhdHVtID0+IGRhdHVtLmlkICE9IGlkIClcbiAgICAgICAgICAgICAgICAgICAgaWYoIHRoaXMuc3RvcmVbIGF0dHIgXVsgZGF0dW1bIGF0dHIgXSBdLmxlbmd0aCA9PT0gMCApIHsgdGhpcy5zdG9yZVsgYXR0ciBdWyBkYXR1bVsgYXR0ciBdIF0gPSB1bmRlZmluZWQgfVxuICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLmRhdGEuZmlsdGVyKCBkYXR1bSA9PiBkYXR1bS5pZCAhPSBpZCApXG4gICAgICAgICAgICBpZiggdGhpcy5pZHMgKSBkZWxldGUgdGhpcy5pZHNbaWRdXG5cbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoaWQpXG4gICAgICAgIH0gKVxuICAgIH0sXG5cbiAgICBnZXQoIG9wdHM9eyBxdWVyeTp7fSB9ICkge1xuICAgICAgICBpZiggb3B0cy5xdWVyeSB8fCB0aGlzLnBhZ2luYXRpb24gKSBPYmplY3QuYXNzaWduKCBvcHRzLnF1ZXJ5LCB0aGlzLnBhZ2luYXRpb24gKVxuXG4gICAgICAgIHJldHVybiB0aGlzLlhociggeyBtZXRob2Q6IG9wdHMubWV0aG9kIHx8ICdnZXQnLCByZXNvdXJjZTogdGhpcy5yZXNvdXJjZSwgaGVhZGVyczogdGhpcy5oZWFkZXJzIHx8IHt9LCBxczogb3B0cy5xdWVyeSA/IEpTT04uc3RyaW5naWZ5KCBvcHRzLnF1ZXJ5ICkgOiB1bmRlZmluZWQgfSApXG4gICAgICAgIC50aGVuKCByZXNwb25zZSA9PiB7XG5cbiAgICAgICAgICAgIGlmKCBvcHRzLnN0b3JlQnkgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9yZSA9IHsgfVxuICAgICAgICAgICAgICAgIG9wdHMuc3RvcmVCeS5mb3JFYWNoKCBhdHRyID0+IHRoaXMuc3RvcmVbIGF0dHIgXSA9IHsgfSApXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IHRoaXMucGFyc2VcbiAgICAgICAgICAgICAgICA/IHRoaXMucGFyc2UoIHJlc3BvbnNlLCBvcHRzLnN0b3JlQnkgKVxuICAgICAgICAgICAgICAgIDogb3B0cy5zdG9yZUJ5XG4gICAgICAgICAgICAgICAgICAgID8gdGhpcy5zdG9yZUJ5KCByZXNwb25zZSApXG4gICAgICAgICAgICAgICAgICAgIDogcmVzcG9uc2VcblxuICAgICAgICAgICAgdGhpcy5lbWl0KCdnb3QnKVxuXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuZGF0YSlcbiAgICAgICAgfSApXG4gICAgfSxcblxuICAgIHBhdGNoKCBpZCwgZGF0YSApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuWGhyKCB7IG1ldGhvZDogJ3BhdGNoJywgaWQsIHJlc291cmNlOiB0aGlzLnJlc291cmNlLCBoZWFkZXJzOiB0aGlzLmhlYWRlcnMgfHwge30sIGRhdGE6IEpTT04uc3RyaW5naWZ5KCBkYXRhICkgfSApXG4gICAgICAgIC50aGVuKCByZXNwb25zZSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLmRhdGEgPyB0aGlzLmRhdGEuY29uY2F0KCByZXNwb25zZSApIDogWyByZXNwb25zZSBdXG5cbiAgICAgICAgICAgIGlmKCB0aGlzLnN0b3JlICkgT2JqZWN0LmtleXMoIHRoaXMuc3RvcmUgKS5mb3JFYWNoKCBhdHRyID0+IHRoaXMuX3N0b3JlKCByZXNwb25zZSwgYXR0ciApIClcblxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSggcmVzcG9uc2UgKVxuICAgICAgICB9IClcbiAgICB9LFxuXG4gICAgcG9zdCggbW9kZWwgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLlhociggeyBtZXRob2Q6ICdwb3N0JywgcmVzb3VyY2U6IHRoaXMucmVzb3VyY2UsIGhlYWRlcnM6IHRoaXMuaGVhZGVycyB8fCB7fSwgZGF0YTogSlNPTi5zdHJpbmdpZnkoIG1vZGVsICkgfSApXG4gICAgICAgIC50aGVuKCByZXNwb25zZSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLmRhdGEgPyB0aGlzLmRhdGEuY29uY2F0KCByZXNwb25zZSApIDogWyByZXNwb25zZSBdXG5cbiAgICAgICAgICAgIGlmKCB0aGlzLnN0b3JlICkgT2JqZWN0LmtleXMoIHRoaXMuc3RvcmUgKS5mb3JFYWNoKCBhdHRyID0+IHRoaXMuX3N0b3JlKCByZXNwb25zZSwgYXR0ciApIClcblxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSggcmVzcG9uc2UgKVxuICAgICAgICB9IClcbiAgICB9LFxuXG4gICAgLypcbiAgICBzdG9yZUJ5KCBkYXRhICkge1xuXG4gICAgICAgIGRhdGEuZm9yRWFjaCggZGF0dW0gPT4gT2JqZWN0LmtleXMoIHRoaXMuc3RvcmUgKS5mb3JFYWNoKCBhdHRyID0+IHRoaXMuX3N0b3JlKCBkYXR1bSwgYXR0ciApICkgKVxuXG4gICAgICAgIHJldHVybiBkYXRhXG4gICAgfSxcblxuICAgIF9zdG9yZSggZGF0dW0sIGF0dHIgKSB7XG4gICAgICAgIGlmKCAhdGhpcy5zdG9yZVsgYXR0ciBdWyBkYXR1bVsgYXR0ciBdIF0gKSB0aGlzLnN0b3JlWyBhdHRyIF1bIGRhdHVtWyBhdHRyIF0gXSA9IFsgXVxuICAgICAgICB0aGlzLnN0b3JlWyBhdHRyIF1bIGRhdHVtWyBhdHRyIF0gXS5wdXNoKCBkYXR1bSApXG4gICAgfVxuICAgICovXG5cbn0gKVxuIiwiLy9odHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRWxlbWVudC9jbG9zZXN0XG5pZiAod2luZG93LkVsZW1lbnQgJiYgIUVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QpIHtcbiAgICBFbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0ID0gXG4gICAgZnVuY3Rpb24ocykge1xuICAgICAgICB2YXIgbWF0Y2hlcyA9ICh0aGlzLmRvY3VtZW50IHx8IHRoaXMub3duZXJEb2N1bWVudCkucXVlcnlTZWxlY3RvckFsbChzKSxcbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICBlbCA9IHRoaXM7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGkgPSBtYXRjaGVzLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlICgtLWkgPj0gMCAmJiBtYXRjaGVzLml0ZW0oaSkgIT09IGVsKSB7fTtcbiAgICAgICAgfSB3aGlsZSAoKGkgPCAwKSAmJiAoZWwgPSBlbC5wYXJlbnRFbGVtZW50KSk7IFxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfTtcbn1cblxuLy9odHRwczovL2dpc3QuZ2l0aHViLmNvbS9wYXVsaXJpc2gvMTU3OTY3MVxuY29uc3QgcmVxdWVzdEFuaW1hdGlvbkZyYW1lUG9seWZpbGwgPSAoKCkgPT4ge1xuICAgIGxldCBjbG9jayA9IERhdGUubm93KCk7XG5cbiAgICByZXR1cm4gKGNhbGxiYWNrKSA9PiB7XG5cbiAgICAgICAgY29uc3QgY3VycmVudFRpbWUgPSBEYXRlLm5vdygpO1xuXG4gICAgICAgIGlmIChjdXJyZW50VGltZSAtIGNsb2NrID4gMTYpIHtcbiAgICAgICAgICAgIGNsb2NrID0gY3VycmVudFRpbWU7XG4gICAgICAgICAgICBjYWxsYmFjayhjdXJyZW50VGltZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBwb2x5ZmlsbChjYWxsYmFjayk7XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfVxuICAgIH07XG59KSgpO1xuXG53aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgICB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lUG9seWZpbGxcblxucmVxdWlyZSgnc21vb3Roc2Nyb2xsLXBvbHlmaWxsJykucG9seWZpbGwoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRydWVcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSgge1xuXG4gICAgRXJyb3I6IHJlcXVpcmUoJy4uLy4uL2xpYi9NeUVycm9yJyksXG4gICAgXG4gICAgVmlld0ZhY3Rvcnk6IHJlcXVpcmUoJy4vZmFjdG9yeS9WaWV3JyksXG4gICAgXG4gICAgVmlld3M6IHJlcXVpcmUoJy4vLlZpZXdNYXAnKSxcblxuICAgIFRvYXN0OiByZXF1aXJlKCcuL3ZpZXdzL1RvYXN0JyksXG5cbiAgICBjYXBpdGFsaXplRmlyc3RMZXR0ZXI6IHN0cmluZyA9PiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSksXG5cbiAgICBpbml0aWFsaXplKCkge1xuXG4gICAgICAgIHRoaXMuY29udGVudENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjb250ZW50JylcblxuICAgICAgICB0aGlzLlRvYXN0LmNvbnN0cnVjdG9yKClcblxuICAgICAgICB3aW5kb3cub25wb3BzdGF0ZSA9IHRoaXMuaGFuZGxlLmJpbmQodGhpcylcblxuICAgICAgICB0aGlzLmhlYWRlciA9XG4gICAgICAgICAgICB0aGlzLlZpZXdGYWN0b3J5LmNyZWF0ZShcbiAgICAgICAgICAgICAgICAnaGVhZGVyJyxcbiAgICAgICAgICAgICAgICB7IGluc2VydGlvbjogeyB2YWx1ZTogeyBlbDogdGhpcy5jb250ZW50Q29udGFpbmVyLCBtZXRob2Q6ICdpbnNlcnRCZWZvcmUnIH0gfSB9XG4gICAgICAgICAgICApXG4gICAgICAgICAgICAub24oICduYXZpZ2F0ZScsIHJvdXRlID0+IHRoaXMubmF2aWdhdGUoIHJvdXRlICkgKVxuXG4gICAgICAgIHRoaXMuZm9vdGVyID1cbiAgICAgICAgICAgIHRoaXMuVmlld0ZhY3RvcnkuY3JlYXRlKFxuICAgICAgICAgICAgICAgICdmb290ZXInLFxuICAgICAgICAgICAgICAgIHsgaW5zZXJ0aW9uOiB7IHZhbHVlOiB7IGVsOiB0aGlzLmNvbnRlbnRDb250YWluZXIsIG1ldGhvZDogJ2FmdGVyJyB9IH0gfVxuICAgICAgICAgICAgKVxuXG4gICAgICAgIHRoaXMuaGFuZGxlKClcbiAgICB9LFxuXG4gICAgaGFuZGxlKCkge1xuICAgICAgICB0aGlzLmhhbmRsZXIoIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpLnNsaWNlKDEpIClcbiAgICB9LFxuXG4gICAgaGFuZGxlciggcGF0aCApIHtcbiAgICAgICAgY29uc3QgdmlldyA9IHRoaXMuVmlld3NbIHRoaXMuY2FwaXRhbGl6ZUZpcnN0TGV0dGVyKCBwYXRoWzBdICkgXSA/IHBhdGhbMF0gOiAnaG9tZSdcblxuICAgICAgICBpZiggdmlldyA9PT0gdGhpcy5jdXJyZW50VmlldyApIHJldHVybiB0aGlzLnZpZXdzWyB2aWV3IF0ub25OYXZpZ2F0aW9uKCBwYXRoIClcblxuICAgICAgICB0aGlzLnNjcm9sbFRvVG9wKClcblxuICAgICAgICBQcm9taXNlLmFsbCggT2JqZWN0LmtleXMoIHRoaXMudmlld3MgKS5tYXAoIHZpZXcgPT4gdGhpcy52aWV3c1sgdmlldyBdLmhpZGUoKSApIClcbiAgICAgICAgLnRoZW4oICgpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5jdXJyZW50VmlldyA9IHZpZXdcblxuICAgICAgICAgICAgaWYoIHRoaXMudmlld3NbIHZpZXcgXSApIHJldHVybiB0aGlzLnZpZXdzWyB2aWV3IF0ub25OYXZpZ2F0aW9uKCBwYXRoIClcblxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdzWyB2aWV3IF0gPVxuICAgICAgICAgICAgICAgICAgICB0aGlzLlZpZXdGYWN0b3J5LmNyZWF0ZSggdmlldywge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0aW9uOiB7IHZhbHVlOiB7IGVsOiB0aGlzLmNvbnRlbnRDb250YWluZXIgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogeyB2YWx1ZTogcGF0aCwgd3JpdGFibGU6IHRydWUgfVxuICAgICAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgICAgICAgICAgLm9uKCAnbmF2aWdhdGUnLCByb3V0ZSA9PiB0aGlzLm5hdmlnYXRlKCByb3V0ZSApIClcbiAgICAgICAgICAgICAgICAgICAgLm9uKCAnZGVsZXRlZCcsICgpID0+IGRlbGV0ZSB0aGlzLnZpZXdzWyB2aWV3IF0gKVxuICAgICAgICAgICAgKVxuICAgICAgICB9IClcbiAgICAgICAgLmNhdGNoKCB0aGlzLkVycm9yIClcbiAgICB9LFxuXG4gICAgbmF2aWdhdGUoIGxvY2F0aW9uICkge1xuICAgICAgICBpZiggbG9jYXRpb24gIT09IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSApIGhpc3RvcnkucHVzaFN0YXRlKCB7fSwgJycsIGxvY2F0aW9uIClcbiAgICAgICAgdGhpcy5oYW5kbGUoKVxuICAgIH0sXG5cbiAgICBzY3JvbGxUb1RvcCgpIHtcbiAgICAgICAgd2luZG93LnNjcm9sbCggeyB0b3A6IDAsIGxlZnQ6IDAsIGJlaGF2aW9yOiAnc21vb3RoJyB9IClcbiAgICB9LFxuXG59LCB7IGN1cnJlbnRWaWV3OiB7IHZhbHVlOiAnJywgd3JpdGFibGU6IHRydWUgfSwgdmlld3M6IHsgdmFsdWU6IHsgfSB9IH0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi9fX3Byb3RvX18nKSwge1xuICAgIFxufSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG5cbiAgICBldmVudHM6IHtcbiAgICAgICAgbmF2OiAnY2xpY2snXG4gICAgfSxcblxuICAgIG9uTmF2Q2xpY2soIGUgKSB7XG4gICAgICAgIGNvbnN0IGl0ZW1FbCA9IGUudGFyZ2V0LnRhZ05hbWUgPT09IFwiTElcIiA/IGUudGFyZ2V0IDogZS50YXJnZXQuY2xvc2VzdCgnbGknKSxcbiAgICAgICAgICAgICAgbmFtZSA9IGl0ZW1FbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbmFtZScpXG5cbiAgICAgICAgdGhpcy5lbWl0KCAnbmF2aWdhdGUnLCBuYW1lIClcbiAgICB9XG5cbn0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi9fX3Byb3RvX18nKSwge1xuXG4gICAgZXZlbnRzOiB7XG4gICAgICAgIHNlcnZpY2VzOiAnY2xpY2snLFxuICAgICAgICBpbnRlcm5ldDogJ2NsaWNrJ1xuICAgIH0sXG5cbiAgICBvbkludGVybmV0Q2xpY2soKSB7IHRoaXMuZW1pdCggJ25hdmlnYXRlJywgJ2ludGVybmV0JyApIH0sXG5cbiAgICBvblNlcnZpY2VzQ2xpY2soKSB7IHRoaXMuZW1pdCggJ25hdmlnYXRlJywgJ3NlcnZpY2VzJyApIH1cbiAgICBcbn0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi9fX3Byb3RvX18nKSwge1xuXG4gICAgZXZlbnRzOiB7XG4gICAgICAgICdzdWJtaXRCdG4nOiAnY2xpY2snXG4gICAgfSxcblxuICAgIG1vZGVsOiByZXF1aXJlKCcuLi9tb2RlbHMvUGVyc29uJyksXG5cbiAgICBvblN1Ym1pdEJ0bkNsaWNrKCkge1xuICAgICAgICBpZiggdGhpcy5zdWJtaXR0aW5nICkgcmV0dXJuXG5cbiAgICAgICAgdGhpcy5zdWJtaXR0aW5nID0gdHJ1ZVxuXG4gICAgICAgIHJldHVybiB0aGlzLmdldEZvcm1EYXRhKClcbiAgICAgICAgLnRoZW4oICgpID0+IHRoaXMuc3VibWl0KCkgKVxuICAgICAgICAudGhlbiggKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pc1N1Ym1pdHRpbmcgPSBmYWxzZVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuVG9hc3Quc2hvd01lc3NhZ2UoICdzdWNjZXNzJywgXCJJbmZvIHNlbnQhIFdlJ2xsIGtlZXAgeW91IHBvc3RlZCFcIiApXG4gICAgICAgICAgICAudGhlbiggKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pdCggJ25hdmlnYXRlJywgJy8nIClcbiAgICAgICAgICAgICAgICB0aGlzLmVscy5uYW1lLnZhbHVlID0gJydcbiAgICAgICAgICAgICAgICB0aGlzLmVscy5jb250YWN0LnZhbHVlID0gJydcbiAgICAgICAgICAgICAgICB0aGlzLmVscy5hZGRyZXNzLnZhbHVlID0gJydcbiAgICAgICAgICAgIH0gKVxuICAgICAgICB9IClcbiAgICAgICAgLmNhdGNoKCBlID0+IHsgdGhpcy5FcnJvcihlKTsgdGhpcy5zdWJtaXR0aW5nID0gZmFsc2UgfSApXG4gICAgfSxcblxuICAgIGdldEZvcm1EYXRhKCkge1xuICAgICAgICBPYmplY3Qua2V5cyggdGhpcy5lbHMgKS5mb3JFYWNoKCBhdHRyID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVsID0gdGhpcy5lbHNbIGF0dHIgXVxuXG4gICAgICAgICAgICBpZiggZWwudGFnTmFtZSAhPT0gXCJJTlBVVFwiICkgcmV0dXJuXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmRhdGFbIGF0dHIgXSA9IGVsLnZhbHVlXG4gICAgICAgIH0gKVxuXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgIH0sXG5cbiAgICBzdWJtaXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vZGVsLnBvc3QoIHRoaXMubW9kZWwuZGF0YSApXG4gICAgICAgIC5jYXRjaCggZSA9PiB7IHRoaXMuVG9hc3Quc2hvd01lc3NhZ2UoICdlcnJvcicsIGUubWVzc2FnZSApOyB0aGlzLnN1Ym1pdHRpbmcgPSBmYWxzZSB9IClcbiAgICB9XG5cbn0gKSIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbigge30sIHJlcXVpcmUoJy4vX19wcm90b19fJyksIHtcblxufSApIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi9fX3Byb3RvX18nKSwge1xuXG4gICAgSWNvbnM6IHtcbiAgICAgICAgZXJyb3I6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2xpYi9lcnJvcicpKCksXG4gICAgICAgIHN1Y2Nlc3M6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2xpYi9jaGVja21hcmsnKSgpXG4gICAgfSxcblxuICAgIG5hbWU6ICdUb2FzdCcsXG5cbiAgICBwb3N0UmVuZGVyKCkge1xuXG4gICAgICAgIHRoaXMub24oICdzaG93bicsICgpID0+IHRoaXMuc3RhdHVzID0gJ3Nob3duJyApXG4gICAgICAgIHRoaXMub24oICdoaWRkZW4nLCAoKSA9PiB0aGlzLnN0YXR1cyA9ICdoaWRkZW4nIClcblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICByZXF1aXJlc0xvZ2luOiBmYWxzZSxcblxuICAgIHNob3dNZXNzYWdlKCB0eXBlLCBtZXNzYWdlICkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgID0+IHtcbiAgICAgICAgICAgIGlmKCAvc2hvdy8udGVzdCggdGhpcy5zdGF0dXMgKSApIHRoaXMudGVhcmRvd24oKVxuXG4gICAgICAgICAgICB0aGlzLnJlc29sdXRpb24gPSByZXNvbHZlXG5cbiAgICAgICAgICAgIGlmKCB0eXBlICE9PSAnZXJyb3InICkgdGhpcy5lbHMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ3N1Y2Nlc3MnKVxuXG4gICAgICAgICAgICB0aGlzLmVscy5tZXNzYWdlLnRleHRDb250ZW50ID0gbWVzc2FnZVxuICAgICAgICAgICAgdGhpcy5lbHMudGl0bGUudGV4dENvbnRlbnQgPSB0eXBlID09PSAnZXJyb3InID8gJ0Vycm9yJyA6ICdTdWNjZXNzJ1xuICAgICAgICAgICAgdGhpcy5zbHVycFRlbXBsYXRlKCB7IGluc2VydGlvbjogeyBlbDogdGhpcy5lbHMuaWNvbiB9LCB0ZW1wbGF0ZTogdHlwZSA9PT0gJ2Vycm9yJyA/IHRoaXMuSWNvbnMuZXJyb3IgOiB0aGlzLkljb25zLnN1Y2Nlc3MgfSApXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzID0gJ3Nob3dpbmcnXG5cbiAgICAgICAgICAgIHRoaXMuc2hvdygpXG4gICAgICAgICAgICAudGhlbiggKCkgPT4gdGhpcy5oaWRlKCkgKVxuICAgICAgICAgICAgLnRoZW4oICgpID0+IHRoaXMudGVhcmRvd24oKSApXG4gICAgICAgICAgICAuY2F0Y2goIHJlamVjdCApXG4gICAgICAgIH0gKVxuICAgIH0sXG5cbiAgICB0ZWFyZG93bigpIHtcbiAgICAgICAgaWYoIHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QuY29udGFpbnMoJ3N1Y2Nlc3MnKSApIHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdzdWNjZXNzJylcbiAgICAgICAgdGhpcy5lbHMubWVzc2FnZS50ZXh0Q29udGVudCA9ICcnXG4gICAgICAgIHRoaXMuZWxzLm1lc3NhZ2UudGl0bGUgPSAnJ1xuICAgICAgICBpZiggdGhpcy5lbHMuaWNvbi5maXJzdENoaWxkICkgdGhpcy5lbHMuaWNvbi5yZW1vdmVDaGlsZCggdGhpcy5lbHMuaWNvbi5maXJzdENoaWxkIClcbiAgICAgICAgdGhpcy5yZXNvbHV0aW9uKClcbiAgICB9LFxuXG4gICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL1RvYXN0JylcblxufSApLCB7IH0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7IH0sIHJlcXVpcmUoJy4uLy4uLy4uL2xpYi9NeU9iamVjdCcpLCByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXIucHJvdG90eXBlLCB7XG5cbiAgICBNb2RlbDogcmVxdWlyZSgnLi4vbW9kZWxzL19fcHJvdG9fXycpLFxuXG4gICAgT3B0aW1pemVkUmVzaXplOiByZXF1aXJlKCcuL2xpYi9PcHRpbWl6ZWRSZXNpemUnKSxcblxuICAgIGJpbmRFdmVudCgga2V5LCBldmVudCwgZWwgKSB7XG4gICAgICAgIHZhciBlbHMgPSBlbCA/IFsgZWwgXSA6IEFycmF5LmlzQXJyYXkoIHRoaXMuZWxzWyBrZXkgXSApID8gdGhpcy5lbHNbIGtleSBdIDogWyB0aGlzLmVsc1sga2V5IF0gXVxuICAgICAgICBlbHMuZm9yRWFjaCggZWwgPT4gZWwuYWRkRXZlbnRMaXN0ZW5lciggZXZlbnQgfHwgJ2NsaWNrJywgZSA9PiB0aGlzWyBgb24ke3RoaXMuY2FwaXRhbGl6ZUZpcnN0TGV0dGVyKGtleSl9JHt0aGlzLmNhcGl0YWxpemVGaXJzdExldHRlcihldmVudCl9YCBdKCBlICkgKSApXG4gICAgfSxcblxuICAgIGNhcGl0YWxpemVGaXJzdExldHRlcjogc3RyaW5nID0+IHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zbGljZSgxKSxcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnN1YnZpZXdFbGVtZW50cyA9IFsgXVxuXG4gICAgICAgIGlmKCB0aGlzLnJlcXVpcmVzTG9naW4gJiYgKCAhdGhpcy51c2VyLmlzTG9nZ2VkSW4oKSApICkgcmV0dXJuIHRoaXMuaGFuZGxlTG9naW4oKVxuICAgICAgICBpZiggdGhpcy51c2VyICYmICF0aGlzLmlzQWxsb3dlZCggdGhpcy51c2VyICkgKSByZXR1cm4gdGhpcy5zY29vdEF3YXkoKVxuXG4gICAgICAgIHJldHVybiB0aGlzLmluaXRpYWxpemUoKS5yZW5kZXIoKVxuICAgIH0sXG5cbiAgICBkZWxlZ2F0ZUV2ZW50cygga2V5LCBlbCApIHtcbiAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgdGhpcy5ldmVudHNba2V5XVxuXG4gICAgICAgIGlmKCB0eXBlID09PSBcInN0cmluZ1wiICkgeyB0aGlzLmJpbmRFdmVudCgga2V5LCB0aGlzLmV2ZW50c1trZXldLCBlbCApIH1cbiAgICAgICAgZWxzZSBpZiggQXJyYXkuaXNBcnJheSggdGhpcy5ldmVudHNba2V5XSApICkge1xuICAgICAgICAgICAgdGhpcy5ldmVudHNbIGtleSBdLmZvckVhY2goIGV2ZW50T2JqID0+IHRoaXMuYmluZEV2ZW50KCBrZXksIGV2ZW50T2JqICkgKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5iaW5kRXZlbnQoIGtleSwgdGhpcy5ldmVudHNba2V5XS5ldmVudCApXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZGVsZXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oaWRlKClcbiAgICAgICAgLnRoZW4oICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKCB0aGlzLmVscy5jb250YWluZXIgKVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSggdGhpcy5lbWl0KCdkZWxldGVkJykgKVxuICAgICAgICB9IClcbiAgICB9LFxuXG4gICAgZXZlbnRzOiB7fSxcblxuICAgIGdldFRlbXBsYXRlT3B0aW9ucygpIHtcbiAgICAgICAgY29uc3QgcnYgPSBPYmplY3QuYXNzaWduKCB0aGlzLnVzZXIgPyB7IHVzZXI6IHRoaXMudXNlci5kYXRhIH0gOiB7fSApXG5cbiAgICAgICAgaWYoIHRoaXMubW9kZWwgKSB7XG4gICAgICAgICAgICBydi5tb2RlbCA9IHRoaXMubW9kZWwuZGF0YVxuXG4gICAgICAgICAgICBpZiggdGhpcy5tb2RlbC5tZXRhICkgcnYubWV0YSA9IHRoaXMubW9kZWwubWV0YVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBydlxuICAgIH0sXG5cbiAgICBoYW5kbGVMb2dpbigpIHtcbiAgICAgICAgdGhpcy5mYWN0b3J5LmNyZWF0ZSggJ2xvZ2luJywgeyBpbnNlcnRpb246IHsgdmFsdWU6IHsgZWw6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjb250ZW50JykgfSB9IH0gKVxuICAgICAgICAgICAgLm9uY2UoIFwibG9nZ2VkSW5cIiwgKCkgPT4gdGhpcy5vbkxvZ2luKCkgKVxuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIGhpZGUoKSB7XG4gICAgICAgIGlmKCAhZG9jdW1lbnQuYm9keS5jb250YWlucyh0aGlzLmVscy5jb250YWluZXIpIHx8IHRoaXMuaXNIaWRkZW4oKSApIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICB9IGVsc2UgaWYoIHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QuY29udGFpbnMoJ2hpZGUnKSApIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggcmVzb2x2ZSA9PiB0aGlzLm9uY2UoICdoaWRkZW4nLCByZXNvbHZlICkgKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCByZXNvbHZlID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uSGlkZGVuUHJveHkgPSBlID0+IHRoaXMub25IaWRkZW4ocmVzb2x2ZSlcbiAgICAgICAgICAgICAgICB0aGlzLmVscy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lciggJ3RyYW5zaXRpb25lbmQnLCB0aGlzLm9uSGlkZGVuUHJveHkgKVxuICAgICAgICAgICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoaWRlJylcbiAgICAgICAgICAgIH0gKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGh0bWxUb0ZyYWdtZW50KCBzdHIgKSB7XG4gICAgICAgIGxldCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgIC8vIG1ha2UgdGhlIHBhcmVudCBvZiB0aGUgZmlyc3QgZGl2IGluIHRoZSBkb2N1bWVudCBiZWNvbWVzIHRoZSBjb250ZXh0IG5vZGVcbiAgICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZShkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImRpdlwiKS5pdGVtKDApKVxuICAgICAgICByZXR1cm4gcmFuZ2UuY3JlYXRlQ29udGV4dHVhbEZyYWdtZW50KCBzdHIgKVxuICAgIH0sXG5cbiAgICBpbml0aWFsaXplKCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbiggdGhpcywgeyBlbHM6IHsgfSwgc2x1cnA6IHsgYXR0cjogJ2RhdGEtanMnLCB2aWV3OiAnZGF0YS12aWV3JywgbmFtZTogJ2RhdGEtbmFtZScgfSwgdmlld3M6IHsgfSB9IClcbiAgICB9LFxuXG4gICAgaXNBbGxvd2VkKCB1c2VyICkge1xuICAgICAgICBpZiggIXRoaXMucmVxdWlyZXNSb2xlICkgcmV0dXJuIHRydWVcbiAgICAgICAgcmV0dXJuIHRoaXMucmVxdWlyZXNSb2xlICYmIHVzZXIuZGF0YS5yb2xlcy5pbmNsdWRlcyggdGhpcy5yZXF1aXJlc1JvbGUgKVxuICAgIH0sXG4gICAgXG4gICAgaXNIaWRkZW4oKSB7IHJldHVybiB0aGlzLmVscy5jb250YWluZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdoaWRkZW4nKSB9LFxuXG4gICAgb25IaWRkZW4oIHJlc29sdmUgKSB7XG4gICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5yZW1vdmVFdmVudExpc3RlbmVyKCAndHJhbnNpdGlvbmVuZCcsIHRoaXMub25IaWRkZW5Qcm94eSApXG4gICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxuICAgICAgICByZXNvbHZlKCB0aGlzLmVtaXQoJ2hpZGRlbicpIClcbiAgICB9LFxuXG4gICAgb25Mb2dpbigpIHtcblxuICAgICAgICBpZiggIXRoaXMuaXNBbGxvd2VkKCB0aGlzLnVzZXIgKSApIHJldHVybiB0aGlzLnNjb290QXdheSgpXG5cbiAgICAgICAgdGhpcy5pbml0aWFsaXplKCkucmVuZGVyKClcbiAgICB9LFxuXG4gICAgb25OYXZpZ2F0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaG93KClcbiAgICB9LFxuXG4gICAgb25TaG93biggcmVzb2x2ZSApIHtcbiAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0cmFuc2l0aW9uZW5kJywgdGhpcy5vblNob3duUHJveHkgKVxuICAgICAgICBpZiggdGhpcy5zaXplICkgdGhpcy5zaXplKClcbiAgICAgICAgdGhpcy5lbWl0KCdzaG93bicpXG4gICAgICAgIHJlc29sdmUoIHRoaXMuc2hvd2luZyA9IGZhbHNlIClcbiAgICB9LFxuXG4gICAgc2hvd05vQWNjZXNzKCkge1xuICAgICAgICBhbGVydChcIk5vIHByaXZpbGVnZXMsIHNvblwiKVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICBwb3N0UmVuZGVyKCkgeyByZXR1cm4gdGhpcyB9LFxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiggdGhpcy5kYXRhICkgdGhpcy5tb2RlbCA9IE9iamVjdC5jcmVhdGUoIHRoaXMuTW9kZWwsIHsgfSApLmNvbnN0cnVjdG9yKCB0aGlzLmRhdGEgKVxuXG4gICAgICAgIHRoaXMuc2x1cnBUZW1wbGF0ZSggeyB0ZW1wbGF0ZTogdGhpcy50ZW1wbGF0ZSggdGhpcy5nZXRUZW1wbGF0ZU9wdGlvbnMoKSApLCBpbnNlcnRpb246IHRoaXMuaW5zZXJ0aW9uIHx8IHsgZWw6IGRvY3VtZW50LmJvZHkgfSwgaXNWaWV3OiB0cnVlIH0gKVxuXG4gICAgICAgIHRoaXMucmVuZGVyU3Vidmlld3MoKVxuXG4gICAgICAgIGlmKCB0aGlzLnNpemUgKSB7IHRoaXMuc2l6ZSgpOyB0aGlzLk9wdGltaXplZFJlc2l6ZS5hZGQoIHRoaXMuc2l6ZS5iaW5kKHRoaXMpICkgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLnBvc3RSZW5kZXIoKVxuICAgIH0sXG5cbiAgICByZW5kZXJTdWJ2aWV3cygpIHtcbiAgICAgICAgdGhpcy5zdWJ2aWV3RWxlbWVudHMuZm9yRWFjaCggb2JqID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBvYmoubmFtZVxuXG4gICAgICAgICAgICBsZXQgb3B0cyA9IHsgfVxuXG4gICAgICAgICAgICBpZiggdGhpcy5WaWV3cyAmJiB0aGlzLlZpZXdzWyBuYW1lIF0gKSBvcHRzID0gdHlwZW9mIHRoaXMuVmlld3NbIG5hbWUgXSA9PT0gXCJvYmplY3RcIiA/IHRoaXMuVmlld3NbIG5hbWUgXSA6IFJlZmxlY3QuYXBwbHkoIHRoaXMuVmlld3NbIG5hbWUgXSwgdGhpcywgWyBdIClcblxuICAgICAgICAgICAgdGhpcy52aWV3c1sgbmFtZSBdID0gdGhpcy5mYWN0b3J5LmNyZWF0ZSgga2V5LCBPYmplY3QuYXNzaWduKCB7IGluc2VydGlvbjogeyB2YWx1ZTogeyBlbDogb2JqLmVsLCBtZXRob2Q6ICdpbnNlcnRCZWZvcmUnIH0gfSB9LCB7IG9wdHM6IHsgdmFsdWU6IG9wdHMgfSB9ICkgKVxuICAgICAgICAgICAgb2JqLmVsLnJlbW92ZSgpXG4gICAgICAgIH0gKVxuXG4gICAgICAgIGRlbGV0ZSB0aGlzLnN1YnZpZXdFbGVtZW50c1xuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIHNjb290QXdheSgpIHtcbiAgICAgICAgdGhpcy5Ub2FzdC5zaG93KCAnZXJyb3InLCAnWW91IGFyZSBub3QgYWxsb3dlZCBoZXJlLiAgU29ycnkuJylcbiAgICAgICAgLmNhdGNoKCBlID0+IHsgdGhpcy5FcnJvciggZSApOyB0aGlzLmVtaXQoICduYXZpZ2F0ZScsIGAvYCApIH0gKVxuICAgICAgICAudGhlbiggKCkgPT4gdGhpcy5lbWl0KCAnbmF2aWdhdGUnLCBgL2AgKSApXG5cbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgc2V0dXBTaG93KCByZXNvbHZlICkge1xuICAgICAgICB0aGlzLm9uU2hvd25Qcm94eSA9IGUgPT4gdGhpcy5vblNob3duKHJlc29sdmUpXG4gICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCAndHJhbnNpdGlvbmVuZCcsIHRoaXMub25TaG93blByb3h5IClcbiAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoICdoaWRlJyApXG4gICAgfSxcblxuICAgIHNob3coKSB7XG4gICAgICAgIGlmKCB0aGlzLnNob3dpbmcgKSByZXR1cm4gbmV3IFByb21pc2UoIHJlc29sdmUgPT4gdGhpcy5vbmNlKCAnc2hvd24nLCByZXNvbHZlICkgKVxuXG4gICAgICAgIGNvbnN0IGNsYXNzTGlzdCA9IHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QsXG4gICAgICAgICAgICAgIGlzSGlkZGVuID0gY2xhc3NMaXN0LmNvbnRhaW5zKCdoaWRkZW4nKSxcbiAgICAgICAgICAgICAgaXNIaWRpbmcgPSBjbGFzc0xpc3QuY29udGFpbnMoJ2hpZGUnKVxuXG4gICAgICAgIGNvbnN0IHJlc29sdXRpb24gPSAoICFpc0hpZGRlbiAmJiAhaXNIaWRpbmcgKVxuICAgICAgICAgICAgPyByZXNvbHZlID0+IHJlc29sdmUoKVxuICAgICAgICAgICAgOiBpc0hpZGRlblxuICAgICAgICAgICAgICAgID8gcmVzb2x2ZSA9PlxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVscy5jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSggJ2hpZGRlbicgKVxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4gdGhpcy5zZXR1cFNob3coIHJlc29sdmUgKSApXG4gICAgICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgIDogaXNIaWRpbmdcbiAgICAgICAgICAgICAgICAgICAgPyByZXNvbHZlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5yZW1vdmVFdmVudExpc3RlbmVyKCAndHJhbnNpdGlvbmVuZCcsIHRoaXMub25IaWRkZW5Qcm94eSApXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiB0aGlzLnNldHVwU2hvdyggcmVzb2x2ZSApIClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICA6IHJlc29sdmUgPT4gcmVzb2x2ZSgpXG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCByZXNvbHV0aW9uIClcbiAgICB9LFxuXG4gICAgc2x1cnBFbCggZWwgKSB7XG4gICAgICAgIHZhciBrZXkgPSBlbC5nZXRBdHRyaWJ1dGUoIHRoaXMuc2x1cnAuYXR0ciApIHx8ICdjb250YWluZXInXG5cbiAgICAgICAgaWYoIGtleSA9PT0gJ2NvbnRhaW5lcicgKSBlbC5jbGFzc0xpc3QuYWRkKCB0aGlzLm5hbWUgKVxuXG4gICAgICAgIHRoaXMuZWxzWyBrZXkgXSA9IEFycmF5LmlzQXJyYXkoIHRoaXMuZWxzWyBrZXkgXSApXG4gICAgICAgICAgICA/IHRoaXMuZWxzWyBrZXkgXS5jb25jYXQoIGVsIClcbiAgICAgICAgICAgIDogKCB0aGlzLmVsc1sga2V5IF0gIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICAgICAgPyBbIHRoaXMuZWxzWyBrZXkgXSwgZWwgXVxuICAgICAgICAgICAgICAgIDogZWxcblxuICAgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5zbHVycC5hdHRyKVxuXG4gICAgICAgIGlmKCB0aGlzLmV2ZW50c1sga2V5IF0gKSB0aGlzLmRlbGVnYXRlRXZlbnRzKCBrZXksIGVsIClcbiAgICB9LFxuXG4gICAgc2x1cnBUZW1wbGF0ZSggb3B0aW9ucyApIHtcbiAgICAgICAgdmFyIGZyYWdtZW50ID0gdGhpcy5odG1sVG9GcmFnbWVudCggb3B0aW9ucy50ZW1wbGF0ZSApLFxuICAgICAgICAgICAgc2VsZWN0b3IgPSBgWyR7dGhpcy5zbHVycC5hdHRyfV1gLFxuICAgICAgICAgICAgdmlld1NlbGVjdG9yID0gYFske3RoaXMuc2x1cnAudmlld31dYCxcbiAgICAgICAgICAgIGZpcnN0RWwgPSBmcmFnbWVudC5xdWVyeVNlbGVjdG9yKCcqJylcblxuICAgICAgICBpZiggb3B0aW9ucy5pc1ZpZXcgfHwgZmlyc3RFbC5nZXRBdHRyaWJ1dGUoIHRoaXMuc2x1cnAuYXR0ciApICkgdGhpcy5zbHVycEVsKCBmaXJzdEVsIClcbiAgICAgICAgZnJhZ21lbnQucXVlcnlTZWxlY3RvckFsbCggYCR7c2VsZWN0b3J9LCAke3ZpZXdTZWxlY3Rvcn1gICkuZm9yRWFjaCggZWwgPT4ge1xuICAgICAgICAgICAgaWYoIGVsLmhhc0F0dHJpYnV0ZSggdGhpcy5zbHVycC5hdHRyICkgKSB7IHRoaXMuc2x1cnBFbCggZWwgKSB9XG4gICAgICAgICAgICBlbHNlIGlmKCBlbC5oYXNBdHRyaWJ1dGUoIHRoaXMuc2x1cnAudmlldyApICkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3Vidmlld0VsZW1lbnRzLnB1c2goIHsgZWwsIHZpZXc6IGVsLmdldEF0dHJpYnV0ZSh0aGlzLnNsdXJwLnZpZXcpLCBuYW1lOiBlbC5nZXRBdHRyaWJ1dGUodGhpcy5zbHVycC5uYW1lKSB9IClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSApXG4gICAgICAgICAgXG4gICAgICAgIG9wdGlvbnMuaW5zZXJ0aW9uLm1ldGhvZCA9PT0gJ2luc2VydEJlZm9yZSdcbiAgICAgICAgICAgID8gb3B0aW9ucy5pbnNlcnRpb24uZWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoIGZyYWdtZW50LCBvcHRpb25zLmluc2VydGlvbi5lbCApXG4gICAgICAgICAgICA6IG9wdGlvbnMuaW5zZXJ0aW9uLmVsWyBvcHRpb25zLmluc2VydGlvbi5tZXRob2QgfHwgJ2FwcGVuZENoaWxkJyBdKCBmcmFnbWVudCApXG5cbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG59IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSgge1xuXG4gICAgYWRkKGNhbGxiYWNrKSB7XG4gICAgICAgIGlmKCAhdGhpcy5jYWxsYmFja3MubGVuZ3RoICkgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMub25SZXNpemUuYmluZCh0aGlzKSApXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spXG4gICAgfSxcblxuICAgIG9uUmVzaXplKCkge1xuICAgICAgIGlmKCB0aGlzLnJ1bm5pbmcgKSByZXR1cm5cblxuICAgICAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlXG4gICAgICAgIFxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgICA/IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIHRoaXMucnVuQ2FsbGJhY2tzLmJpbmQodGhpcykgKVxuICAgICAgICAgICAgOiBzZXRUaW1lb3V0KCB0aGlzLnJ1bkNhbGxiYWNrcywgNjYgKVxuICAgIH0sXG5cbiAgICBydW5DYWxsYmFja3MoKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzID0gdGhpcy5jYWxsYmFja3MuZmlsdGVyKCBjYWxsYmFjayA9PiBjYWxsYmFjaygpIClcbiAgICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2UgXG4gICAgfVxuXG59LCB7IGNhbGxiYWNrczogeyB3cml0YWJsZTogdHJ1ZSwgdmFsdWU6IFtdIH0sIHJ1bm5pbmc6IHsgd3JpdGFibGU6IHRydWUsIHZhbHVlOiBmYWxzZSB9IH0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBwID0+XG5gPGZvb3Rlcj5cbiAgICA8ZGl2IGNsYXNzPVwiY29udGFjdFwiPlxuICAgICAgICA8ZGl2PiZjb3B5OyAyMDE3IHwgQWxsZWdhbiBJbnRlcm5ldCBXaXphcmQ8L2Rpdj5cbiAgICAgICAgPGRpdj4xMjMgQmF5cm9uIExhbmUgfCBBbGxlZ2FuLCBNSSAxMjM0NSB8IDEyMy40NTYuNzg5MDwvZGl2PlxuICAgICAgICA8ZGl2PnRoZV93aXpAYWl3LmNvbTwvZGl2PlxuICAgIDwvZGl2PlxuPC9mb290ZXI+YFxuIiwibW9kdWxlLmV4cG9ydHMgPSAoKSA9PlxuYDxuYXY+XG4gICAgPGRpdiBjbGFzcz1cImNvbnRhY3RcIj5cbiAgICAgICAgPGRpdj5waG9uZTogMTIzLjQ1Ni43ODkwIHwgZW1haWw6IHRoZV93aXpAYWl3LmNvbTwvZGl2PlxuICAgIDwvZGl2PlxuICAgIDx1bCBkYXRhLWpzPVwibmF2XCI+XG4gICAgICAgIDxsaSBkYXRhLW5hbWU9XCJob21lXCI+SG9tZTwvbGk+XG4gICAgICAgIDxsaSBkYXRhLW5hbWU9XCJzZXJ2aWNlc1wiPlNlcnZpY2VzPC9saT5cbiAgICAgICAgPGxpIGRhdGEtbmFtZT1cImludGVybmV0XCI+TG9jYWwgSW50ZXJuZXQhPC9saT5cbiAgICA8L3VsPlxuPC9uYXY+YFxuIiwibW9kdWxlLmV4cG9ydHMgPSAoKSA9PlxuYDxkaXY+XG4gICAgPGRpdj5cbiAgICAgICAgPGltZyBzcmM9XCIvc3RhdGljL2ltZy9sb2dvLnN2Z1wiPlxuICAgIDwvZGl2PlxuICAgIDxkaXY+XG4gICAgICAgIDxoMj5NYWtlIFlvdXIgVGVjaCBQcm9ibGVtcyBNYWdpY2FsbHkgRGlzYXBwZWFyITwvaDI+XG4gICAgICAgIDxwPkNvbXB1dGVycy4gQ2FuJ3QgbGl2ZSB3aXRoICdlbSwgY2FuJ3QgbGl2ZSB3aXRob3V0ICdlbS4gVGhleSdyZSBhIGh1Z2UgcGFydCBvZiBvdXIgbGl2ZXMgdGhlc2UgZGF5cywgYnV0IHVuZm9ydHVuYXRlbHlcbiAgICAgICAgdGhleSBoYXZlbid0IGdvdHRlbiBhbnkgbGVzcyBjb21wbGljYXRlZC4gVGhpbmdzIGNhbiBhbmQgZG8gZ28gd3JvbmcgYWxsIHRoZSB0aW1lLCBhbmQgdGhlbiB5b3UgZW5kIHVwIHNwZW5kaW5nIGhvdXJzXG4gICAgICAgIGFuZCBob3VycyBvZiB5b3VyIHZhbHVhYmxlIHRpbWUgdHJ5aW5nIHRvIGZpZ3VyZSBvdXQgd2hhdCB0aGUgaGVjayBoYXBwZW5lZCBhbmQgZml4IGl0LiBMaWZlJ3MgdG9vIHNob3J0IGZvciBhbGwgdGhhdCBmcnVzdHJhdGlvbi5cbiAgICAgICAgV2h5IG5vdCBoaXJlIGEgcHJvZmVzc2lvbmFsIHRvIHRha2UgY2FyZSBvZiBpdCBxdWlja2x5IGFuZCBwYWlubGVzc2x5PyBHaXZlIFRoZSBXaXphcmQgYSBjYWxsITwvcD5cbiAgICAgICAgPHA+QWxsZWdhbiBJbnRlcm5ldCBXaXphcmQgaXMgaGVyZSB0byBhc3Npc3QgdGhlIGNpdGl6ZW5zIG9mIEFsbGVnYW4gd2l0aCBhbGwgb2YgdGhlaXIgdGVjaCBuZWVkcy4gV2hldGhlciB5b3UgYXJlIGFcbiAgICAgICAgbm9ybWFsIGhvbWUgdXNlciBvciBhIHNtYWxsIGJ1c2luZXNzLCB3ZSB3aWxsIHVzZSBvdXIgMTUrIHllYXJzIG9mIGV4cGVyaWVuY2UgaW4gdGhlIHRlY2ggaW5kdXN0cnkgdG8gc29sdmUgeW91ciBwcm9ibGVtc1xuICAgICAgICB3aXRoIHNwZWVkLCBjb3VydGVzeSwgYW5kIHByb2Zlc3Npb25hbGlzbS4gV2FudCB0byBmaW5kIG91dCBtb3JlPyBDbGljayA8c3BhbiBjbGFzcz1cImxpbmtcIiBkYXRhLWpzPVwic2VydmljZXNcIj5oZXJlPC9zcGFuPlxuICAgICAgICBmb3IgYSBsaXN0IG9mIG91ciBzZXJ2aWNlcy48L3A+XG4gICAgICAgIDxwPjxzcGFuIGNsYXNzPVwibm90aWNlXCI+U3BlY2lhbCBub3RpY2U8L3NwYW4+OiB3ZSBhcmUgY29uc2lkZXJpbmcgZXhwYW5kaW5nIG91ciBidXNpbmVzcyB0byBwcm92aWRlIGludGVybmV0IHNlcnZpY2UgdG8gQWxsZWdhbi5cbiAgICAgICAgQ2xpY2sgPHNwYW4gY2xhc3M9XCJsaW5rXCIgZGF0YS1qcz1cImludGVybmV0XCI+aGVyZTwvc3Bhbj4gdG8gZmluZCBvdXQgbW9yZS48L3A+XG4gICAgPC9kaXY+ICAgICAgICBcbjwvZGl2PmBcbiIsIm1vZHVsZS5leHBvcnRzID0gKCkgPT5cbmA8ZGl2PlxuICAgIDxkaXY+XG4gICAgICAgIDxoMj5Mb2NhbCBJbnRlcm5ldCBTZXJ2aWNlIGZvciBBbGxlZ2FuPC9oMj5cbiAgICAgICAgPHA+Tm90IGhhcHB5IHdpdGggeW91ciBpbnRlcm5ldCBvcHRpb25zIGluIEFsbGVnYW4/IFRpcmVkIG9mIHBheWluZyB0b28gbXVjaCBmb3IgbG91c3kgc3BlZWRzIGFuZCBjb25zdGFudCBzZXJ2aWNlIGludGVycnVwdGlvbnM/XG4gICAgICAgIFdlbGwsIHlvdSdyZSBpbiBsdWNrLCBiZWNhdXNlIEFsbGVnYW4gSW50ZXJuZXQgV2l6YXJkIGlzIGN1cnJlbnRseSBjb25zaWRlcmluZyBsYXVuY2hpbmcgb3VyIG93biBpbnRlcm5ldCBzZXJ2aWNlIGZvclxuICAgICAgICB0aGUgZmluZSBjaXRpemVucyBvZiBBbGxlZ2FuLiBXZSBiZWxpZXZlIHRoZXJlJ3Mgbm90IG5lYXJseSBlbm91Z2ggZnJlZWRvbSBhbmQgY2hvaWNlIHdoZW4gaXQgY29tZXMgdG8gaW50ZXJuZXQgcHJvdmlkZXJzLCBhbmRcbiAgICAgICAgd2UnZCBsaWtlIHRvIHVzZSBvdXIgdGVjaCBza2lsbHMgdG8gY2hhbmdlIHRoYXQgYW5kIG9mZmVyIEFsbGVnYW4gZmFzdCwgcmVsaWFibGUgc2VydmljZSBhdCBhIHJlYXNvbmFibGUgcHJpY2UuXG4gICAgICAgIExldCdzIGdpdmUgdGhvc2UgZmF0IGNhdCB0ZWxlY29tcyBzb21lIHJlYWwgY29tcGV0aXRpb24hPC9wPlxuICAgICAgICA8cD5JZiB0aGlzIHNvdW5kcyBnb29kIHRvIHlvdSwgcGxlYXNlIGxlYXZlIHlvdXIgbmFtZSBhbmQgY29udGFjdCBpbmZvLCBhbmQgd2UnbGwgbGV0IHlvdSBrbm93IGhvdyB0aGluZ3MgYXJlIGRldmVsb3BpbmcuXG4gICAgICAgIFRoYW5rIHlvdSBmb3IgeW91ciBpbnRlcmVzdCE8L3A+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cImJvcmRlclwiPjwvZGl2PlxuICAgIDxmb3JtPlxuICAgICAgICA8aW5wdXQgZGF0YS1qcz1cIm5hbWVcIiB0eXBlPVwidGV4dFwiIGlkPVwibmFtZVwiIHBsYWNlaG9sZGVyPVwiTmFtZVwiPlxuICAgICAgICA8aW5wdXQgZGF0YS1qcz1cImNvbnRhY3RcIiB0eXBlPVwidGV4dFwiIGlkPVwiY29udGFjdFwiIHBsYWNlaG9sZGVyPVwiRW1haWwgb3IgUGhvbmUgTnVtYmVyXCI+XG4gICAgICAgIDxpbnB1dCBkYXRhLWpzPVwiYWRkcmVzc1wiIHR5cGU9XCJ0ZXh0XCIgaWQ9XCJhZGRyZXNzXCIgcGxhY2Vob2xkZXI9XCJBZGRyZXNzXCI+XG4gICAgPC9mb3JtPlxuICAgIDxidXR0b24gZGF0YS1qcz1cInN1Ym1pdEJ0blwiPlN1Ym1pdDwvYnV0dG9uPlxuPC9kaXY+YCIsIm1vZHVsZS5leHBvcnRzID0gKCkgPT5cbmA8ZGl2PlxuICAgIDxoMT5PdXIgU2VydmljZXM8L2gxPlxuICAgIDxkaXYgY2xhc3M9XCJpbnRyb1wiPlxuICAgICAgICA8cD5XYW50IHRvIGltcHJvdmUgeW91ciBob21lIG5ldHdvcms/IFByb3RlY3QgeW91ciBraWRzIGZyb20gaW5hcHByb3ByaWF0ZSBjb250ZW50IG9uIHRoZSB3ZWI/IE5lZWQgaGVscCBleHBsb3JpbmdcbiAgICAgICAgeW91ciBpbnRlcm5ldCBzZXJ2aWNlIG9wdGlvbnM/IENhbid0IGZpZ3VyZSBvdXQgd2h5IGEgd2ViIHBhZ2UgaXNuJ3Qgd29ya2luZz8gTWF5YmUgeW91J3JlIGEgYnVzaW5lc3MgYW5kIGNvdWxkIHVzZVxuICAgICAgICBzb21lIGFzc2lzdGFuY2Ugb24gaG93IHRvIHByZXNlbnQgeW91cnNlbGYgb25saW5lLiBGcm9tIGdlbmVyYWwgdGVjaCBzdXBwb3J0IHRvIGNvbXBsZXgsIHNwZWNpZmljIHByb2JsZW1zLCB3ZSd2ZSBnb3RcbiAgICAgICAgeW91IGNvdmVyZWQhPC9wPlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJib3JkZXJcIj48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwiY2F0ZWdvcmllc1wiPlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgzPkdlbmVyYWwgVGVjaCBTdXBwb3J0PC9oMz5cbiAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICA8bGk+TWFjIGFuZCBQQy4gTGFwdG9wLCBkZXNrdG9wLCBtb2JpbGUsIGFuZCB0YWJsZXQuIFRlbGwgdXMgeW91ciBwcm9ibGVtIGFuZCB3ZSdsbCBmaXggaXQhPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgzPkludGVybmV0IFNlcnZpY2UgQWR2aWNlPC9oMz5cbiAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICA8bGk+V2UnbGwgdGFrZSBhIGxvb2sgYXQgd2hlcmUgeW91IGxpdmUgYW5kIGxldCB5b3Uga25vdyB3aGF0IHlvdXIgYmVzdCBvcHRpb25zIGFyZSBmb3IgY29ubmVjdGluZ1xuICAgICAgICAgICAgICAgIHRvIHRoZSBpbnRlcm5ldDwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxoMz5EYXRhIFJlY292ZXJ5IGFuZCBCYWNrdXBzPC9oMz5cbiAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICA8bGk+SGFyZCBkcml2ZSBjcmFzaD8gV2UnbGwgaGVscCB5b3UgZ2V0IHlvdXIgdmFsdWFibGUgZGF0YSBiYWNrPC9saT5cbiAgICAgICAgICAgICAgICA8bGk+QW5kIHdlJ2xsIGhlbHAgeW91IGJhY2sgeW91ciBkYXRhIHVwIHNvIHRoYXQgaXQncyBzYWZlIGZvciB0aGUgZnV0dXJlPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgzPk5ldHdvcmtzPC9oMz5cbiAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICA8bGk+SW5zdGFsbGF0aW9uIG9mIHdpcmVkIGFuZCB3aXJlbGVzcyBuZXR3b3JrczwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlRyb3VibGVzaG9vdGluZyBmb3IgaW50ZXJuZXQgY29ubmVjdGlvbiBpc3N1ZXM8L2xpPlxuICAgICAgICAgICAgICAgIDxsaT5Db25maWd1cmF0aW9uIG9mIG1vZGVtcyBhbmQgcm91dGVyczwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxoMz5Db21wdXRlciBTZWN1cml0eTwvaDM+XG4gICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgPGxpPktlZXAgeW91ciBraWRzIHNhZmUgZnJvbSBpbmFwcHJvcHJpYXRlIGNvbnRlbnQ8L2xpPlxuICAgICAgICAgICAgICAgIDxsaT5GaW5kIGFuZCBlbGltaW5hdGUgdmlydXNlcywgbWFsd2FyZSwgYW5kIHNweXdhcmU8L2xpPlxuICAgICAgICAgICAgICAgIDxsaT5TZXQgdXAgYW50aXZpcnVzIHNvZnR3YXJlIGFuZCBmaXJld2FsbHMgZm9yIGZ1cnRoZXIgcHJvdGVjdGlvbjwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgzPkhlbHAgZm9yIEJ1c2luZXNzZXM8L2gzPlxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgIDxsaT5NYXJrZXRpbmcgYW5kIGJyYW5kaW5nPC9saT5cbiAgICAgICAgICAgICAgICA8bGk+U2VydmVyIGluc3RhbGxhdGlvbjwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbjwvZGl2PmAiLCJtb2R1bGUuZXhwb3J0cyA9IHAgPT4gYGAgK1xuYDxkaXYgY2xhc3M9XCJjbGVhcmZpeCBoaWRlIGhpZGRlblwiPlxuICAgIDxkaXYgZGF0YS1qcz1cImljb25cIj48L2Rpdj5cbiAgICA8ZGl2PlxuICAgICAgICA8ZGl2IGRhdGEtanM9XCJ0aXRsZVwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGRhdGEtanM9XCJtZXNzYWdlXCI+PC9kaXY+XG4gICAgPC9kaXY+XG48L2Rpdj5gXG4iLCJtb2R1bGUuZXhwb3J0cyA9IChwPXt9KSA9PiBgPHN2ZyB2ZXJzaW9uPVwiMS4xXCIgZGF0YS1qcz1cIiR7cC5uYW1lIHx8ICdjaGVja21hcmsnfVwiIGNsYXNzPVwiY2hlY2ttYXJrXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHg9XCIwcHhcIiB5PVwiMHB4XCJcblx0IHdpZHRoPVwiOTcuNjE5cHhcIiBoZWlnaHQ9XCI5Ny42MThweFwiIHZpZXdCb3g9XCIwIDAgOTcuNjE5IDk3LjYxOFwiIHN0eWxlPVwiZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA5Ny42MTkgOTcuNjE4O1wiXG5cdCB4bWw6c3BhY2U9XCJwcmVzZXJ2ZVwiPlxuPGc+XG5cdDxwYXRoIGQ9XCJNOTYuOTM5LDE3LjM1OEw4My45NjgsNS45NTljLTAuMzk4LTAuMzUyLTAuOTI3LTAuNTMxLTEuNDQ5LTAuNDk0QzgxLjk5LDUuNSw4MS40OTYsNS43NDMsODEuMTQ2LDYuMTQyTDM0LjEsNTkuNjg4XG5cdFx0TDE3LjM3MiwzNy41NDdjLTAuMzE5LTAuNDIyLTAuNzk0LTAuNzAxLTEuMzE5LTAuNzczYy0wLjUyNC0wLjA3OC0xLjA1OSwwLjA2NC0xLjQ4MSwwLjM4NUwwLjc5NCw0Ny41Njdcblx0XHRjLTAuODgxLDAuNjY2LTEuMDU2LDEuOTItMC4zOSwyLjgwMWwzMC45NzQsNDAuOTk2YzAuMzYyLDAuNDc5LDAuOTIyLDAuNzcxLDEuNTIyLDAuNzkzYzAuMDI0LDAsMC4wNDksMCwwLjA3MywwXG5cdFx0YzAuNTc0LDAsMS4xMjItMC4yNDYsMS41MDMtMC42OGw2Mi42NDQtNzEuMjk3Qzk3Ljg1LDE5LjM1MSw5Ny43NjksMTguMDg2LDk2LjkzOSwxNy4zNTh6XCIvPlxuPC9nPjwvc3ZnPmBcbiIsIm1vZHVsZS5leHBvcnRzID0gKHA9e30pID0+IGA8c3ZnIHZlcnNpb249XCIxLjFcIiBkYXRhLWpzPVwiJHtwLm5hbWUgfHwgJ2Vycm9yJ31cIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgeG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIgeD1cIjBweFwiIHk9XCIwcHhcIiB2aWV3Qm94PVwiMCAwIDE4Ljk3OCAxOC45NzhcIiBzdHlsZT1cImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTguOTc4IDE4Ljk3ODtcIiB4bWw6c3BhY2U9XCJwcmVzZXJ2ZVwiPlxyXG48Zz5cclxuICAgIDxwYXRoIGQ9XCJNMTYuMDg4LDEuNjc1Yy0wLjEzMy0wLjEwNC0wLjMwNi0wLjE0NC0wLjQ3LTAuMTA1Yy0wLjAxMywwLjAwMi0xLjI2MSwwLjI5LTIuNTk0LDAuMjlcclxuICAgICAgICBjLTEuNzg4LDAtMi43ODktMC40NzYtMi45NzUtMS40MTVDOS45OTksMC4xOTEsOS43NzksMC4wMDcsOS41MjEsMGMtMC4yNTctMC4wMDctMC40ODcsMC4xNjctMC41NSwwLjQxOFxyXG4gICAgICAgIEM4LjcyNywxLjM4Niw3LjcxLDEuODc3LDUuOTUsMS44NzdjLTEuMzMyLDAtMi41NzEtMC4zMDItMi41ODMtMC4zMDVjLTAuMTY2LTAuMDQtMC4zNC0wLjAwNC0wLjQ3NCwwLjEwMlxyXG4gICAgICAgIEMyLjc2LDEuNzc3LDIuNjgxLDEuOTM4LDIuNjgxLDIuMTA4djQuODY5YzAsMC4wNCwwLjAwNCwwLjA3OCwwLjAxMywwLjExNWMwLjA1NywxLjY0NywwLjY1LDguNzE0LDYuNTI4LDExLjgyMlxyXG4gICAgICAgIGMwLjA4LDAuMDQzLDAuMTY5LDAuMDY0LDAuMjU4LDAuMDY0YzAuMDkyLDAsMC4xODMtMC4wMjEsMC4yNjYtMC4wNjZjNS43NC0zLjEzNyw2LjQ0NS0xMC4xMTUsNi41MzItMTEuNzkxXHJcbiAgICAgICAgYzAuMDEyLTAuMDQ2LDAuMDE5LTAuMDk0LDAuMDE5LTAuMTQ0VjIuMTA4QzE2LjI5NywxLjkzOSwxNi4yMTksMS43OCwxNi4wODgsMS42NzV6IE0xNS4xOSw2Ljg1N1xyXG4gICAgICAgIGMtMC4wMDcsMC4wMzEtMC4wMTIsMC4wNjQtMC4wMTMsMC4wOTdjLTAuMDUzLDEuMjk4LTAuNTc0LDcuODMyLTUuNzAxLDEwLjgzOGMtNS4yMTUtMi45NjUtNS42NDYtOS41MjYtNS42OC0xMC44M1xyXG4gICAgICAgIGMwLTAuMDI5LTAuMDA0LTAuMDU4LTAuMDA5LTAuMDg1VjIuNzg0QzQuMzIyLDIuODc3LDUuMTEyLDIuOTgyLDUuOTUsMi45ODJjMS45MTEsMCwyLjk2NS0wLjU0LDMuNTM3LTEuMjA4XHJcbiAgICAgICAgYzAuNTUzLDAuNjYxLDEuNTk5LDEuMTkxLDMuNTM2LDEuMTkxYzAuODM5LDAsMS42MzEtMC4xMDEsMi4xNjYtMC4xODhMMTUuMTksNi44NTdMMTUuMTksNi44NTd6XCIvPlxyXG4gICAgPHBvbHlnb24gcG9pbnRzPVwiMTAuMjQxLDExLjIzNyAxMC41MjksNS4zMTEgOC40NDksNS4zMTEgOC43NSwxMS4yMzcgXHRcdFwiLz5cclxuICAgIDxwYXRoIGQ9XCJNOS40OTYsMTEuODkxYy0wLjY5NCwwLTEuMTc4LDAuNDk4LTEuMTc4LDEuMTg5YzAsMC42ODIsMC40NzEsMS4xOTEsMS4xNzgsMS4xOTFcclxuICAgICAgICBjMC43MDYsMCwxLjE2NC0wLjUxLDEuMTY0LTEuMTkxQzEwLjY0NywxMi4zODksMTAuMTg5LDExLjg5MSw5LjQ5NiwxMS44OTF6XCIvPlxyXG48L2c+PC9zdmc+YFxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcblxuICAgIGNvbnN0cnVjdG9yKCBkYXRhLCBvcHRzPXt9ICkge1xuICAgICAgICBPYmplY3QuYXNzaWduKCB0aGlzLCB7IHN0b3JlOiB7IH0sIGRhdGEgfSwgb3B0cyApXG5cbiAgICAgICAgaWYoIHRoaXMuc3RvcmVCeSApIHtcbiAgICAgICAgICAgIHRoaXMuc3RvcmVCeS5mb3JFYWNoKCBrZXkgPT4gdGhpcy5zdG9yZVsga2V5IF0gPSB7IH0gKVxuICAgICAgICAgICAgdGhpcy5fc3RvcmUoKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgX3N0b3JlKCkge1xuICAgICAgICB0aGlzLmRhdGEuZm9yRWFjaCggZGF0dW0gPT4gdGhpcy5zdG9yZUJ5LmZvckVhY2goIGF0dHIgPT4gdGhpcy5fc3RvcmVBdHRyKCBkYXR1bSwgYXR0ciApICkgKVxuICAgIH0sXG5cbiAgICBfc3RvcmVBdHRyKCBkYXR1bSwgYXR0ciApIHtcbiAgICAgICAgdGhpcy5zdG9yZVsgYXR0ciBdWyBkYXR1bVsgYXR0ciBdIF0gPVxuICAgICAgICAgICAgdGhpcy5zdG9yZVsgYXR0ciBdWyBkYXR1bVsgYXR0ciBdIF1cbiAgICAgICAgICAgICAgICA/IEFycmF5LmlzQXJyYXkoIHRoaXMuc3RvcmVbIGF0dHIgXVsgZGF0dW1bIGF0dHIgXSBdIClcbiAgICAgICAgICAgICAgICAgICAgPyB0aGlzLnN0b3JlWyBhdHRyIF1bIGRhdHVtWyBhdHRyIF0gXS5jb25jYXQoIGRhdHVtIClcbiAgICAgICAgICAgICAgICAgICAgOlsgdGhpcy5zdG9yZVsgYXR0ciBdWyBkYXR1bVsgYXR0ciBdIF0sIGRhdHVtIF1cbiAgICAgICAgICAgICAgICA6IGRhdHVtXG4gICAgfVxuXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGVyciA9PiB7IGNvbnNvbGUubG9nKCBlcnIuc3RhY2sgfHwgZXJyICkgfVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgICBnZXRJbnRSYW5nZSggaW50ICkge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSggQXJyYXkoIGludCApLmtleXMoKSApXG4gICAgfSxcblxuICAgIGdldFJhbmRvbUluY2x1c2l2ZUludGVnZXIoIG1pbiwgbWF4ICkge1xuICAgICAgICBtaW4gPSBNYXRoLmNlaWwobWluKVxuICAgICAgICBtYXggPSBNYXRoLmZsb29yKG1heClcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW5cbiAgICB9LFxuXG4gICAgb21pdCggb2JqLCBrZXlzICkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMoIG9iaiApLmZpbHRlcigga2V5ID0+ICFrZXlzLmluY2x1ZGVzKCBrZXkgKSApLnJlZHVjZSggKCBtZW1vLCBrZXkgKSA9PiBPYmplY3QuYXNzaWduKCBtZW1vLCB7IFtrZXldOiBvYmpba2V5XSB9ICksIHsgfSApXG4gICAgfSxcblxuICAgIHBpY2soIG9iaiwga2V5cyApIHtcbiAgICAgICAgcmV0dXJuIGtleXMucmVkdWNlKCAoIG1lbW8sIGtleSApID0+IE9iamVjdC5hc3NpZ24oIG1lbW8sIHsgW2tleV06IG9ialtrZXldIH0gKSwgeyB9IClcbiAgICB9LFxuXG4gICAgRXJyb3I6IHJlcXVpcmUoJy4vTXlFcnJvcicpLFxuXG4gICAgUDogKCBmdW4sIGFyZ3M9WyBdLCB0aGlzQXJnICkgPT5cbiAgICAgICAgbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4gUmVmbGVjdC5hcHBseSggZnVuLCB0aGlzQXJnIHx8IHRoaXMsIGFyZ3MuY29uY2F0KCAoIGUsIC4uLmNhbGxiYWNrICkgPT4gZSA/IHJlamVjdChlKSA6IHJlc29sdmUoY2FsbGJhY2spICkgKSApLFxuICAgIFxuICAgIGNvbnN0cnVjdG9yKCkgeyByZXR1cm4gdGhpcyB9XG59XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXQgbGVhc3QgZ2l2ZSBzb21lIGtpbmQgb2YgY29udGV4dCB0byB0aGUgdXNlclxuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LiAoJyArIGVyICsgJyknKTtcbiAgICAgICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2UgaWYgKGxpc3RlbmVycykge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgIHZhciBldmxpc3RlbmVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oZXZsaXN0ZW5lcikpXG4gICAgICByZXR1cm4gMTtcbiAgICBlbHNlIGlmIChldmxpc3RlbmVyKVxuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICB9XG4gIHJldHVybiAwO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHJldHVybiBlbWl0dGVyLmxpc3RlbmVyQ291bnQodHlwZSk7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCIvKlxuICogc21vb3Roc2Nyb2xsIHBvbHlmaWxsIC0gdjAuMy41XG4gKiBodHRwczovL2lhbWR1c3Rhbi5naXRodWIuaW8vc21vb3Roc2Nyb2xsXG4gKiAyMDE2IChjKSBEdXN0YW4gS2FzdGVuLCBKZXJlbWlhcyBNZW5pY2hlbGxpIC0gTUlUIExpY2Vuc2VcbiAqL1xuXG4oZnVuY3Rpb24odywgZCwgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKlxuICAgKiBhbGlhc2VzXG4gICAqIHc6IHdpbmRvdyBnbG9iYWwgb2JqZWN0XG4gICAqIGQ6IGRvY3VtZW50XG4gICAqIHVuZGVmaW5lZDogdW5kZWZpbmVkXG4gICAqL1xuXG4gIC8vIHBvbHlmaWxsXG4gIGZ1bmN0aW9uIHBvbHlmaWxsKCkge1xuICAgIC8vIHJldHVybiB3aGVuIHNjcm9sbEJlaGF2aW9yIGludGVyZmFjZSBpcyBzdXBwb3J0ZWRcbiAgICBpZiAoJ3Njcm9sbEJlaGF2aW9yJyBpbiBkLmRvY3VtZW50RWxlbWVudC5zdHlsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogZ2xvYmFsc1xuICAgICAqL1xuICAgIHZhciBFbGVtZW50ID0gdy5IVE1MRWxlbWVudCB8fCB3LkVsZW1lbnQ7XG4gICAgdmFyIFNDUk9MTF9USU1FID0gNDY4O1xuXG4gICAgLypcbiAgICAgKiBvYmplY3QgZ2F0aGVyaW5nIG9yaWdpbmFsIHNjcm9sbCBtZXRob2RzXG4gICAgICovXG4gICAgdmFyIG9yaWdpbmFsID0ge1xuICAgICAgc2Nyb2xsOiB3LnNjcm9sbCB8fCB3LnNjcm9sbFRvLFxuICAgICAgc2Nyb2xsQnk6IHcuc2Nyb2xsQnksXG4gICAgICBlbFNjcm9sbDogRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsIHx8IHNjcm9sbEVsZW1lbnQsXG4gICAgICBzY3JvbGxJbnRvVmlldzogRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsSW50b1ZpZXdcbiAgICB9O1xuXG4gICAgLypcbiAgICAgKiBkZWZpbmUgdGltaW5nIG1ldGhvZFxuICAgICAqL1xuICAgIHZhciBub3cgPSB3LnBlcmZvcm1hbmNlICYmIHcucGVyZm9ybWFuY2Uubm93XG4gICAgICA/IHcucGVyZm9ybWFuY2Uubm93LmJpbmQody5wZXJmb3JtYW5jZSkgOiBEYXRlLm5vdztcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZXMgc2Nyb2xsIHBvc2l0aW9uIGluc2lkZSBhbiBlbGVtZW50XG4gICAgICogQG1ldGhvZCBzY3JvbGxFbGVtZW50XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNjcm9sbEVsZW1lbnQoeCwgeSkge1xuICAgICAgdGhpcy5zY3JvbGxMZWZ0ID0geDtcbiAgICAgIHRoaXMuc2Nyb2xsVG9wID0geTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiByZXR1cm5zIHJlc3VsdCBvZiBhcHBseWluZyBlYXNlIG1hdGggZnVuY3Rpb24gdG8gYSBudW1iZXJcbiAgICAgKiBAbWV0aG9kIGVhc2VcbiAgICAgKiBAcGFyYW0ge051bWJlcn0ga1xuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAgICovXG4gICAgZnVuY3Rpb24gZWFzZShrKSB7XG4gICAgICByZXR1cm4gMC41ICogKDEgLSBNYXRoLmNvcyhNYXRoLlBJICogaykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGluZGljYXRlcyBpZiBhIHNtb290aCBiZWhhdmlvciBzaG91bGQgYmUgYXBwbGllZFxuICAgICAqIEBtZXRob2Qgc2hvdWxkQmFpbE91dFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfE9iamVjdH0geFxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNob3VsZEJhaWxPdXQoeCkge1xuICAgICAgaWYgKHR5cGVvZiB4ICE9PSAnb2JqZWN0J1xuICAgICAgICAgICAgfHwgeCA9PT0gbnVsbFxuICAgICAgICAgICAgfHwgeC5iZWhhdmlvciA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICB8fCB4LmJlaGF2aW9yID09PSAnYXV0bydcbiAgICAgICAgICAgIHx8IHguYmVoYXZpb3IgPT09ICdpbnN0YW50Jykge1xuICAgICAgICAvLyBmaXJzdCBhcmcgbm90IGFuIG9iamVjdC9udWxsXG4gICAgICAgIC8vIG9yIGJlaGF2aW9yIGlzIGF1dG8sIGluc3RhbnQgb3IgdW5kZWZpbmVkXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHggPT09ICdvYmplY3QnXG4gICAgICAgICAgICAmJiB4LmJlaGF2aW9yID09PSAnc21vb3RoJykge1xuICAgICAgICAvLyBmaXJzdCBhcmd1bWVudCBpcyBhbiBvYmplY3QgYW5kIGJlaGF2aW9yIGlzIHNtb290aFxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIHRocm93IGVycm9yIHdoZW4gYmVoYXZpb3IgaXMgbm90IHN1cHBvcnRlZFxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYmVoYXZpb3Igbm90IHZhbGlkJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogZmluZHMgc2Nyb2xsYWJsZSBwYXJlbnQgb2YgYW4gZWxlbWVudFxuICAgICAqIEBtZXRob2QgZmluZFNjcm9sbGFibGVQYXJlbnRcbiAgICAgKiBAcGFyYW0ge05vZGV9IGVsXG4gICAgICogQHJldHVybnMge05vZGV9IGVsXG4gICAgICovXG4gICAgZnVuY3Rpb24gZmluZFNjcm9sbGFibGVQYXJlbnQoZWwpIHtcbiAgICAgIHZhciBpc0JvZHk7XG4gICAgICB2YXIgaGFzU2Nyb2xsYWJsZVNwYWNlO1xuICAgICAgdmFyIGhhc1Zpc2libGVPdmVyZmxvdztcblxuICAgICAgZG8ge1xuICAgICAgICBlbCA9IGVsLnBhcmVudE5vZGU7XG5cbiAgICAgICAgLy8gc2V0IGNvbmRpdGlvbiB2YXJpYWJsZXNcbiAgICAgICAgaXNCb2R5ID0gZWwgPT09IGQuYm9keTtcbiAgICAgICAgaGFzU2Nyb2xsYWJsZVNwYWNlID1cbiAgICAgICAgICBlbC5jbGllbnRIZWlnaHQgPCBlbC5zY3JvbGxIZWlnaHQgfHxcbiAgICAgICAgICBlbC5jbGllbnRXaWR0aCA8IGVsLnNjcm9sbFdpZHRoO1xuICAgICAgICBoYXNWaXNpYmxlT3ZlcmZsb3cgPVxuICAgICAgICAgIHcuZ2V0Q29tcHV0ZWRTdHlsZShlbCwgbnVsbCkub3ZlcmZsb3cgPT09ICd2aXNpYmxlJztcbiAgICAgIH0gd2hpbGUgKCFpc0JvZHkgJiYgIShoYXNTY3JvbGxhYmxlU3BhY2UgJiYgIWhhc1Zpc2libGVPdmVyZmxvdykpO1xuXG4gICAgICBpc0JvZHkgPSBoYXNTY3JvbGxhYmxlU3BhY2UgPSBoYXNWaXNpYmxlT3ZlcmZsb3cgPSBudWxsO1xuXG4gICAgICByZXR1cm4gZWw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogc2VsZiBpbnZva2VkIGZ1bmN0aW9uIHRoYXQsIGdpdmVuIGEgY29udGV4dCwgc3RlcHMgdGhyb3VnaCBzY3JvbGxpbmdcbiAgICAgKiBAbWV0aG9kIHN0ZXBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHN0ZXAoY29udGV4dCkge1xuICAgICAgdmFyIHRpbWUgPSBub3coKTtcbiAgICAgIHZhciB2YWx1ZTtcbiAgICAgIHZhciBjdXJyZW50WDtcbiAgICAgIHZhciBjdXJyZW50WTtcbiAgICAgIHZhciBlbGFwc2VkID0gKHRpbWUgLSBjb250ZXh0LnN0YXJ0VGltZSkgLyBTQ1JPTExfVElNRTtcblxuICAgICAgLy8gYXZvaWQgZWxhcHNlZCB0aW1lcyBoaWdoZXIgdGhhbiBvbmVcbiAgICAgIGVsYXBzZWQgPSBlbGFwc2VkID4gMSA/IDEgOiBlbGFwc2VkO1xuXG4gICAgICAvLyBhcHBseSBlYXNpbmcgdG8gZWxhcHNlZCB0aW1lXG4gICAgICB2YWx1ZSA9IGVhc2UoZWxhcHNlZCk7XG5cbiAgICAgIGN1cnJlbnRYID0gY29udGV4dC5zdGFydFggKyAoY29udGV4dC54IC0gY29udGV4dC5zdGFydFgpICogdmFsdWU7XG4gICAgICBjdXJyZW50WSA9IGNvbnRleHQuc3RhcnRZICsgKGNvbnRleHQueSAtIGNvbnRleHQuc3RhcnRZKSAqIHZhbHVlO1xuXG4gICAgICBjb250ZXh0Lm1ldGhvZC5jYWxsKGNvbnRleHQuc2Nyb2xsYWJsZSwgY3VycmVudFgsIGN1cnJlbnRZKTtcblxuICAgICAgLy8gc2Nyb2xsIG1vcmUgaWYgd2UgaGF2ZSBub3QgcmVhY2hlZCBvdXIgZGVzdGluYXRpb25cbiAgICAgIGlmIChjdXJyZW50WCAhPT0gY29udGV4dC54IHx8IGN1cnJlbnRZICE9PSBjb250ZXh0LnkpIHtcbiAgICAgICAgdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc3RlcC5iaW5kKHcsIGNvbnRleHQpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzY3JvbGxzIHdpbmRvdyB3aXRoIGEgc21vb3RoIGJlaGF2aW9yXG4gICAgICogQG1ldGhvZCBzbW9vdGhTY3JvbGxcbiAgICAgKiBAcGFyYW0ge09iamVjdHxOb2RlfSBlbFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzbW9vdGhTY3JvbGwoZWwsIHgsIHkpIHtcbiAgICAgIHZhciBzY3JvbGxhYmxlO1xuICAgICAgdmFyIHN0YXJ0WDtcbiAgICAgIHZhciBzdGFydFk7XG4gICAgICB2YXIgbWV0aG9kO1xuICAgICAgdmFyIHN0YXJ0VGltZSA9IG5vdygpO1xuXG4gICAgICAvLyBkZWZpbmUgc2Nyb2xsIGNvbnRleHRcbiAgICAgIGlmIChlbCA9PT0gZC5ib2R5KSB7XG4gICAgICAgIHNjcm9sbGFibGUgPSB3O1xuICAgICAgICBzdGFydFggPSB3LnNjcm9sbFggfHwgdy5wYWdlWE9mZnNldDtcbiAgICAgICAgc3RhcnRZID0gdy5zY3JvbGxZIHx8IHcucGFnZVlPZmZzZXQ7XG4gICAgICAgIG1ldGhvZCA9IG9yaWdpbmFsLnNjcm9sbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNjcm9sbGFibGUgPSBlbDtcbiAgICAgICAgc3RhcnRYID0gZWwuc2Nyb2xsTGVmdDtcbiAgICAgICAgc3RhcnRZID0gZWwuc2Nyb2xsVG9wO1xuICAgICAgICBtZXRob2QgPSBzY3JvbGxFbGVtZW50O1xuICAgICAgfVxuXG4gICAgICAvLyBzY3JvbGwgbG9vcGluZyBvdmVyIGEgZnJhbWVcbiAgICAgIHN0ZXAoe1xuICAgICAgICBzY3JvbGxhYmxlOiBzY3JvbGxhYmxlLFxuICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgc3RhcnRUaW1lOiBzdGFydFRpbWUsXG4gICAgICAgIHN0YXJ0WDogc3RhcnRYLFxuICAgICAgICBzdGFydFk6IHN0YXJ0WSxcbiAgICAgICAgeDogeCxcbiAgICAgICAgeTogeVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBPUklHSU5BTCBNRVRIT0RTIE9WRVJSSURFU1xuICAgICAqL1xuXG4gICAgLy8gdy5zY3JvbGwgYW5kIHcuc2Nyb2xsVG9cbiAgICB3LnNjcm9sbCA9IHcuc2Nyb2xsVG8gPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGF2b2lkIHNtb290aCBiZWhhdmlvciBpZiBub3QgcmVxdWlyZWRcbiAgICAgIGlmIChzaG91bGRCYWlsT3V0KGFyZ3VtZW50c1swXSkpIHtcbiAgICAgICAgb3JpZ2luYWwuc2Nyb2xsLmNhbGwoXG4gICAgICAgICAgdyxcbiAgICAgICAgICBhcmd1bWVudHNbMF0ubGVmdCB8fCBhcmd1bWVudHNbMF0sXG4gICAgICAgICAgYXJndW1lbnRzWzBdLnRvcCB8fCBhcmd1bWVudHNbMV1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBMRVQgVEhFIFNNT09USE5FU1MgQkVHSU4hXG4gICAgICBzbW9vdGhTY3JvbGwuY2FsbChcbiAgICAgICAgdyxcbiAgICAgICAgZC5ib2R5LFxuICAgICAgICB+fmFyZ3VtZW50c1swXS5sZWZ0LFxuICAgICAgICB+fmFyZ3VtZW50c1swXS50b3BcbiAgICAgICk7XG4gICAgfTtcblxuICAgIC8vIHcuc2Nyb2xsQnlcbiAgICB3LnNjcm9sbEJ5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBhdm9pZCBzbW9vdGggYmVoYXZpb3IgaWYgbm90IHJlcXVpcmVkXG4gICAgICBpZiAoc2hvdWxkQmFpbE91dChhcmd1bWVudHNbMF0pKSB7XG4gICAgICAgIG9yaWdpbmFsLnNjcm9sbEJ5LmNhbGwoXG4gICAgICAgICAgdyxcbiAgICAgICAgICBhcmd1bWVudHNbMF0ubGVmdCB8fCBhcmd1bWVudHNbMF0sXG4gICAgICAgICAgYXJndW1lbnRzWzBdLnRvcCB8fCBhcmd1bWVudHNbMV1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBMRVQgVEhFIFNNT09USE5FU1MgQkVHSU4hXG4gICAgICBzbW9vdGhTY3JvbGwuY2FsbChcbiAgICAgICAgdyxcbiAgICAgICAgZC5ib2R5LFxuICAgICAgICB+fmFyZ3VtZW50c1swXS5sZWZ0ICsgKHcuc2Nyb2xsWCB8fCB3LnBhZ2VYT2Zmc2V0KSxcbiAgICAgICAgfn5hcmd1bWVudHNbMF0udG9wICsgKHcuc2Nyb2xsWSB8fCB3LnBhZ2VZT2Zmc2V0KVxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgLy8gRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsIGFuZCBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxUb1xuICAgIEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbCA9IEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbFRvID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBhdm9pZCBzbW9vdGggYmVoYXZpb3IgaWYgbm90IHJlcXVpcmVkXG4gICAgICBpZiAoc2hvdWxkQmFpbE91dChhcmd1bWVudHNbMF0pKSB7XG4gICAgICAgIG9yaWdpbmFsLmVsU2Nyb2xsLmNhbGwoXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgYXJndW1lbnRzWzBdLmxlZnQgfHwgYXJndW1lbnRzWzBdLFxuICAgICAgICAgICAgYXJndW1lbnRzWzBdLnRvcCB8fCBhcmd1bWVudHNbMV1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBMRVQgVEhFIFNNT09USE5FU1MgQkVHSU4hXG4gICAgICBzbW9vdGhTY3JvbGwuY2FsbChcbiAgICAgICAgICB0aGlzLFxuICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgYXJndW1lbnRzWzBdLmxlZnQsXG4gICAgICAgICAgYXJndW1lbnRzWzBdLnRvcFxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgLy8gRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsQnlcbiAgICBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxCeSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZzAgPSBhcmd1bWVudHNbMF07XG5cbiAgICAgIGlmICh0eXBlb2YgYXJnMCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgdGhpcy5zY3JvbGwoe1xuICAgICAgICAgIGxlZnQ6IGFyZzAubGVmdCArIHRoaXMuc2Nyb2xsTGVmdCxcbiAgICAgICAgICB0b3A6IGFyZzAudG9wICsgdGhpcy5zY3JvbGxUb3AsXG4gICAgICAgICAgYmVoYXZpb3I6IGFyZzAuYmVoYXZpb3JcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNjcm9sbChcbiAgICAgICAgICB0aGlzLnNjcm9sbExlZnQgKyBhcmcwLFxuICAgICAgICAgIHRoaXMuc2Nyb2xsVG9wICsgYXJndW1lbnRzWzFdXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbEludG9WaWV3XG4gICAgRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsSW50b1ZpZXcgPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGF2b2lkIHNtb290aCBiZWhhdmlvciBpZiBub3QgcmVxdWlyZWRcbiAgICAgIGlmIChzaG91bGRCYWlsT3V0KGFyZ3VtZW50c1swXSkpIHtcbiAgICAgICAgb3JpZ2luYWwuc2Nyb2xsSW50b1ZpZXcuY2FsbCh0aGlzLCBhcmd1bWVudHNbMF0gfHwgdHJ1ZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTEVUIFRIRSBTTU9PVEhORVNTIEJFR0lOIVxuICAgICAgdmFyIHNjcm9sbGFibGVQYXJlbnQgPSBmaW5kU2Nyb2xsYWJsZVBhcmVudCh0aGlzKTtcbiAgICAgIHZhciBwYXJlbnRSZWN0cyA9IHNjcm9sbGFibGVQYXJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICB2YXIgY2xpZW50UmVjdHMgPSB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICBpZiAoc2Nyb2xsYWJsZVBhcmVudCAhPT0gZC5ib2R5KSB7XG4gICAgICAgIC8vIHJldmVhbCBlbGVtZW50IGluc2lkZSBwYXJlbnRcbiAgICAgICAgc21vb3RoU2Nyb2xsLmNhbGwoXG4gICAgICAgICAgdGhpcyxcbiAgICAgICAgICBzY3JvbGxhYmxlUGFyZW50LFxuICAgICAgICAgIHNjcm9sbGFibGVQYXJlbnQuc2Nyb2xsTGVmdCArIGNsaWVudFJlY3RzLmxlZnQgLSBwYXJlbnRSZWN0cy5sZWZ0LFxuICAgICAgICAgIHNjcm9sbGFibGVQYXJlbnQuc2Nyb2xsVG9wICsgY2xpZW50UmVjdHMudG9wIC0gcGFyZW50UmVjdHMudG9wXG4gICAgICAgICk7XG4gICAgICAgIC8vIHJldmVhbCBwYXJlbnQgaW4gdmlld3BvcnRcbiAgICAgICAgdy5zY3JvbGxCeSh7XG4gICAgICAgICAgbGVmdDogcGFyZW50UmVjdHMubGVmdCxcbiAgICAgICAgICB0b3A6IHBhcmVudFJlY3RzLnRvcCxcbiAgICAgICAgICBiZWhhdmlvcjogJ3Ntb290aCdcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyByZXZlYWwgZWxlbWVudCBpbiB2aWV3cG9ydFxuICAgICAgICB3LnNjcm9sbEJ5KHtcbiAgICAgICAgICBsZWZ0OiBjbGllbnRSZWN0cy5sZWZ0LFxuICAgICAgICAgIHRvcDogY2xpZW50UmVjdHMudG9wLFxuICAgICAgICAgIGJlaGF2aW9yOiAnc21vb3RoJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIC8vIGNvbW1vbmpzXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7IHBvbHlmaWxsOiBwb2x5ZmlsbCB9O1xuICB9IGVsc2Uge1xuICAgIC8vIGdsb2JhbFxuICAgIHBvbHlmaWxsKCk7XG4gIH1cbn0pKHdpbmRvdywgZG9jdW1lbnQpO1xuIl19
