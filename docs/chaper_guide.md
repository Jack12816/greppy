# Greppy Framework Documentation

Dieses Dokument stellt die Dokumentation des Unister Node.js Frameworks
dar und geht detailiert auf Konzepte und Paradigmen in der Entwicklung
mit dieser Software ein.

Autor dieses Dokumentes ist Hermann Mayer <hermann.mayer@unister.de>.
Unklarheiten, Verbesserungsvorschläge und Feedback sollten an ihn gerichtet
werden, da er der Maintainer und Core-Entwickler des Frameworks ist.

# Applikationsstruktur

Die Applikationsstruktur setzt sich aus einer logischen Kapselung
der Zuständigkeiten und Namensräume einer Applikation zusammen.
Ein gekürzter Auszug der Applikationsstruktur veranschaulicht
die folgenden Erklärungen zur Struktur.

    .
    ├── app
    │   ├── config
    │   │   ├── certs
    │   │   ├── application.js
    │   ├── worker
    │   │   ├── admin.js
    │   │   └── service.js
    │   ├── server.js
    │   └── worker.js
    ├── bin
    ├── database
    │   ├── fixtures
    │   └── migrations
    ├── docs
    ├── modules
    │   ├── admin
    │   │   ├── controllers
    │   │   ├── helpers
    │   │   ├── models
    │   │   └── resources
    │   └── service
    │       ├── controllers
    │       ├── helpers
    │       └── services
    ├── public
    │   ├── css
    │   ├── font
    │   ├── img
    │   ├── js
    │   └── favicon.ico
    ├── tests
    ├── var
    │   ├── cache
    │   ├── logs
    ├── package.json
    └── README.md

## Aufschlüsselung der Verzeichnisse


* ``package.json`` Package Metadata Beschreibung die u.a. auch
Abhängigkeiten zu anderen Packages auflistet.
Siehe: http://package.json.nodejitsu.com/

* ``README.md`` Ein "Getting Startet" Dokument, dass Workflows
beschreibt und einem neuen Entwickler als Einstieg dient.

* ``bin/`` Das Scripts-Verzeichnis enthält Skripte zum Starten
und Stoppen der Applikation oder Skripte für Maintenance Aufgaben.

* ``app/`` Applikations-Verzeichnis.

    * ``config/`` Config-Verzeichnis enthält Konfigurationen der Applikation.

    * ``worker.js`` Der Worker stellt den eigentlichen Webserver und die
Applikation bereit und erwartet Anfragen. Seine Aufgabe ist es, die Applikation
zu laden und für sich funktionsfähig zu machen. Diverse Einstellungen zu
Express können dort vorgenommen werden.

    * ``server.js`` Startdatei die an Node übergeben wird. Hierbei
handelt es sich um den Cluster-Master, der die Worker Prozesse fork.

    * ``console.js`` Startdatei für eine Node-basierte Konsolenapplikation.
Die kann wie die server.js als Cluster-Master agieren.

* ``node_modules/`` Das Node_Modules-Verzeichnis wird von NPM bereut und
enthält alle Vendor Packages. (Externe Bibliotheken)

* ``modules/`` Source-Verzeichnis - die eigentliche Applikation.

    * ``default | name`` Das Default-Verzeichnis beschreibt den Namen des
Modules. Dieser ist frei wählbar und enthält alle Bestandteile wie Controller
oder Resourcen. Klassen können frei in sinnvolle Namespaces gekapselt werden.

        * ``controllers/`` Jede enthaltene JS-Datei wird beim Bootstraping
geladen und der Applikation hinzugefügt .

        * ``resources/`` Das Resources-Verzeichnis enthält statische Inhalte
die direkt zum Modul gehören. Auch ein eigenes Public-Verzeichnis kann sich
hier befinden.

        * ``views/`` Das Views-Verzeichnis enthält alle Views die, die
Controller für ihre Ausgaben nutzen können.

* ``var/`` Das Var-Verzeichnis enthält variable Daten.

    * ``cache/`` Cache-Verzeichnis für temporäre Dateien.

    * ``logs/`` Log-Verzeichnis enthält Logs der Applikation.

* ``tests/`` Das Tests-Verzeichnis enthält alle Testcases für die Applikation.
Als Testing-Framework kommt Nodeunit zum einsatz.
Siehe: https://github.com/caolan/nodeunit

* ``docs/`` Das Docs-Verzeichnis enthält die API- und Projekt-Dokumentation.

* ``public/`` Das Public-Verzeichnis stellt alle statischen Inhalte für
die Applikation bereit. Alle Inhalte sind über den Webserver abrufbar.

* ``database/`` Das Database-Verzeichnis enthält mögliche Migrationsdateien
und/oder Fixtures

# Cluster

## Server

### Aufgaben

Der Server Prozess hat folgende Aufgaben:

* Bereitstellung des IPC Pools
* Management der Worker Prozesse
* Verwaltung der Applikationslogs
* Registerfunktionalität (Counter, Stats)

### Beschreibung

Der Server ist der Startpunkt der gesamten Applikation. Hergeleitet von anderen
Sprachen und Systemen stellt er den Applikationsserver dar. (Ruby, Java)

Die Server Implementierung stellt den Cluster-Master dar. Sie verwaltet den, vom
gesamten Cluster genutzten, IPC Pool. Des Weiteren liegt es an ihr die Worker
zu starten und im Fehlerfall neuzustarten. Dieses Szenario wird als Worker-Crash
bezeichnet.

Der Master sorgt für die Hochverfügbarkeit der Applikation, sodass sie selbst
im Fehlerfall weiter operabel gehalten wird. Um dies zu gewährleisten ist die
Implementierung des Masters so einfach und abgegrenzt wie möglich gestaltet.

Sollte der Master durch einen Softwaredefekt sterben, wird dies als Master-Crash
bezeichnet. In diesem Fall ist die Operabilität der Applikation nicht mehr
gewährleistet.

## Worker

### Aufgaben

* Bootstraping der Backend-Connections
* Bootstraping der Express Applikation
* Bootstraping der Model/Modul / Controller / View Schicht
* Bereitstellung des HTTP-Servers
* Bereitstellung der Applikation eines oder mehrerer Modules (Komponenten/Kontexte)

### Beschreibung

Der Worker wird vom Cluster-Master (Server Prozess) gestartet und verwaltet.

Nachdem der Worker Prozess geforket wurde, wird anhand der konkreten
Worker-Implementierung die Backend-Konfiguration geladen und alle Verbindungen,
die für die spezifizierten Module (Komponenten/Kontexte) der konkreten
Worker-Implementierung notwendig sind, aufgebaut.

Nachdem dieser Schritt abgeschlossen wurde, wird die Express Applikation
initalisiert und allgemeingültige Middleware wird in den Request-Stack der
Applikation eingefügt. Anschließend werden die spezifizierten Module der
konkreten Worker-Implementierung nach Controllern durchsucht - und für
die Applikation eingespielt.

Des Weiteren wird nun die ``configure`` Methode der konkreten Worker-Implementierung
aufgerufen, um für den Worker spezifische Middleware zu laden oder weitere
Bootstraping Prozesse anzustoßen.

Im letzten Schritt wird der HTTP-Server mit der konfigurierten Express
Applikation bestückt und zum lauschen auf den konfigurierten TCP-Port
gebracht.

Anschließend ist die Applikation betriebsbereit und nimmt Requests entgegen.

## Konkrete Worker-Implementierung

### Aufgaben

* Spezifische Konfiguration des Applikationskontextes
* Spezifizierung welche Backend-Connections und Applikationsmodule geladen werden

### Beschreibung

Die konkrete Worker-Implementierung unterscheidet sich zur generischen
Worker-Implementierung in dem Punkt, dass sie erst das Ausführen eines Workers
möglich macht. Zwar würde die generische Worker-Implementierung ausreichen einen
Worker lauffähig zu machen, jedoch würde dieser Worker kein
applikationsspezifisches Profil abbilden.

Um einen neuen Worker im Projekt aufzusetzen bedarf es lediglich einer konkreten
Worker-Implementierung, auch wenn diese anfänglich nicht viel spezialisiertes
verrichtet. Aus diesem Gedanken erwächst die Feststellung, dass die generische
Worker-Implementierung lediglich abstrakt funktioniert.

# Binaries

Dem Framework stehen eine überschaubare Anzahl an nützlichen Binaries zur
Verfügung, die atomar und in ihrem Kontext gekapselt ihren Dienst verrichten.

Dabei unterscheiden wir in zwei Gruppen von Binaries. Zum einen die Binaries
mit denen die Prozessverwaltung des Clusters gesteuert wird und zum anderen
Binaries die während der Entwicklung zum tragen kommen.

## Cluster Prozessverwaltung

### start

**Synoptics:** ./bin/start [-d] [MODULE1 MODULE2 ...]

Startet die angegebenen Module sofern angegeben, oder alle sofern
keine Module angegeben sind. Sobald der ``-d`` Switch angegebenen
wurde, werden alle Modulangaben verworfen und eine GNU Screen
Sitzung mit allen Modulen wird für den Debug/Development Prozess
gestartet.

### stop

**Synoptics:** ./bin/stop [MODULE1 MODULE2 ...]

Stoppt die angegebenen Module sofern angegeben, oder alle sofern
keine Module angegeben sind.

### status

**Synoptics:** ./bin/status

Überprüft welche Prozesse des Clusters laufen und gibt
deren PID's aus.

## Applikationsentwicklung

### db

**Synoptics:** ./bin/db [OPTION]

    Integrated Operations:
    ----------------------

     --create         Create the database and run a full setup (creation, migration, fixtures)
     --drop           Drop the database
     --rebuild        Rebuild the database, run migrations and apply fixtures

    Atomic Operations:
    ------------------

     --migrate        Run all migrations
     --fixtures       Apply all fixtures

Mit Hilfe der db Binary lassen sich alle notwendigen Datenbank Operationen
ausführen.

### maintenance

**Synoptics:** ./bin/maintenance [OPTION]

     --build-package                Tar + XZ the current vendor-modules packages
     --update-package               Update the vendor-modules and build a new archive
     --clear-logs                   Clear all log files
     --generate-docs                Generate documentation files
     --generate-framework-docs      Generate documentation files

Die maintenance Binary dient der Wartung und Instandsetzung während der Entwicklung
der Applikation.

### generate

**Synoptics:** ./bin/generate [OPTION]

     --model          Generate a new model scaffold (migration, fixture, model)
     --controller     Generate a new controller scaffold (controller, views)

Mit Hilfe der generate Binary lässt sich das frameworkeigene Scaffolding nutzen.
Mehr zu diesem Punkt finden Sie im Abschnitt "Scaffolding".

### test

**Synoptics:** ./bin/test [OPTION]

     -h   Shows this help
     -s   Run all service tests

Die test Binary ermöglicht das einfache Ausführen von Unit- und Integrationstests.

# Backend Verwaltung

## Verwalten von Backends mit dbReg

Für die Verwaltung von Backends ist schon in der ersten Version des Frameworks
eine entsprechende Backend-Schicht entstanden, die im Laufe der Entwicklung immer
mehr an Funktionalität und Umfang erreichte.

Heute stellt die Database-Registry, kurz dbReg, den Kopf dieser Schicht dar.
dbReg kümmert sich um das Verarbeiten von Backend Konfigurationen, die korrekte
Initalisierung von den einzelnen Backends und deren Connections und stellt darüber
hinaus die Möglichkeit der Einbindung von ORM's pro Backend.

Die Arbeitsweise von dbReg ist vollständig asynchron und in weiten Teilen parallel
implementiert. Dieser Fakt macht die hohe Leistung dieser Schicht aus.

Des Weiteren adaptiert dbReg ein fest definiertes Methoden-Set auf die variierenden
Backend Interfaces, was die einfache und zielgerichtete Arbeit mit von dbReg
verwalteten Backends/Connections erst möglich macht. Die spezifischen
Backend Adapter umfassen Implementierungen für: MySQL, MongoDB und Memcached.

Jeder Adapter bietet die Möglichkeit auf das native API des Backends zurückzugreifen,
was für spezialisierte Zugriffe unerlässlich ist.

## Arbeitsweise von dbReg

dbReg sollte als erste große Initalisierung einer jeden Applikation erachtet
werden, da ohne Backend jede Persistenz von Daten nicht gewährleistet ist
und somit der Betrieb der Applikation keinen Sinn macht.

Sollte dbReg bei der Konfiguration und Initalisierung fehlschlagen, ist dies
ein Grund die Applikation geregelt herrunterzufahren und somit den Worker zu
beenden. Sofern der Worker nicht mehr lebt, wird der Master Prozess versuchen
eine neue Worker Prozess Instanz zu erzeugen, was der Applikation erneut die
Chance gewährt ihre Backends und Connections erfolgreich zu initalisieren.

Dieser Workflow findet unendlich oft statt, sofern nicht manuell eingeriffen
wird. Aus diesem Kontext herraus ergibt sich die autonome Regulierung der Software,
denn somit können Datenbankaufälle oder ähnliche Probleme mit externen
Abhängigkeiten überbrückt werden, ohne das ein Eingreifen oder Eskalation nötig ist.

## dbReg im Einsatz

### Konfiguration

dbReg kann mit mehreren, unterschiedlich benannten, Connections
eines Backends umgehen. Zur Konfiguration wird folgende Struktur genutzt:

    /**
     * Current Environment specific Database connections
     */
    config.databases = {

        mysql: {

            CONNECTION: {
                username    : 'root',
                password    : '',
                db          : 'greppy_demo',
                connections : [
                    {
                        host : '127.0.0.1',
                        port : 3306
                    }
                ]
            },

            // Next connection
        },

        // Next backend
    }

### Initalisierung

Innerhalb der generischen Worker-Implementierung wird dbReg folgendermaßen
gestartet:

    dbReg = require('../modules/default/worker/db/registry.js');

    dbReg.configure(/* { specific backends/connections config to load } */, function(err)
    {
        // Your further application here
    });

### Zurgiff auf Backends

dbReg stellt für diesen Anwendungsfall die Methode ``backend`` zur Verfügung.
Sie erwartet als erstes und einziges Argument den Namen des Backends. Diese können
sein: ``mysql``, ``mongodb`` oder ``memcached``. Als Resultat erhält man synchron
eine Backend Instanz zurück.

    var backend = dbReg.backend('mysql');

### Zurgiff auf Connections eines Backends

Die Backend Instanz bietet nur eine für den Nutzer ausgelegte Methode, die
``get`` Methode. Mit deren Hilfe lässt sich eine Connection Instanz bekommen.
Auch dieser Aufruf ist synchron.

    var connection = dbReg.backend('mysql').get('CONNECTION');

### Methoden einer Connection Instanz

Alle Methoden der Connection Instanz übergeben alle gegebenen Argumente
an den tätsächlichen Adapter der Connection weiter.

    ConnectionTemplate.process()
    ConnectionTemplate.getORM()
    ConnectionTemplate.close()
    ConnectionTemplate.getErrors()
    ConnectionTemplate.getInstance()

## Arbeiten mit Backends

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

# Model/Module-Controller-View

Wie in jedem guten und durchdachten Framework, wurde auch im Unister
Node.js Framework das MVC Design Pattern vollständig umgesetzt. Dies
wurde durch die Verwendung des Express Frameworks erreicht.

Unser Framework bildet einen Top-Layer über Express und erweitert
es so um ganz fundamentale Features, wie die Kapselung von Controllern
in Namensräume (Module), das einheitliche Laden von Controllern aus
einzelnen Dateien und das automatische Aufsetzen der Applikationsrouten
anhand der Actions innerhalb der Controller.

## Strukturen innerhalb von Modulen

Dem Arbeiten innerhalb von Modulen ist eine saubere Trennung der einzelnen
Dateitypen geschuldet. Wodurch sich folgende Ausgangsstruktur definiert:

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

Strukturell sieht jedes Modul nach diesem Schema aus. In wie weit und
in welchem Ausmaß Helper definiert und genutzt werden und wie viele
Dateien tatsächlich in einem Modul verwendet werden ist völlig unabhängig.

Genrell gilt: Alle Implementierungen, die maßgeblich zu einem gewissen
Kontext gehören bilden ein Modul.

## Arbeiten mit Controllern

Beleuchten wir nun einen einfachen Index Controller, der ausschließlich
eine View rendert ohne weitere Daten in diese zu geben.

    /**
     *  Index Controller
     *
     *  Just for fun.
     *
     *  @author Hermann Mayer <hermann.mayer@unister.de>
     *  @name   index.js
     **/

    /**
     * Render the index page
     */
    exports.index = function(req, res)
    {
        res.render(('json' == req.format) ? 'layout' : 'index/index', {
            global: Helper.get('controller.globals').append(req)
        });
    }

Die Mächtigkeit dieses Controller liegt nicht sofort auf der Hand,
jedoch bietet er sogar die Möglichkeit einfach und sauber das Format
der Ausgabe zwischen HTML und JSON zu wählen.

## Arbeiten mit Views

Eine passende View für den oben beschriebenen Controller wäre:

    h2 Hello World
      a.pull-right(onclick="history.back();", title="Zurück").btn
        i.icon-arrow-left

    p
      | Dies wird ein langer, langer Paragraph.
      | Sogar über mehrere Zeilen hinweg.

## Helper

### Arbeiten mit Helpern

Helper im Allgemeinen stellen für das Framework eine große Erleichterung
dar, da sie wiederverwendbaren Code für die gesamte Applikation zugänglich
machen. Der Vorteil der daraus resultiert, lässt sich insofern schon erahnen,
wenn ein Controller in einem Admin Modul Funktionalität aus einem Service
Modul nutzen kann.

Helper können frei in Namensräumen definiert werden und lassen sich genauso
einfach an jeder Stelle innerhalb der Applikation nutzen.

Aus der oben beschriebenen Struktur ging ein Helper namens ``midoffice``, der
im Namensraum ``requests`` liegt, hervor. Um diesen Helper anzusprechen bedarf
es nur folgendes Codeschnippsels:

    var helper = Helper.get('admin.requests.midoffice');

Würde man direkt im Verzeichnis ``modules/admin/helpers`` einen Helper definieren,
so wäre dieser folgendermaßen anzusprechen:

    var helper = Helper.get('admin.global.helperName');

Das Framework bringt schon eine beachtlichen Anzahl an Helpern mit. Diese
lassen sich folgendermaßen anzusprechen:

    var helper = Helper.get('controller.form');

Dabei wird der Modulname entsprechend weggelassen und somit ist es dem
Helpersystem klar, dass es sich um einen Helper des Frameworks handelt.

### Eigene Helper implementieren

Eine Beispielimplementierung ist hier vollkommen ausreichend, da sich
das Prinzip hinter dem Helpersystem sehr leicht erkennen lässt.

    /**
     *  Dates View Helper
     *
     *  Adds dates helpers to all views.
     *
     *  @author      Hermann Mayer <hermann.mayer92@gmail.com>
     *  @name        date.js
     **/

    var date   = {};
    var util   = require('util');
    var Moment = require('moment');
    Moment.lang('de');

    date.format = function(date, format)
    {
        return Moment(date).format(format);
    };

    exports.date = date;

Der von uns definierte Helper ``date`` bietet eine Methode ``format``.

## Weiterführende Dokumentationen

* Dokumentation zu ``express`` http://expressjs.com/api.html
* Dokumentation zu ``jade`` http://jade-lang.com/tutorial/

# Scaffolding

Wie jedes gute und große Framework, bietet auch das Unister Node.js Framework
die Möglichkeit weite Teile der Applikation zu generieren. Diesen Vorgang nennt
man Scaffolding, da er als Resultat ein Grundgerüst für die anfallende Aufgabe
bietet. In vielen Fällen muss dieses generierte Gerüst kaum oder unwesentlich
nachbearbeitet werden.

Der große Vorteil dieses Verfahrens ist die Eliminierung zeitintensiver Prozesse
die dem Entwickler zum einen keinen Spaß machen und zum anderen das Gefühl geben
das Rad jedes mal aufs neue zu erfinden.

Ausgehend von unserer Scaffolding-Lösung konnten wir in vielen Projekten weite Teile
generieren und somit mehr Zeit für eigentliche und maßgeschneiderte Anforderungen
und Lösungen aufbringen. Was letztendlich erst die schnelle Entwicklung möglich
machte.

## Generierung von Backend Requisiten

Die Generierung von Backend Requisiten umfasst folgende Teile:

* Model
* Migration
* Fixture

Angestoßen wird ein interaktiver Prozess zur Definition der Eigenschaften
über folgenden Command:

    ./bin/generate --model

In der besagten interaktiven Sitzung, wird ermittelt in welches Modul das Model
geschrieben werden soll.

**Übrigens:** Alle Eingaben mit [DefaultValue] lassen sich auch durch TAB
autovervollständigen.

Nachdem das Modul gewählt wurde, steht die Frage nach der Connection aus.
Dort werden alle MySQL Connections gelistet. (Zur Zeit wird nur MySQL unterstützt)

Des Weiteren wird dem User die Möglichkeit geboten den Namen des Models anzugeben,
unter der Berücksichtigung bestehender Modelnamen. (Diese werden dem User bei der
Eingabe eingeblendet)

**Übrigens:** Freitext Eingaben enthalten immer eine kurze Beschreibung in welchem
Format die Eingabe erwartet wird. Für einen Modelnamen wäre das: (singular, PascalCase)

Für die Generierung von Modelgerüsten werden dem User in dieser Sitzung insgesamt
sechs Fragen gestellt.

## Generierung von CRUD Controllern

Die Generierung von CRUD Controllern umfasst folgende Teile:

* Funktionsfähiger CRUD Controller
* Alle benötigten Views

Angestoßen wird ein interaktiver Prozess zur Definition der Eigenschaften
über folgenden Command:

    ./bin/generate --controller

Auch hier bedarf es nur sechs Fragen um ein vollständiges Controllergerüst zu
generieren.

# Vendor Bibliotheken

Durch die große Anzahl an extern verfügbaren Bibliotheken lassen sich
große Themengebiete einfach nutzen, ohne entsprechende Eigenimplementierungen
zu entwickeln. Der Vorteil liegt auch hier klar auf der Hand. Im folgenden
werde ich einige essentielle Bibliotheken beschreiben die im Zusammenhang
mit dem Framework immer wieder zur Sprache kommen. Zur Einarbeitung sollten
die weiterführenden Dokumentationen der Bibliotheken studiert werden.

## Allgemein

### Async.js

Async.js ist eine Bibliothek zur vereinfachten Anwendung von Asynchronen und
parallelen Operationen. Besonders interessant für den täglichen Gebrauch
sind die Methoden ``map``, ``each``, ``parallel``. In modernen Projekten
die auf Leistung getrimmt sind, ist Async.js unerlässlich.

Siehe: https://github.com/caolan/async

### Moment.js

Moment.js ist eine Bibliothek die, die Manipulation von Daten und Zeitangaben
unterstützt. Konvertierungen, Formatierungen und viele nützliche Funktionen wie
das Berechnen von Differenzen machen diese Bibliothek besonders interessant.
Des Weiteren unterstützt Moment.js Lokalisierung.

Siehe: http://momentjs.com/docs/

###memory-cache

memory-cache ist eine Bibliothek die das temporäre verwalten von Daten (Caches)
im Arbeitsspeicher ermöglicht. Die Daten werden innerhalb des Node.js Prozesses
gehalten, was keine externe Lösung wie memcached oder redis erforderlich macht.

Siehe: https://github.com/ptarjan/node-cache

## Testing

### Nodeunit

Nodeunit ist ein Testing-Framework das sehr einfach zu nutzen ist und dennoch
sehr leistungsfähig ist.

Siehe: https://github.com/caolan/nodeunit

### Jasmine

Jasmine ist ein BDD Testing-Framework welches für neue Projekte eingesetzt werden
sollte, da es äußerst einfach und klar ist Unittests für Applikationskomponenten
zu verfassen.

Siehe: http://pivotal.github.io/jasmine/

### mocha

mocha ist ein weiteres Testing-Framework welches als namenhaften Entwickler
visionmedia hat. Unter anderem entwickelt visionmedia das Express Framework,
sowie die Templating-Engine Jade. mocha unterstützt verschiedene Ansätze wie
BDD oder TDD.

Siehe: http://visionmedia.github.io/mocha/

# Glossary

## Worker-Crashs

Worker-Crashs deuten auf verschiedene Probleme im System hin. Zum einen können
sie Hardwarenahe Probleme beleuchten, z.B. der Ausfall des Netzwerkes oder lange
Packetlaufzeiten auf die nicht reagiert werden. Zum anderen kann einem Worker-Crash
aber auch ein Softwaretechnisches Problem zugrunde liegen. Eine ungefangene Ausnahme
oder fehlerhafte Syntax in spezifischen Ausführungspfaden der Applikation.

Worker-Crashs sind nicht zu ignorieren, bedürfen aber keiner Eskalation. Durch
die autonome Selbstregulierung des Systems können die Probleme auf eine gewisse
Dauer kaschiert werden und der normale Entwicklungsprozess zur Fehlerbehebung kann
vollzogen werden. Dieser Prozess ist auf jeden Fall immer anzustoßen, sobald
Worker-Crashs vorliegen.

## Master-Crashs

Master-Crashs sind von höchster Dringlichkeit, da sie zum Ausfall eines Slaves
für eine Komponente (Kontext/Modul) führen. Sobald ein Master-Crash stattfindet,
was im Normalfall ausgeschlossen ist, muss sofort eskaliert und der Server
Prozess neugestartet werden. Dieser Schritt ist nicht automatisiert und lässt
sich nur mittels Cronjob oder Watchdog lösen. Diese zusätzliche Sicherheit
ist nicht Bestandteil des Frameworks.

## Middleware

Middleware bezeichnet in der Informatik anwendungsneutrale Programme, die so
zwischen Anwendungen vermitteln, dass die Komplexität dieser Applikationen und
ihre Infrastruktur verborgen werden. Man kann Middleware auch als eine
Verteilungsplattform, d. h. als ein Protokoll (oder Protokollbündel) auf einer
höheren Schicht als die der gewöhnlichen Rechnerkommunikation auffassen. Im
Gegensatz zu niveautieferen Netzwerkdiensten, welche die einfache Kommunikation
zwischen Rechnern handhaben, unterstützt Middleware die Kommunikation zwischen
Prozessen.

Siehe Wikipedia: http://de.wikipedia.org/wiki/Middleware

