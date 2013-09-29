### MongoDB

The db-Store MongoDB adapter is based on the npm package ``mongodb`` and on the
``mongoose`` ORM. Mongoose offers the possibility to describe schemas and manage models.
The adapter got functionality to perform migrations and loading fixtures.

Next we will describe the features of this backend adapter.

#### Models

The structure of a model definition looks like the following:

    /**
     * User model
     */

    var User = new Schema({

        role_id: {
            type: Number,
            default: 1
        },

        fullname: {
            type: String
        },

        email: {
            type: String,
            index: true
        },

        password: {
            type: String
        },

        deleted_at: {
            type: Date,
            default: null
        }
    });

    module.exports = User;

You are free to ``require()`` other schemas to build associations, load plugins
or do some validation stuff which is supported by Mongoose at this point.
Every model is represented by it's own file, which is named after the model.

#### Migrations

Migrations are very useful if you don't want to use Mongoose, but still
need to create indexes or do some other stuff like manipulating your datasets.
A simple example for a migration could be the following:

    /**
     * Users Migration
     */
    module.exports = {

        // Forward-migration method
        up: function(db, orm, done)
        {
            db.collection('users', function(err, collection) {

                if (err) {
                    return done(err);
                }

                collection.ensureIndex({
                    'email': 1,
                    'fullname': 1
                }, {
                    name: 'email_fullname',
                    unique: true,
                    background: true
                }, done);
            });
        },

        // Backward-migration method
        down: function(db, orm, done)
        {
            db.collection('users', function(err, collection) {

                if (err) {
                    return done(err);
                }

                collection.dropIndex('email_fullname', done);
            });
        }
    }

The filename of migrations must be in the following format:

    YYYYMMDDhhmmss-OPERATION_TABLE_DETAILED_OPERATION.js

Migrations are deployed under the path ``database/migrations/CONNECTION``.

#### Fixtures

An application without data is most often very useless, so you surely want
to prepare a set of documents, which will be inserted if you rebuild the
whole database. Here's an easy example for a user fixture:

    /**
     * Fixtures for Users collection
     */
    module.exports = function(orm, models, share, utils, callback)
    {
        var records = [
            {
                "role_id"  : 1,
                "fullname" : "Hermann Mayer",
                "email"    : "hermann.mayer92@gmail.com",
                "password" : "894904fa3048a795284a51233792f737"
            },
            {
                "role_id"  : 1,
                "fullname" : "Patrick Jaksch",
                "email"    : "mail@deadly-silence.de",
                "password" : "c4ef76b05908a729f4f857ddee667c14"
            }
        ];

        async.map(records, function(record, callback) {

            models.User.create(record, function (err, savedUser) {

                if (err) {
                    return callback && callback(err);
                }

                callback && callback(null, record);
            });

        }, function(err, records) {

            if (err) {
                return callback && callback(err);
            }

            share.Users = records;
            callback && callback();
        });
    }

The filename of fixtures needs to be in the following format:

    GROUP-modelName.js

The ``GROUP`` is a numeric value, which shows the dependencies of the model.
The smaller this value, the earlier the fixture will be queued.
Fixtures need to be deployed under ``database/fixtures/CONNECTION``.

#### ORM

The access to Mongoose is pretty easy with the db-Store.

    greppy.db.get('mongodb.demo').getORM(function(orm, models) {

        models.User.findOne({'fullname': 'Test User'}, function(err, document) {

            if (err) {
                // Do something usefull in case of errors
                return log.error(err);
            }

            // Your application code here
        });
    });

#### Further documentation

* Documentation of ``mongodb`` http://mongodb.github.io/node-mongodb-native/
* Documentation of ``mongoose`` http://mongoosejs.com/docs/guide.html

