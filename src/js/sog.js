/*!
 * 
 * sog.js
 * 
 * @author  zhangsong
 * @since   0.1
 * @version 0.5.1
 * 
 */

(function(s, $) {

    'use strict';

    s.version = '0.5.1';

    Date.prototype.format = function(format) {
        var o = {
            // month
            "M+" : this.getMonth() + 1,
            // day
            "d+" : this.getDate(),
            // hour
            "h+" : this.getHours(),
            // minute
            "m+" : this.getMinutes(),
            // second
            "s+" : this.getSeconds(),
            // quarter
            "q+" : Math.floor((this.getMonth() + 3) / 3),
            // millisecond
            "S" : this.getMilliseconds()
        }

        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + "")
                    .substr(4 - RegExp.$1.length));
        }

        for ( var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
                        : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    };

    String.prototype.trim = function() {
        return (this || "").replace(/^\s+|\s+$/g, "");
    };

    /**
     * 
     * Validate an object's parameter names to ensure they match a list of
     * expected variables name for this option type. Used to ensure option
     * object passed into the API don't contain erroneous parameters.
     * 
     * @param {Object}
     *                obj - User options object
     * @param {Object}
     *                keys - valid keys and types that may exist in obj.
     * @throws {Error}
     *                Invalid option parameter found.
     */
    s.validate = (function() {
        var isSameType = function(data, dataType) {
            if (typeof dataType === 'string') {
                if (dataType === 'array'
                        && isArray(data)) {
                    return true;
                }
                if (typeof data === dataType) {
                    return true;
                }
            }

            if (isArray(dataType)) {
                for (var i = 0; i < dataType.length; i++) {
                    if (data == dataType[i]) {
                        return true;
                    }
                }
            }

            return false;
        };

        return function(obj, keys) {
            for ( var key in obj) {
                if (!obj[key]) {
                    continue;
                }
                if (obj.hasOwnProperty(key)) {
                    if (keys.hasOwnProperty(key)) {
                        var dataType = keys[key].type;
                        if (!isSameType(obj[key], dataType)) {
                            throw new Error(
                                    format({text : "Invalid type {0} for {1}."},
                                           [typeof obj[key], key]));
                        }
                    }
                    else {
                        var errStr = "Unknown property, " + key
                                + ". Valid properties are:";
                        for ( var key in keys)
                            if (keys.hasOwnProperty(key))
                                errStr = errStr + " " + key;
                        throw new Error(errStr);
                    }
                }
            }
            for (var key in keys) {
                if (keys[key].requisite) {
                    if (!obj.hasOwnProperty(key) || !obj[key]) {
                        throw new Error(
                                format({text : "Parameter empty for {0}."},
                                       [key]));
                    }
                }
            }
        };
    })();

    /**
     *
     * Format an error message text.
     * 
     * @param {error} ERROR.KEY value above.
     * @param {substitutions}
     *                [array] substituted into the text.
     * @return the text with the substitutions made.
     */
    s.format = function(error, substitutions) {
        var text = error.text;
        if (substitutions) {
            var field, start;
            for (var i = 0; i < substitutions.length; i++) {
                field = "{" + i + "}";
                start = text.indexOf(field);
                if (start > 0) {
                    var part1 = text.substring(0, start);
                    var part2 = text.substring(start + field.length);
                    text = part1 + substitutions[i] + part2;
                }
            }
        }
        return text;
    };

    /**
     * Page Loader Bar.
     */
    var LoadingBar = function(options) {
        this.$html = $(".sog-loading-bar");
        this.options = $.extend({},
                LoadingBar.DEFAULTS, options);
    };
    /**
     * Page Loader default options.
     */
    LoadingBar.DEFAULTS = {
        pct : 0,
        delay : 1.3,
        wait : 0,
        before : function() {
        },
        finish : function() {
        },
        resetOnEnd : true
    };
    /**
     * Page Loader show.
     */
    LoadingBar.prototype.show = function(options) {
        if (typeof options === 'object')
            $.extend(this.options, options)
        else if (typeof options === 'number')
            this.options.pct = options;

        if (this.options.pct > 100)
            this.options.pct = 100;
        else if (this.options.pct < 0)
            this.options.pct = 0;

        if (this.$html.length == 0) {
            this.$html = $('<div class="sog-loading-bar progress-is-hidden"><span data-pct="0"></span></div>');
            s.$body.append(this.$html);
        }

        var $pct = this.$html.find('span'), currentPct = $pct.data('pct'), isRegress = currentPct > this.options.pct;

        this.options.before(currentPct);

        var _this = this;
        TweenMax.to($pct, _this.options.delay, {
            css : {
                width : _this.options.pct + '%'
            },
            delay : _this.options.wait,
            ease : isRegress ? Expo.easeOut : Expo.easeIn,
            onStart : function() {
                _this.$html.removeClass('progress-is-hidden');
            },
            onComplete : function() {
                var pct = $pct.data('pct');

                if (pct == 100 && _this.options.resetOnEnd) {
                    _this.hide();
                }

                _this.options.finish(pct);
            },
            onUpdate : function() {
                $pct.data('pct', parseInt($pct.get(0).style.width, 10));
            }
        });
    };
    /**
     * Page Loader hide.
     */
    LoadingBar.prototype.hide = function() {
        var $loadingBar = this.$html;
        $loadingBar.addClass('progress-is-hidden');
        var $pct = $loadingBar.find('span');
        $pct.width(0).data('pct', 0);
    };

    function toggles() {
        var $body = $('body');

        // Panel Close
        $body.on('click', '.panel a[data-toggle="remove"]', function(ev) {
            ev.preventDefault();
            var $panel = $(this).closest('.panel'), $parent = $panel.parent();
            $panel.remove();
            if ($parent.children().length == 0) {
                $parent.remove();
            }
        });

        // Panel Reload
        $body.on('click', '.panel a[data-toggle="reload"]', function(ev) {
            ev.preventDefault();

            var $panel = $(this).closest('.panel');

            // This is just a simulation, nothing is going to be reloaded
            $panel.append('<div class="panel-disabled"><div class="loader-1"></div></div>');

            var $pd = $panel.find('.panel-disabled');

            setTimeout(function() {
                $pd.fadeOut('fast', function() {
                    $pd.remove();
                });

            }, 500 + 300 * (Math.random() * 5));
        });

        // Panel Expand/Collapse Toggle
        $body.on('click', '.panel a[data-toggle="panel"]', function(ev) {
            ev.preventDefault();
            var $panel = $(this).closest('.panel');
            $panel.toggleClass('collapsed');
        });
    }

    s.$body = $('body');
    s.$html = $('.page-container');
    s.loadingBar = new LoadingBar();

    $(window).on('load', function () {
        toggles();
    });
    $(window).on('resize', function() {
        $(window).trigger('sog.resize');
    });

})((function() {
    if (!window.sog) {
        window.sog = {}
    }
    return window.sog;
})(), jQuery);
