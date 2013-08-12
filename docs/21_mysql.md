### MySQL

Der dbReg MySQL Adapter basiert zum einen auf dem npm Package ``mysql`` und
auf dem ORM ``sequelize``. Sequelize bietet die Möglichkeiten Modelle, Migrationen,
Fixtures und Assoziationen zwischen den Modelle abzubilden bzw. zu verwalteten.

Im Weiteren wird auf die Besonderheiten dieses Backend Adapters eingegangen.

#### Models

Die Struktur einer Modeldefiniton sieht folgendermaßen aus:

    /**
     * Lease Model
     */
    module.exports = function(sequelize, DataTypes)
    {
        return sequelize.define(

            // Define name of the model
            'Lease',

            // Define all properties for the model
            {
                id: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                    autoIncrement: false
                },

                expires_at: {
                    type: DataTypes.DATE,
                }
            },

            // Specific Options for the model
            {
                underscored : true,
                charset     : 'utf8',
                collate     : 'utf8_general_ci',
                timestamps  : false
            }
        );
    }

Jedes Model erhält eine eigene Datei, die den Namen des Models trägt.

#### Migrations

Um bei dem vorangegangenen Beispiel des ``Lease`` Models zu bleiben, stelle
ich nun die Migration für diesen Fall vor:

    /**
     * Leases Migration
     */
    module.exports = {

        // Forward-migration method
        up: function(migration, DataTypes, done) {

            migration.createTable(

                // Define name of the table
                'Leases',

                // Define all columns for the table
                {
                    id: {
                        type          : DataTypes.STRING,
                        autoIncrement : false,
                        primaryKey    : true
                    },

                    expires_at: {
                        type         : DataTypes.DATE,
                        allowNull    : false
                    }
                },

                // Specific Options for the table
                {
                    engine  : 'InnoDB',
                    collate : 'utf8_general_ci'
                }

            ).complete(function(err) {
                done();
            });
        },

        // Backward-migration method
        down: function(migration, DataTypes, done) {

            migration.dropTable('Leases').complete(done);
        }
    }

Der Dateiname von Migrationen muss in folgendem Format sein:

    YYYYMMDDhhmmss-OPERATION_TABLE_DETAILED_OPERATION.js

Migrationen sind unter ``database/migrations/CONNECTION`` abzulegen.

#### Fixtures

Da Fixtures für Leases keinen Sinn machen, stelle ich als Beispiel für
Fixtures die des ``DataSource`` Models vor:

    /**
     * Fixtures for DataSources
     */
    module.exports = function(callback, payload)
    {
        chainer = new Sequelize.Utils.QueryChainer;

        dbReg.backend('mysql').get('CONNECTION').getORM(function(orm, models) {

            var dataSources = [
                {
                    source_id: 'b7bfa6bb-b121-4e4b-b97f-2de78655e5f2',
                    url: 'http://google.com/robots.txt',
                    creator_id: payload.users[0].id
                }
            ];

            dataSources.forEach(function(item) {
                chainer.add(models.DataSource.create(item));
            });

            chainer
                .run()
                .success(function(results) {
                    payload.dataSources = results;
                    callback && callback();
                })
                .error(function(err){callback && callback(err)});
        });
    }

Der Dateiname von Fixtures ist in folgendem Format zu spezifizieren:

    GROUP-modelName.js

Die ``group`` ist ein numerischer Wert, der Auskunft über die Abhängigkeiten
des Models gibt. Desto kleiner dieser Wert, desto eher wird die Fixture in
der Warteschlange ausgeführt. Beruht das Model ``DataSource`` also auf dem
``User`` Model, so wäre seine Gruppe höher als die vom User.

    00_user.js
    10_dataSource.js

Fixtures sind unter ``database/fixtures/CONNECTION`` abzulegen.


#### ORM

Der Zurgiff auf Sequelize als MySQL ORM gestaltet sich denkbar einfach
über die dbReg.

    dbReg.backend('mysql').get('CONNECTION').getORM(function(orm, models) {

        models.DataSource.find(1).success(function(record) {

            // Your application code here

        }).error(function(err) {

            // Do something usefull in case of errors
            log.error(err);
        });
    });

#### Weiterführende Dokumentationen

* Dokumentation zu ``mysql`` https://github.com/felixge/node-mysql/blob/master/Readme.md
* Dokumentation zu ``sequelize`` http://sequelizejs.com/documentation

