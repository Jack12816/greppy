/**
 * Greppy Frontend Application Class
 * @constructor
 */

var greppy = {};

greppy.Application = function()
{
}

/**
 * Start a bootstrap modal easily.
 *
 * @param {String|Object} body - Body of the modal
 * @param {Object} options - Options for the modal
 * @param {Array} buttons - Buttons declarations
 * @return void
 */
greppy.Application.prototype.dialog = function(body, options, buttons)
{
    var template = '<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">'
                    + '<div class="modal-dialog"><div class="modal-content"><div class="modal-header">'
                    + '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'
                    + '{{header}}'
                    + '</div>'
                    + '<div class="modal-body">'
                    + '</div>'
                    + '<div class="modal-footer">'
                    + '</div></div></div></div>';

    options = options || {};
    options.header = options.header || 'Confirmation requested';

    template = template.replace(
        '{{header}}', '<h4 class="modal-title">' + options.header + '</h4>'
    );

    var modal = $(template);

    // Inject the body
    modal.find('.modal-body').html(body);

    buttons = buttons || [
        {
            label    : 'Cancel',
            class    : 'btn btn-default',
            icon     : 'icon-remove',
            callback : options.cancel || function(callback) {callback();}
        },
        {
            label    : 'Ok',
            class    : 'btn btn-primary',
            icon     : 'icon-ok',
            callback : options.ok || function(callback) {callback();}
        }
    ];

    buttons.forEach(function(btn) {

        var btnObj = $('<a href="#" class="' + btn.class + '">'
                        + '<i class="' + btn.icon + '"></i> '
                        + btn.label
                        + '</a>');

        // Bind callbacks
        btnObj.click(function() {
            btn.callback(function() {
                modal.modal('hide');
            });
            return false;
        });

        modal.find('.modal-footer').append(btnObj);
    });

    $("body").append(modal);

    modal.modal({
        keyboard : true,
        show     : true
    });

    modal.on('hidden.bs.modal', function() {
        modal.remove();
    });

    modal.on('shown.bs.modal', function() {
        modal.find('input:first').focus();
    });
}

/**
 * @constructor
 */
greppy.DataGrid = function(table, options)
{
    this.table    = table;
    this.search   = new greppy.Search(this, table);
    this.sort     = new greppy.Sort(this, table);
    this.paginate = new greppy.Paginator(this, table);
    this.options  = options;

    this.options.softDeletion = ('undefined' !== typeof options.softDeletion) ?
                                    options.softDeletion : true;

    // Wrap twitter bs events to prevent race conditions
    $('.btn').on({
        change : function(e) {
            setTimeout(function() {
                $(e.currentTarget).trigger('lateChange');
            }, 20);
        }
    });
}

/**
 * Build URL with given params.
 *
 * @params {Array} params - Parameters to add to the request
 * @return void
 */
greppy.DataGrid.prototype.buildUrl = function(params)
{
    var self = this;
    var url  = document.URL;
    params   = params || [];

    if (this.options.softDeletion) {

        if (true == $('#search-trash label').hasClass('active')) {

            params.unshift({
                name: 'filter',
                value: 'trash'
            });
        }
    }

    if (-1 === document.URL.indexOf('?')) {
        url += '?';
    }

    params.forEach(function(param) {
        url += ('&' + param.name + '=' + encodeURIComponent(param.value));
    });

    return url;
}

/**
 * Perform an AJAX request to load table rows
 * and fill the table with the results.
 *
 * @return void
 */
greppy.DataGrid.prototype.loadAndRebuild = function(params)
{
    var self = this;
    params   = params || [];
    params.unshift({name: 'render', value: 'rows'});

    this.paginate.load();

    $.ajax({
        type : "GET",
        url  : this.buildUrl(params)
    }).done(function(data) {
        self.table.find('tr').not(':first').remove();
        self.table.find('tbody').append(data);
    });
}

/**
 * Reset all filters.
 *
 * @return void
 */
greppy.DataGrid.prototype.reset = function()
{
    this.loadAndRebuild([]);
    this.paginate.load(1);
}

/**
 * Load by all settings.
 *
 * @return void
 */
greppy.DataGrid.prototype.load = function()
{
    var params = [];

    params = params.concat(this.search.getParameters());
    params = params.concat(this.sort.getParameters());
    params = params.concat(this.paginate.getParameters());

    this.loadAndRebuild(params);
}

/**
 * @constructor
 */
greppy.Search = function(datagrid, datagridElement)
{
    var self             = this;
    this.datagrid        = datagrid;
    this.datagridElement = datagridElement;
    this.input           = $('#search-input');
    this.trash           = $('#search-trash');

    // Setup datagrid table headers
    this.datagridElement.find($('th[data-property]')).each(function (idx, itm) {

        var th = $(itm);
        th.html($('<span>&nbsp;' + th.text() + '&nbsp;</span>'))
        th.prepend($('<i class="search-trigger icon-search text-muted"></i>'));
    });

    // Bind events

    // Search or trash button clicked
    $('#search-trash').on('lateChange', function() {self.datagrid.load();});
    $('#search-btn').on('click', function() {self.datagrid.load();});

    // Search selector clicked
    $('.search-trigger').on('click', function() {
        var cur = $(this).parent();
        self.settings(cur.attr('data-property'), cur.text());
        $('#search-input').focus();
    });

    // Clear search button clicked
    $('#search-clear').on('click', function() {
        self.clear();
        self.settings('fuzzy');
        self.datagrid.reset();
    });

    // Pressed enter on search box
    $('#search-input').keypress(function(event){
        if (event.keyCode == 13) {
            $('#search-btn').trigger('click');
        }
    });
}

/**
 * Apply the search box settings.
 *
 * @params {String} property - Name of the property to search for
 * @params {String} placeholder - Placeholder of the search box
 * @return void
 */
greppy.Search.prototype.settings = function(property, placeholder)
{
    if ('fuzzy' == property) {
        placeholder = 'Fuzzy search';
    } else {
        placeholder = 'Search for' + placeholder.toLowerCase();
    }

    this.input.attr('placeholder', placeholder + '..')
              .attr('data-property', property);
}

/**
 * Clear the search box.
 *
 * @return void
 */
greppy.Search.prototype.clear = function()
{
    this.input.val('');
}

/**
 * Get all relevant parameters.
 *
 * @return void
 */
greppy.Search.prototype.getParameters = function()
{
    var params = [];

    if ('' == this.input.val()) {
        return params;
    }

    var params = params.concat([
        {name: 'search', value: this.input.val()},
        {name: 'sprop', value: this.input.attr('data-property')}
    ]);

    return params;
}

/**
 * @constructor
 */
greppy.Sort = function(datagrid, datagridElement)
{
    var self             = this;
    this.datagrid        = datagrid;
    this.datagridElement = datagridElement;

    // Bind events

    // Table header clicked
    this.datagridElement.find($('th[data-property] span')).on('click', function() {
        self.toggle($(this).parent());
    });
}

/**
 * Toggle the sorting of a column.
 *
 * @params {Object} th - Table header to toggle
 * @return void
 */
greppy.Sort.prototype.toggle = function(th)
{
    this.datagridElement.find($('th[data-property]')).not(th).each(function(idx, item) {
        item = $(item);
        item.find('.direction').remove();
        item.attr('data-sort', '');
    });

    var dir = th.attr('data-sort');

    if (!dir) {
        th.append($('<i class="direction text-muted icon-arrow-down"></i>'));
        th.attr('data-sort', 'asc');
    }

    if ('asc' === dir) {
        th.find('.direction').removeClass('icon-arrow-down').addClass('icon-arrow-up');
        th.attr('data-sort', 'desc');
    }

    if ('desc' === dir) {
        th.find('.direction').remove();
        th.attr('data-sort', '');
    }

    if (!th.attr('data-sort')) {
        return this.datagrid.reset();
    }

    this.datagrid.load();
}

/**
 * Get all relevant parameters.
 *
 * @return void
 */
greppy.Sort.prototype.getParameters = function()
{
    var th = this.datagridElement.find($('th[data-property]')).not($('[data-sort=""]'));

    if (0 === th.length || !th.attr('data-sort') || '' == th.attr('data-sort')) {
        return [];
    }

    return [
        {name: 'order', value: th.attr('data-sort')},
        {name: 'oprop', value: th.attr('data-property')}
    ]
}

/*
 * @constructor
 */
greppy.Paginator = function(datagrid, datagridElement)
{
    var self             = this;
    this.datagrid        = datagrid;
    this.datagridElement = datagridElement;
    this.page            = 1;

    // Bind events

    // Page clicked
    $(document).on('click', '.pagination a[data-page]', function() {
        self.page = $(this).attr('data-page');
        self.datagrid.load();
        self.load();
    });

    // Page limit changed
    $(document).on('change', '#pagination-limit', function() {
        self.page = $(this).attr('data-page');
        self.datagrid.load();
        self.load();
    });

    // Keyboard usage events
    $(document).keydown(function(e) {

        // Left arrow pressed
        if (37 == e.keyCode) {
            self.page = (self.page > 0) ? self.page-1 : 1;
            self.datagrid.load();
            self.load();
        }

        // Right arrow pressed
        if (39 == e.keyCode) {

            var maxPage = 1;

            $('.pagination a[data-page]').each(function(idx, itm) {
                var val = parseInt($(itm).attr('data-page'));
                maxPage = (maxPage < val) ? val : maxPage;
            });

            self.page = (self.page < maxPage) ? self.page+1 : self.page;
            self.datagrid.load();
            self.load();
        }

        // Quick jump to page event (g)
        if (71 == e.keyCode) {

            greppy.app.dialog(
                [
                    '<div class="col-lg-5">',
                    '<input autofocus="autofocus" class="form-control" id="page-to-jump" ',
                    ' name="page-to-jump" type="number" placeholder="Page to jump to ..">',
                    '</div><br />',
                ].join(''),
                {
                    header: 'Quick page jump',
                    ok: function(callback) {

                        self.page = parseInt($('#page-to-jump').val());
                        self.datagrid.load();
                        self.load();

                        callback && callback();
                    }
                }
            );
        }
    });
}

/**
 * Load the pagination partial.
 *
 * @param {Integer} [page] - Page number to load
 * @return void
 */
greppy.Paginator.prototype.load = function(page)
{
    var params = [];

    params = params.concat(this.datagrid.search.getParameters());
    params = params.concat(this.datagrid.sort.getParameters());
    params = params.concat(this.datagrid.paginate.getParameters(page));

    params.unshift({name: 'render', value: 'pagination'});

    $.ajax({
        type : "GET",
        url  : this.datagrid.buildUrl(params)
    }).done(function(data) {
        $('.paginator').html(data);
    });
}

/**
 * Get all relevant parameters.
 *
 * @param {Integer} [page] - Page number to load
 * @return void
 */
greppy.Paginator.prototype.getParameters = function(page)
{
    return [
        {name: 'page', value: page || this.page},
        {name: 'limit', value: $('#pagination-limit :selected').val()}
    ]
}

greppy.app = new greppy.Application()

