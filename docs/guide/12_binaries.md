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

