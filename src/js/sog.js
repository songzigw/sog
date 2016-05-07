(function(window, $, undefined) {

    var SidebarMenu = function($html) {
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

    // window.sog
    var s = {};
    s.$pageContainer = $('.page-container');
    s.$sidebarMenu = $('> .sidebar-menu', s.$pageContainer);
    s.sidebarMenu = new SidebarMenu(s.$sidebarMenu);

    window.sog = s;
})(window, jQuery);
