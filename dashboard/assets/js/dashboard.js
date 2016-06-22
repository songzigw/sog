/*!
 * 
 * dashboard.js v1.0 
 * Copyright 2016, Feng Lee <feng@emqtt.io>
 * 
 */

(function(dashboad, $) {

    'use strict';

    var WebAPI = function(options) {
        this.options = $.extend(
                {},
                WebAPI.DEFAULTS,
                options || {});
    };

    WebAPI.DEFAULTS = {
        apiPath  : '/',
        method   : 'POST',
        cache    : false,
        dataType : 'json',
        callback : null
    };

    /** Instantiation WebAPI */
    WebAPI._instance = null;
    /**
     * Get the Instantiation WebAPI
     */
    WebAPI.getInstance = function() {
        if (!WebAPI._instance) {
            throw new Error('WebAPI is not initialized.');
        }
        return WebAPI._instance;
    };

    // WebAPI initialized
    WebAPI.init = function(options) {
        if (!WebAPI._instance) {
            WebAPI._instance = new WebAPI(options);
        }
        return WebAPI.getInstance();
    };

    // var callback = function(ret, err) {};
    WebAPI.prototype._ajax = function(path, params, callback, ajaxInfo) {
        var _this = this, options = _this.options;
        var info = {
            type     : options.method,
            url      : options.apiPath + path,
            data     : params,
            dataType : options.dataType,
            cache    : options.cache,
            success  : function(ret) {
                if (typeof callback === 'function') {
                    callback(ret, undefined);
                }
                // Do "options.callback" after
                // the request is successful
                if (typeof options.callback === 'function') {
                    options.callback();
                }
            },
            error : function(err) {
                if (typeof callback === 'function') {
                    callback(undefined, err);
                }
            }
        };
        $.extend(info, ajaxInfo || {});
        $.ajax(info);
    };

    $.extend(WebAPI.prototype, {
        // broker
        broker : function(callback) {
            this._ajax('brokers', null, callback);
        },

        // bnode
        bnode : function(callback) {
            this._ajax('bnode', null, callback);
        },

        // nodes
        nodes : function(callback) {
            this._ajax('nodes', null, callback);
        },

        // stats
        stats : function(callback) {
            this._ajax('stats', null, callback);
        },

        // metrics
        metrics : function(callback) {
            this._ajax('metrics', null, callback);
        },

        // listeners
        listeners : function(callback) {
            this._ajax('listeners', null, callback);
        },

        // clients
        clients : function(params, callback) {
            this._ajax('clients', params, callback);
        },

        // sessions
        sessions : function(params, callback) {
            this._ajax('sessions', params, callback);
        },

        // topics
        topics : function(params, callback) {
            this._ajax('topics', params, callback);
        },

        // subscriptions
        subscriptions : function(params, callback) {
            this._ajax('subscriptions', params, callback);
        },

        // users
        users : function(callback) {
            this._ajax('users', null, callback);
        },

        // user_remove
        user_remove : function(username, callback) {
            this._ajax('remove_user', {user_name : username}, callback);
        },

        // user_add
        user_add : function(user, callback) {
            this._ajax('add_user', user, callback);
        },

        // user_curr
        user_curr : function(callback) {
            this._ajax('current_user', null, callback);
        },

        // user_update
        user_update : function(user, callback) {
            this._ajax('update_user', user, callback);
        },

        // logout
        logout : function(callback) {
            this._ajax('current_user', null, callback, {
                headers: {
                    "Authorization": "Lougout 123456789"
                }
            });
            // clearAuthenticate();
        },

        // routes
        routes : function(params, callback) {
            this._ajax('routes', params, callback);
        }
    });

    // Modules save container.
    var modules = {};
    // Overview-----------------------------------------

    var Overview = function() {
        this.modName = 'overview';
        this.$html = $('#dashboard_overview',
                sog.mainCenter.$html);
        this._init();
    };
    Overview.prototype._init = function() {
        loading('overview.html', function() {
            
        }, this.$html);
    };
    Overview.prototype.show = function() {
        hideAllMods();
        activeMenu(this.modName);
        this.$html.show();
    };
    Overview.prototype.hide = function() {
        this.$html.hide();
    };

    // Functions----------------------------------------

    var hideAllMods = function() {
        for (var key in modules) {
            var m = modules[key];
            m.hide();
        }
    };
    var loading = function(mod, fun, $html) {
        sog.loadingBar.show({
            pct : 100,
            delay : 0.5,
            finish : function(pct) {
                // $html.empty().append(
                // '<div class="page-loading-overlay">\
                // <div class="loader-2"></div></div>');
                $html.load(mod, function() {
                    fun();
                    sog.mainFooter.toBottom();
                });
            }
        });
    };
    var showCurrUser = function() {
        dashboard.webapi.user_curr(function(ret, err) {
            if (ret) {
                $('#current_user', sog.mainContent.$html)
                .text(ret.username);
            }
        });
    };
    var clearAuth = function() {
        dashboard.webapi.logout(function(ret, err) {
            if (ret) {
                window.location.href = '/';
            } else {
                window.location.href = '/';
            }
        });
    };
    var openModule = function(modName) {
        switch (modName) {
        case 'overview':
            if (!modules.overview) {
                modules.overview = new Overview();
            }
            modules.overview.show();
            break;
        case 'clients':

            break;
        case 'sessions':

            break;
        case 'topics':

            break;
        case 'routes':

            break;
        case 'subscriptions':

            break;
        case 'websocket':

            break;
        case 'users':

            break;
        case 'http_api':

            break;
        default:
            break;
        }
    };
    var registerEvent = function() {
        var $main = sog.mainContent.$html;
        var $menu = sog.sidebarMenu.$html;
        
        $('#logout', $main).on('click', function(ev) {
            ev.preventDefault();
            clearAuth();
        });

        $('#main-menu>li', $menu).each(function() {
            $(this).click(function() {
                openModule($(this).attr('module'));
            });
        });
    };
    var activeMenu = function(modName) {
        if (modName == 'websocket') {
            if (!window.WebSocket) {
                var msg = "WebSocket not supported by this browser.";
                alert(msg);
                throw new Error(msg);
            }
        }
        $('#main-menu>li').each(function() {
            var $m = $(this);
            $m.removeClass('active');
            var mod = $m.attr('module');
            if (mod == modName) {
                $m.addClass('active');
            }
        });
    };

    dashboard.init = function(url) {
        var _this = this;

        _this.webapi = WebAPI.init({
            callback : function() {
                sog.mainFooter.toBottom();
            }
        });

        showCurrUser();
        // Register menu event.
        registerEvent();
        // Show main center content.
        var strs = url.split('#');
        if (strs.length == 1) {
            openModule('overview');
            return;
        }
        if (strs[1] == '/clients') {
            openModule('clients');
        } else if (strs[1] == '/sessions') {
            openModule('sessions');
        } else if (strs[1] == '/topics') {
            openModule('topics');
        } else if (strs[1] == '/routes') {
            openModule('routes');
        } else if (strs[1] == '/subscriptions') {
            openModule('subscriptions');
        } else if (strs[1] == '/websocket') {
            openModule('websocket');
        } else if (strs[1] == '/users') {
            openModule('users');
        } else if (strs[1] == '/http_api') {
            openModule('http_api');
        } else {
            openModule('overview');
        }
    };

})((function() {
    if (!window.dashboard) {
        window.dashboard = {}
    }
    return window.dashboard;
})(), jQuery);