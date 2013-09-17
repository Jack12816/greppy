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

