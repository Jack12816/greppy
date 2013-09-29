# Model/Module-Controller-View

We designed our framework to implement the MVC (Model-View-Controler)
pattern with the help of the Express framework and our application
structure.

Greppy is a top-layer overlay for Express and extends the functionality
of it. So we support encapsulation of controllers into namespaces (called
modules) and an uniform loading mechanism for them.

## Structures of modules

We split the resources of modules into separate sub-directories to ensure
a clean encapsulation of file types. The following is a sample structure:

    .
    ├── controllers
    │   └── index.js
    ├── helpers
    │   ├── controller
    │   ├── fetchers
    │   ├── requests
    │   │   └── github.js
    │   └── view
    ├── models
    │   └── connection
    │       └── DataSource.js
    └── resources
        └── views
            ├── index
            │   └── index.jade
            ├── layout.jade
            └── layout.json

Any module of Greppy should look like this. You can define any kind of
files in a module, as long as it fits in this namespace.

## Working with controllers

Lets look at a simple index controller, which will only render a view without
pushing data to it.

    /**
     * Index Controller
     *
     * @module demo/controller/index
     * @author Hermann Mayer <hermann.mayer92@gmail.com>
     */

    /**
     * @constructor
     */
    var IndexController = function()
    {
        // Call the super constructor
        IndexController.super_.call(this);
    };

    /**
     * Extend Greppy framework base controller
     */
    util.inherits(IndexController, greppy.get('http.mvc.controller'));

    /**
     * Build the controller instance
     */
    module.exports = IndexController = new IndexController();

    /**
     * Deliver the home page.
     *
     * @type {ControllerAction}
     * @public
     */
    IndexController.actions.index =
    {
        methods : ['GET'],
        action  : function(req, res) {

            // Render the view
            res.render('app/home');
        }
    };

## Working with views

A view can be defined as Jade or any templating engine you want. You just
have to configure it in the worker context. A simple example for the previous
declared controller action could look like this:

    h2 Hello World
      a.pull-right(onclick="history.back();", title="Zurück").btn
        i.icon-arrow-left

    p
      | This would be a long paragraph.
      | Over many lines.

## Helpers

### Working with helpers

Helpers are a blessing for sharing code and functionality across multiple
modules of your application. So you can use parts of your service right
inside of your admin module without reimplementing the functionality.

Helpers can be encapsulated and separated into namespaces under the helpers
directory of your model. The previously shown module directory structure got
a ``github`` helper, located in a ``request`` namespace. To access this helper,
the following code will do the trick:

    var helper = greppy.helper.get('admin.requests.github');

If you plan to put helpers directly in the modules helpers directory, you
can access them this way:

    var helper = greppy.helper.get('admin.helperName');

Greppy ships with some predefined helper sets for many common needs.
Accessing these is basically the same:

    var helper = greppy.helper.get('controller.error');

You just don't specify the module name.

To get an overview of all defined helpers, use the
``list()`` method of the helper store. Just call it this way:

    var helperNames = greppy.helper.list();

### Define own helpers

A sample helper could look like this:

    /**
     * Test Helper
     *
     * @module demo/helper/test
     * @author Hermann Mayer <hermann.mayer92@gmail.com>
     */

    /**
     * @constructor
     */
    var TestHelper = function()
    {
    }

    /**
     * Just prefix the given string with a test tag.
     *
     * @param {String} str - String to prefix with test
     * @return {String}
     */
    TestHelper.prototype.test = function(str)
    {
        return '[Test] ' + str;
    }

    module.exports = TestHelper;

The defined helper ``test`` got a method ``test(str)``.

## Additional documentation

* Documentation for ``express`` http://expressjs.com/api.html
* Documentation for ``jade`` http://jade-lang.com/tutorial/

