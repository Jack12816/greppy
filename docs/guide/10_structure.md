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

