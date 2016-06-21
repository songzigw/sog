/*!
 * 
 * sog.js
 * 
 * @author  zhangsong
 * @since   0.1->0.3->1.0
 * @version 1.1
 * 
 */

(function(s, $, undefined) {

    'use strict';

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

    var SidebarMenu = function(s) {
        var $html = $('>.sidebar-menu', s.$html);
        this.$html = $html;

        this._init();
    };
    SidebarMenu.prototype._init = function() {
        var _this = this, $html = _this.$html;
        if (!$html.hasClass('collapsed')) {
            _this.scroll();
        }

        // Sidebar Toggle
        $('a[data-toggle="sidebar"]').each(function(i, el) {
            $(el).on('click', function(ev) {
                ev.preventDefault();

                _this.collapsed();
                $(window).trigger('sog.resize');
            });
        });

        // Mobile User Info Menu Trigger
        $('a[data-toggle="user-info-menu"]').on('click', function(ev) {
            ev.preventDefault();

            $('nav.navbar.user-info-navbar').toggleClass('mobile-is-visible');
        });

        // Mobile Menu Trigger
        $('a[data-toggle="mobile-menu"]').on('click', function(ev) {
            ev.preventDefault();

            $('.main-menu', $html).toggleClass('mobile-is-visible');
        });
    };
    SidebarMenu.prototype.destroy = function() {
        var $html = this.$html;
        if ($.isFunction($.fn.perfectScrollbar)) {
            $('.sidebar-menu-inner', $html).perfectScrollbar('destroy');
        }
    };
    SidebarMenu.prototype.scroll = function() {
        var $html = this.$html;
        $('.sidebar-menu-inner', $html).perfectScrollbar({
            wheelSpeed : 2,
            wheelPropagation : true
        });
    };
    SidebarMenu.prototype.collapsed = function() {
        var _this = this, $html = _this.$html;
        if ($html.hasClass('collapsed')) {
            $html.removeClass('collapsed');
            _this.scroll();
        } else {
            $html.addClass('collapsed');
            _this.destroy();
        }
    };

    var MainContent = function(s) {
        var $html = $('.main-content', s.$html);
        this.$html = $html;
    };

    var MainFooter = function(mainContent) {
        var $html = $('footer.main-footer', mainContent.$html);
        this.$html = $html;
        this.$goTop = $('a[rel="go-top"]', $html);
        this._init();
    };
    MainFooter.prototype._init = function() {
        this.$goTop.on('click', function(ev) {
            ev.preventDefault();

            var obj = {
                pos : $(window).scrollTop()
            };

            TweenLite.to(obj, .3, {
                pos : 0,
                ease : Power4.easeOut,
                onUpdate : function() {
                    $(window).scrollTop(obj.pos);
                }
            });
        });
    };
    MainFooter.prototype.toBottom = function() {
        var _this = this,
            $mainContent = $('.main-content', s.$html),
            $sidebarMenu = s.sidebarMenu.$html;

        _this.$html.add($mainContent)
                   .add($sidebarMenu).attr('style', '');

        if (isxs()) {
            return false;
        }

        if (_this.$html.hasClass('sticky')) {
            var winHeight = $(window).height(),
                footerHeight = _this.$html.outerHeight(true),
                contentHeight = _this.$html.position().top + footerHeight;

            var mTop = _this.$html.css('margin-top');
            if (winHeight > contentHeight - parseInt(mTop, 10)) {
                _this.$html.css({
                    'margin-top' : winHeight - contentHeight + 20
                });
            }
        }
    };

    s.breakpoints = {
        largescreen   : [ 991,  -1 ],
        tabletscreen  : [ 768, 990 ],
        devicescreen  : [ 420, 767 ],
        sdevicescreen : [   0, 419 ]
    };
    s.lastBreakpoint = null;
    s.$html = $('.page-container');
    s.sidebarMenu = new SidebarMenu(s);
    s.mainContent = new MainContent(s);
    s.mainFooter = new MainFooter(s.mainContent);
    s.mainFooter.toBottom();

    $(window).resize(function() {
        $(window).trigger('sog.resize');
    });
    $(window).on('sog.resize', function() {
        triggerResizable();
        s.mainFooter.toBottom();
    });

    /**
     * Main Function that will be called each
     * time when the screen breakpoint changes.
     */
    function resizable(breakpoint) {
        var sb_with_animation;

        // Large Screen Specific Script
        if (is('largescreen')) {

        }

        // Tablet or larger screen
        if (ismdxl()) {
        }

        // Tablet Screen Specific Script
        if (is('tabletscreen')) {
        }

        // Tablet device screen
        if (is('tabletscreen')) {
            s.sidebarMenu.collapsed();
        }

        // Tablet Screen Specific Script
        if (isxs()) {
        }
    }

    /** Functions */

    // Get current breakpoint
    function currentBreakpoint() {
        var width = $(window).width(), breakpoints = s.breakpoints;

        for ( var breakpont_label in breakpoints) {
            var bp_arr = breakpoints[breakpont_label],
                min = bp_arr[0], max = bp_arr[1];

            if (max == -1)
                max = width;

            if (min <= width && max >= width) {
                return breakpont_label;
            }
        }

        return null;
    }

    // Check current screen breakpoint
    function is(screen_label) {
        return currentBreakpoint() == screen_label;
    }

    // Is xs device
    function isxs() {
        return is('devicescreen') || is('sdevicescreen');
    }

    // Is md or xl
    function ismdxl() {
        return is('tabletscreen') || is('largescreen');
    }

    // Trigger Resizable Function
    function triggerResizable() {
        if (s.lastBreakpoint != currentBreakpoint()) {
            s.lastBreakpoint = currentBreakpoint();
            resizable(s.lastBreakpoint);
        }
    }

    window.sog = s;
})((function() {
    if (!window.sog) {
        window.sog = {}
    }
    return window.sog;
})(), jQuery);
