/*!
 * sog.js v1.0
 */

(function(window, $, undefined) {

    var SidebarMenu = function() {
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

    var PageFooter = function() {
        var $html = $('footer.main-footer', s.$html);
        this.$html = $html;
        this.$goTop = $('a[rel="go-top"]', $html);
        this._init();
    };
    PageFooter.prototype._init = function() {
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
    PageFooter.prototype.toBottom = function() {
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
                    'margin-top' : winHeight - contentHeight + 30
                });
            }
        }
    };

    var s = {
        breakpoints : {
            largescreen   : [ 991,  -1 ],
            tabletscreen  : [ 768, 990 ],
            devicescreen  : [ 420, 767 ],
            sdevicescreen : [   0, 419 ]
        },

        lastBreakpoint : null
    };
    s.$html = $('.page-container');
    s.sidebarMenu = new SidebarMenu();
    s.pageFooter = new PageFooter();
    s.pageFooter.toBottom();

    $(window).resize(function() {
        $(window).trigger('sog.resize');
    });
    $(window).on('sog.resize', function() {
        triggerResizable();
        s.pageFooter.toBottom();
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
})(window, jQuery);
