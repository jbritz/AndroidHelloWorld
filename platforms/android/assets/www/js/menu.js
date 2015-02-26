$(function() {
    $('#menu').mmenu({
        onClick: {
            blockUI: false,
            preventDefault: function() {
                return this.rel != 'external';
            }
        }
    }, {
        pageSelector: 'div[data-role="page"]:first'
    });

    $('#menu a[rel!="external"]').on(
        'click',
        function() {
            var _t = this;
            $('#menu').one(
                'closed.mm',
                function() {
                    $.mobile.changePage(_t.href, {
                        transition: 'slide'
                    });
                }
            );
        }
    );
});

$(document).on(
    'pageshow',
    function(e, ui) {
        $('#menu').trigger('setPage', [$(e.target)]);
        $('#menu a').each(
            function() {
                if ($.mobile.path.parseUrl(this.href).href == window.location.href) {
                    $(this).trigger('setSelected.mm');
                }
            }
        );
    }
);