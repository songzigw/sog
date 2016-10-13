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

        this._init();
        this.setupItems();
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
        var $h = this.$html;
        if ($.isFunction($.fn.perfectScrollbar)) {
            $('.sidebar-menu-inner', $h).perfectScrollbar('destroy');
        }
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
    SidebarMenu.prototype.scroll = function() {
        var $html = this.$html;
        $('.sidebar-menu-inner', $html).perfectScrollbar({
            wheelSpeed : 2,
            wheelPropagation : true
        });
    };
    SidebarMenu.prototype.setupItems = function() {
        var _this = this;
        var $itemsSub = _this.$html.find('li:has(> ul)'),
            toggleOthers = _this.$html.hasClass('toggle-others');
        $itemsSub.filter('.active').addClass('expanded');
        
        $itemsSub.each(function(i, el) {
            var $li = $(el),
            $a = $li.children('a'),
            $sub = $li.children('ul');
            
            $li.addClass('has-sub');
            
            $a.on('click', function(ev) {
                ev.preventDefault();
                if (toggleOthers) {
                    _this.closeItemsSiblings($li);
                }
                if ($li.hasClass('expanded') || $li.hasClass('opened')) {
                    _this.collapseItems($li, $sub);
                } else {
                    _this.expandedItems($li, $sub);
                }
            });
        });
    };
    SidebarMenu.prototype.closeItemsSiblings = function($li) {
        var _t = this;
        //$li.siblings().not($li);
    };
    SidebarMenu.prototype.collapseItems = function($li, $sub) {
        var _t = this;
        if ($li.data('is-busy')) return;
        
        var $subItems = $sub.children();
        
        $li.removeClass('expanded').data('is-busy', true);
        $subItems.addClass('hidden-item');
        
        TweenMax.to($sub, .2, {css: {height: 0},
            onUpdate: function() {},
            onComplete: function() {
                $li.data('is-busy', false).removeClass('opened');
                $sub.attr('style', '').hide();
                $li.find('li.expanded ul').attr('style', '')
                .hide().parent().removeClass('expanded');
            }});
    };
    SidebarMenu.prototype.expandedItems = function($li, $sub) {
        
    };
    

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

        if (isScreenXs()) {
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
    
    function isScreenXs() {
        return isScreen('devicescreen') || isScreen('sdevicescreen');
    }
    
    function isScreenMdXl() {
        return isScreen('tabletscreen') || isScreen('largescreen');
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
