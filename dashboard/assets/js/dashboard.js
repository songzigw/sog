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
            this._ajax('api/brokers', null, callback);
        },

        // bnode
        bnode : function(callback) {
            this._ajax('api/bnode', null, callback);
        },

        // nodes
        nodes : function(callback) {
            this._ajax('api/nodes', null, callback);
        },

        // stats
        stats : function(callback) {
            this._ajax('api/stats', null, callback);
        },

        // metrics
        metrics : function(callback) {
            this._ajax('api/metrics', null, callback);
        },

        // listeners
        listeners : function(callback) {
            this._ajax('api/listeners', null, callback);
        },

        // clients
        clients : function(params, callback) {
            this._ajax('api/clients', params, callback);
        },

        // sessions
        sessions : function(params, callback) {
            this._ajax('api/sessions', params, callback);
        },

        // topics
        topics : function(params, callback) {
            this._ajax('api/topics', params, callback);
        },

        // subscriptions
        subscriptions : function(params, callback) {
            this._ajax('api/subscriptions', params, callback);
        },

        // users
        users : function(callback) {
            this._ajax('api/users', null, callback);
        },

        // user_remove
        user_remove : function(username, callback) {
            this._ajax('api/remove_user', {user_name : username}, callback);
        },

        // user_add
        user_add : function(user, callback) {
            this._ajax('api/add_user', user, callback);
        },

        // user_curr
        user_curr : function(callback) {
            this._ajax('api/current_user', null, callback);
        },

        // user_update
        user_update : function(user, callback) {
            this._ajax('api/update_user', user, callback);
        },

        // logout
        logout : function(callback) {
            this._ajax('api/current_user', null, callback, {
                headers: {
                    "Authorization": "Lougout 123456789"
                }
            });
            // clearAuthenticate();
        },

        // routes
        routes : function(params, callback) {
            this._ajax('api/routes', params, callback);
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
        var _this = this;
        loading('overview.html', function() {
            _this.broker();
            _this.nodes();
            _this.stats();
            _this.metrics();
            _this.listeners();
            // Start Timertask
            _this.startTask()
        }, _this.$html);
    };
    Overview.prototype.show = function() {
        hideAllMods();
        activeMenu(this.modName);
        this.$html.show();
    };
    Overview.prototype.hide = function() {
        this.$html.hide();
    };
    Overview.prototype.broker = function() {
        var _this = this;
        _this.vmBroker = new Vue({
            el : $('#overview_broker', _this.$html)[0]
        });
        dashboard.webapi.broker(function(ret, err) {
            if (ret) {
                _this.vmBroker.$data = ret;
            }
        });
    };
    Overview.prototype.nodes = function() {
        var _this = this;
        _this.vmNodes = new Vue({
            el  : $('#overview_nodes', _this.$html)[0],
            data: {
                nodes: []
            }
        });
        dashboard.webapi.nodes(function(ret, err) {
            if (ret) {
                _this.vmNodes.nodes = ret;
            }
        });
    };
    Overview.prototype.stats = function() {
        var _this = this;
        var $stats = $('#overview_stats', _this.$html);
        dashboard.webapi.stats(function(ret, err) {
            if (ret) {
                for ( var key in ret) {
                    var keyStr = key.split('/').join('_');
                    $('#' + keyStr, $stats).text(ret[key]);
                }
            }
        });
    };
    Overview.prototype.metrics = function() {
        var _this = this;
        var $metrics = $('#overview_metrics', _this.$html);
        dashboard.webapi.metrics(function(ret, err) {
            if (ret) {
                for ( var key in ret) {
                    var keyStr = key.split('/').join('_');
                    $('#' + keyStr, $metrics).text(ret[key]);
                }
            }
        });
    };
    Overview.prototype.listeners = function() {
        var _this = this;
        var $listeners = $('#voerview_listeners', _this.$html);
        _this.vmLiss = new Vue({
            el  : $listeners[0],
            data: {
                listeners: []
            }
        });
        dashboard.webapi.listeners(function(ret, err) {
            if (ret) {
                _this.vmLiss.listeners = ret;
            }
        });
    };
    Overview.prototype.startTask = function() {
        var _this = this;
        _this.timertask = setInterval(function() {
            dashboard.webapi.broker(function(ret, err) {
                if (ret) {
                    _this.vmBroker.$data = ret;
                }
            });
            
            dashboard.webapi.nodes(function(ret, err) {
                if (ret) {
                    _this.vmNodes.nodes = ret;
                }
            });
            
            var $stats = $('#overview_stats', _this.$html);
            dashboard.webapi.stats(function(ret, err) {
                if (ret) {
                    for ( var key in ret) {
                        var keyStr = key.split('/').join('_');
                        $('#' + keyStr, $stats).text(ret[key]);
                    }
                }
            });
            
            var $metrics = $('#overview_metrics', _this.$html);
            dashboard.webapi.metrics(function(ret, err) {
                if (ret) {
                    for ( var key in ret) {
                        var keyStr = key.split('/').join('_');
                        $('#' + keyStr, $metrics).text(ret[key]);
                    }
                }
            });
        }, 10000);
    };

    // Clients------------------------------------------

    var Clients = function() {
        this.modName = 'clients';
        this.$html = $('#dashboard_clients',
                sog.mainCenter.$html);
        this._init();
    };
    Clients.prototype._init = function() {
        var _this = this;
        loading('clients.html', function() {
            
        }, _this.$html);
    };
    Clients.prototype.show = function() {
        hideAllMods();
        activeMenu(this.modName);
        this.$html.show();
    };
    Clients.prototype.hide = function() {
        this.$html.hide();
    };

    // Sessions-----------------------------------------

    var Sessions = function() {
        this.modName = 'sessions';
        this.$html = $('#dashboard_sessions',
                sog.mainCenter.$html);
        this._init();
    };
    Sessions.prototype._init = function() {
        var _this = this;
        loading('sessions.html', function() {
            
        }, _this.$html);
    };
    Sessions.prototype.show = function() {
        hideAllMods();
        activeMenu(this.modName);
        this.$html.show();
    };
    Sessions.prototype.hide = function() {
        this.$html.hide();
    };

    // Topics-------------------------------------------

    var Topics = function() {
        this.modName = 'topics';
        this.$html = $('#dashboard_topics',
                sog.mainCenter.$html);
        this._init();
    };
    Topics.prototype._init = function() {
        var _this = this;
        loading('topics.html', function() {
            
        }, _this.$html);
    };
    Topics.prototype.show = function() {
        hideAllMods();
        activeMenu(this.modName);
        this.$html.show();
    };
    Topics.prototype.hide = function() {
        this.$html.hide();
    };

    // Routes-------------------------------------------

    var Routes = function() {
        this.modName = 'routes';
        this.$html = $('#dashboard_routes',
                sog.mainCenter.$html);
        this._init();
    };
    Routes.prototype._init = function() {
        var _this = this;
        loading('routes.html', function() {
            
        }, _this.$html);
    };
    Routes.prototype.show = function() {
        hideAllMods();
        activeMenu(this.modName);
        this.$html.show();
    };
    Routes.prototype.hide = function() {
        this.$html.hide();
    };

    // Subscriptions-------------------------------------

    var Subscriptions = function() {
        this.modName = 'subscriptions';
        this.$html = $('#dashboard_subscriptions',
                sog.mainCenter.$html);
        this._init();
    };
    Subscriptions.prototype._init = function() {
        var _this = this;
        loading('subscriptions.html', function() {
            
        }, _this.$html);
    };
    Subscriptions.prototype.show = function() {
        hideAllMods();
        activeMenu(this.modName);
        this.$html.show();
    };
    Subscriptions.prototype.hide = function() {
        this.$html.hide();
    };

    // Websocket----------------------------------------

    var Websocket = function() {
        this.modName = 'websocket';
        this.$html = $('#dashboard_websocket',
                sog.mainCenter.$html);
        this._init();
    };
    Websocket.prototype._init = function() {
        var _this = this;
        loading('websocket.html', function() {
            
        }, _this.$html);
    };
    Websocket.prototype.show = function() {
        hideAllMods();
        activeMenu(this.modName);
        this.$html.show();
    };
    Websocket.prototype.hide = function() {
        this.$html.hide();
    };

    // Users---------------------------------------------

    var Users = function() {
        this.modName = 'users';
        this.$html = $('#dashboard_users',
                sog.mainCenter.$html);
        this._init();
    };
    Users.prototype._init = function() {
        var _this = this;
        loading('users.html', function() {
            _this.list();
        }, _this.$html);
    };
    Users.prototype.show = function() {
        hideAllMods();
        activeMenu(this.modName);
        this.$html.show();
    };
    Users.prototype.hide = function() {
        this.$html.hide();
    };
    Users.prototype.list = function() {
        var _this = this;
        var $usersList = $('#users_list', _this.$html);
        _this.vmUsers = new Vue({
            el  : $usersList[0],
            data: {
                users: []
            }
        });
        dashboard.webapi.users(function(ret, err) {
            if (ret) {
                _this.vmUsers.users = ret;
            }
        });
    };

    // HttpApi-------------------------------------------

    var HttpApi = function() {
        this.modName = 'http_api';
        this.$html = $('#dashboard_http_api',
                sog.mainCenter.$html);
        this._init();
    };
    HttpApi.prototype._init = function() {
        var _this = this;
        loading('http_api.html', function() {
            
        }, _this.$html);
    };
    HttpApi.prototype.show = function() {
        hideAllMods();
        activeMenu(this.modName);
        this.$html.show();
    };
    HttpApi.prototype.hide = function() {
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
            if (!modules.clients) {
                modules.clients = new Clients();
            }
            modules.clients.show();
            break;
        case 'sessions':
            if (!modules.sessions) {
                modules.sessions = new Sessions();
            }
            modules.sessions.show();
            break;
        case 'topics':
            if (!modules.topics) {
                modules.topics = new Topics();
            }
            modules.topics.show();
            break;
        case 'routes':
            if (!modules.routes) {
                modules.routes = new Routes();
            }
            modules.routes.show();
            break;
        case 'subscriptions':
            if (!modules.subscriptions) {
                modules.subscriptions = new Subscriptions();
            }
            modules.subscriptions.show();
            break;
        case 'websocket':
            if (!modules.websocket) {
                modules.websocket = new Websocket();
            }
            modules.websocket.show();
            break;
        case 'users':
            if (!modules.users) {
                modules.users = new Users();
            }
            modules.users.show();
            break;
        case 'http_api':
            if (!modules.httpApi) {
                modules.httpApi = new HttpApi();
            }
            modules.httpApi.show();
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