(function(window, $, undefined) {

    var SidebarMenu = function($html) {
        this.$html = $html;

        this._init();
        this.toggle();
    };
    SidebarMenu.prototype._init = function() {
        var _this = this;
        var $html = this.$html;
        if ($.isFunction($.fn.perfectScrollbar)) {
            if ($html.hasClass('collapsed') || !$html.hasClass('fixed')) {
                return;
            }

            $('.sidebar-menu-inner', $html).perfectScrollbar({
                wheelSpeed : 2,
                wheelPropagation : true
            });
        }
    };
    SidebarMenu.prototype.destroy = function() {
        var $html = this.$html;
        if ($.isFunction($.fn.perfectScrollbar)) {
            $('.sidebar-menu-inner', $html).perfectScrollbar('destroy');
        }
    };
    SidebarMenu.prototype.toggle = function() {
        var _this = this;
        var $html = this.$html;
        // Sidebar Toggle
        $('a[data-toggle="sidebar"]').each(function(i, el) {
            $(el).on('click', function(ev) {
                ev.preventDefault();

                if ($html.hasClass('collapsed')) {
                    $html.removeClass('collapsed');
                } else {
                    $html.addClass('collapsed');
                    // _this.destroy();
                }

                $(window).trigger('sog.resize');
            });
        });
    };

    // window.sog
    var s = {};
    s.$pageContainer = $('.page-container');
    s.$sidebarMenu = $('> .sidebar-menu', s.$pageContainer);
    s.sidebarMenu = new SidebarMenu(s.$sidebarMenu);

    window.sog = s;
})(window, jQuery);
