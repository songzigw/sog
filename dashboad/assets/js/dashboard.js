/*!
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

        // user_current
        user_current : function(callback) {
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

    var loading = function(m, fun) {
        
    };

    dashboard.init = function() {
        
    };

})((function() {
    if (!window.dashboard) {
        window.dashboard = {}
    }
    return window.dashboard;
})(), jQuery);