
    var SidebarMenu = function(s) {
        this.$html = $('>.sidebar-menu', s.$html);

        this.setupItems();
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
        var $items_with_subs = _this.$html.find('li:has(> ul)'),
            toggle_others = _this.$html.hasClass('toggle-others');

        $items_with_subs.filter('.active').addClass('expanded');

        $items_with_subs.each(function(i, el) {
            var $li = $(el),
                $a = $li.children('a'),
                $sub = $li.children('ul');

            $li.addClass('has-sub');

            $a.on('click', function(ev) {
                ev.preventDefault();

                if (toggle_others) {
                    _this.closeItemsSiblings($li);
                }

                if ($li.hasClass('expanded') || $li.hasClass('opened'))
                    _this.collapseItem($li, $sub);
                else
                    _this.expandItem($li, $sub);
            });
        });
    };
    SidebarMenu.prototype.closeItemsSiblings = function($li) {
        var _this = this;
        $li.siblings().not($li).filter('.expanded, .opened').each(function(i, el)
                {
                    var $_li = jQuery(el),
                        $_sub = $_li.children('ul');
                    
                    sidebar_menu_item_collapse($_li, $_sub);
                });
    };
    SidebarMenu.prototype.collapseItem = function($li, $sub) {
        var _this = this;
        if($li.data('is-busy'))
            return;
        
        var $sub_items = $sub.children();
        
        $li.removeClass('expanded').data('is-busy', true);
        $sub_items.addClass('hidden-item');
        
        TweenMax.to($sub, .2, {css: {height: 0}, onUpdate: _this.ps_update, onComplete: function()
        {
            $li.data('is-busy', false).removeClass('opened');
            
            $sub.attr('style', '').hide();
            $sub_items.removeClass('hidden-item');
            
            $li.find('li.expanded ul').attr('style', '').hide().parent().removeClass('expanded');
            
            _this.ps_update(true);
        }});
    };
    SidebarMenu.prototype.expandItem = function($li, $sub) {
        var _this = this;
        if($li.data('is-busy') || ($li.parent('.main-menu').length && _this.$html.hasClass('collapsed')))
            return;
            
        $li.addClass('expanded').data('is-busy', true);
        $sub.show();
        
        var $sub_items    = $sub.children(),
            sub_height  = $sub.outerHeight(),
            
            win_y            = jQuery(window).height(),
            total_height      = $li.outerHeight(),
            current_y        = _this.$html.scrollTop(),
            item_max_y      = $li.position().top + current_y,
            fit_to_viewpport  = _this.$html.hasClass('fit-in-viewport');
            
        $sub_items.addClass('is-hidden');
        $sub.height(0);
        
        
        TweenMax.to($sub, .2, {css: {height: sub_height}, onUpdate: _this.ps_update, onComplete: function(){ 
            $sub.height(''); 
        }});
        
        var interval_1 = $li.data('sub_i_1'),
            interval_2 = $li.data('sub_i_2');
        
        window.clearTimeout(interval_1);
        
        interval_1 = setTimeout(function()
        {
            $sub_items.each(function(i, el)
            {
                var $sub_item = jQuery(el);
                
                $sub_item.addClass('is-shown');
            });
            
            var finish_on = sm_transition_delay * $sub_items.length,
                t_duration = parseFloat($sub_items.eq(0).css('transition-duration')),
                t_delay = parseFloat($sub_items.last().css('transition-delay'));
            
            if(t_duration && t_delay)
            {
                finish_on = (t_duration + t_delay) * 1000;
            }
            
            // In the end
            window.clearTimeout(interval_2);
        
            interval_2 = setTimeout(function()
            {
                $sub_items.removeClass('is-hidden is-shown');
                
            }, finish_on);
        
            
            $li.data('is-busy', false);
            
        }, 0);
        
        $li.data('sub_i_1', interval_1),
        $li.data('sub_i_2', interval_2);
    };
    SidebarMenu.prototype.ps_update = function(destroy_init)
    {
        var _this = s.sidebarMenu;
        if(isxs())
            return;
            
        if(jQuery.isFunction(jQuery.fn.perfectScrollbar))
        {
            if(_this.$html.hasClass('collapsed'))
            {
                return;
            }
            
            _this.$html.find('.sidebar-menu-inner').perfectScrollbar('update');
            
            if(destroy_init)
            {
                _this.ps_destroy();
                _this.ps_init();
            }
        }
    };
    SidebarMenu.prototype.ps_init = function ()
    {
        var _this = this;
        if(isxs())
            return;
            
        if(jQuery.isFunction(jQuery.fn.perfectScrollbar))
        {
            if(_this.$html.hasClass('collapsed') || ! _this.$html.hasClass('fixed'))
            {
                return;
            }
            
            _this.$html.find('.sidebar-menu-inner').perfectScrollbar({
                wheelSpeed: 2,
                wheelPropagation: true
            });
        }
    };
    SidebarMenu.prototype.ps_destroy = function()
    {
        var _this = this;
        if(jQuery.isFunction(jQuery.fn.perfectScrollbar))
        {
            _this.$html.find('.sidebar-menu-inner').perfectScrollbar('destroy');
        }
    };