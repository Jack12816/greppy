## MySQL

### Get a plain MySQL Connection

    greppy.db.get('mysql.demo').instance.getConnection(function(err, con) {
        console.log(con);
    });

### Get the MySQL ORM - Sequelize

    greppy.db.get('mysql.demo').getORM(function(orm, models) {
        console.log(orm);
        console.log(models);
    });

### Fetch groups of entities in parallel

    greppy.helper.get('db.sql.entities').fetchGroups([
        {
            name: "groupName1",
            criteria: {
                where: {deleted_at: null}
            },
            models: [
                models.Product,
                models.Portal
            ]
        }
    ], function(err, groups) {

        console.log(groups);
    });

### Fetch all entities in parallel

    greppy.db.get('mysql.mdc').getORM(function(orm, models) {

        greppy.helper.get('db.sql.entities').fetchAll([
            models.Product,
            models.Portal,
            models.Operator
        ], function(err, entities) {

            console.log(entities);
        });
    });

