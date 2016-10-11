/*!
 * 
 * sog-frame.js
 * 
 * @author  zhangsong
 * @since   0.5.1
 * @version 0.5.1
 * 
 */

(function(s, $) {

    'use strict';
    
    /**
     * SidebarMenu
     */
    var SidebarMenu = function(s) {
        this.$html = $('>.sidebar-menu', s.$html);
    }

    /**
     * MainContent
     */
    var MainContent = function(s) {
        var $html = $('.main-content', s.$html);
        this.$html = $html;
    };

    /**
     * MainCenter
     */
    var MainCenter = function(mainContent) {
        var $html = $('#main_center', mainContent.$html);
        this.$html = $html;
    };

    /**
     * MainFooter
     */
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
            $mainContent = s.mainContent.$html,
            $sidebarMenu = s.sidebarMenu.$html;

        _this.$html.add($mainContent)
                   .add($sidebarMenu).attr('style', '');

        if (isScreen('sdevicescreen') || isScreen('devicescreen')) {
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

    // Component instantiate
    s.sidebarMenu = new SidebarMenu(s);
    s.mainContent = new MainContent(s);
    s.mainCenter = new MainCenter(s.mainContent);
    s.mainFooter = new MainFooter(s.mainContent);
    window.setTimeout(function() {
        s.mainFooter.toBottom();
    }, 1000);

    // Screen self-adaption
    
    /**
     * Media screen breakpoints.
     */
    s.breakpoints = {
        largescreen   : [ 991, -1 ],
        tabletscreen  : [ 768, 990 ],
        devicescreen  : [ 420, 767 ],
        sdevicescreen : [ 0, 419 ]
    };
    s.lastBreakpoint = null;
    
    /**
     * Get current breakpoint
     */
    function currentBreakpoint() {
        var width = $(window).width(),
            breakpoints = s.breakpoints;

        for (var breakpoint in breakpoints) {
            var bp_arr = breakpoints[breakpoint],
                min = bp_arr[0], max = bp_arr[1];

            if (max == -1)
                max = width;

            if (min <= width && max >= width) {
                return breakpoint;
            }
        }

        return null;
    }

    // Trigger Resizable Function
    function triggerResizable() {
        if (s.lastBreakpoint != currentBreakpoint()) {
            s.lastBreakpoint = currentBreakpoint();
            resizable(s.lastBreakpoint);
        }
        s.mainFooter.toBottom();
    }

    // Check current screen breakpoint
    function isScreen(screenLabel) {
        return currentBreakpoint() == screenLabel;
    }

    /**
     * Main Function that will be called each
     * time when the screen breakpoint changes.
     */
    function resizable(breakpoint) {
        // Tablet device screen
        if (isScreen('tabletscreen')) {
            s.sidebarMenu.collapsed();
        }
    }
    
    $(window).on('sog.resize', function() {
        triggerResizable();
    });
    
})((function() {
    if (!window.sog) {
        window.sog = {}
    }
    return window.sog;
})(), jQuery);
