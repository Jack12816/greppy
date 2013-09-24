## MongoDB

### Simple insert into a collection

    greppy.db.get('mongodb.demo').instance.collection('keys', function(err, collection) {

        collection.insert({
            name: 'key',
            value: 'value'
        }, function(err, inserted) {

            console.log(err);
            console.log(inserted);
        });
    });

### Find one document by it's ObjectID

    var connection = greppy.db.get('mongodb.demo');

    connection.instance.collection('keys', function(err, collection) {

        collection.findOne({
            _id: new connection.backend.mongo.BSONPure.ObjectID("5239b32f7cfced1c30e4b4b1")
        }, function(err, result){

            console.log(err, result);
        });
    });

### Insert a document with mongoose

    greppy.db.get('mongodb.demo').getORM(function(orm, models) {

        models.User.create({
            fullname : "Test User",
            email    : "user@domain.tld",
            password : "test"
        }, function (err, savedUser) {

            if (err) {
                return console.log(err);
            }

            console.log('Saved.');
        });
    });

