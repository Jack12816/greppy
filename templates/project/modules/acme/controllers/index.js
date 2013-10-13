/**
 * Index Controller
 *
 * @module acme-app/acme/controller/index
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

/**
 * @constructor
 */
var IndexController = function()
{
    // Call the super constructor
    IndexController.super_.call(this);

    // Define the path to look for views
    this.viewPath = 'index/';
};

/**
 * Extend Greppy framework base controller
 */
util.inherits(IndexController, greppy.get('http.mvc.controller'));

/**
 * Build the controller instance
 */
IndexController = new IndexController();

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
        res.render(self.view('index'), function(err, html) {

            if (err) {
                res.render('error/notfound-layout');
            }

            res.end(html);
        });
    }
};

module.exports = IndexController;

