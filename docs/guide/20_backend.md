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

