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

