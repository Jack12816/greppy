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
};

/**
 * Extend Greppy framework base controller
 */
util.inherits(IndexController, greppy.get('http.mvc.controller'));

/**
 * Deliver the home page.
 *
 * @type {ControllerAction}
 * @public
 */
IndexController.prototype.actions.index =
{
    methods : ['GET'],
    action  : function(req, res) {

        // Render the view
        res.render('app/home');
    }
};

module.exports = IndexController;

