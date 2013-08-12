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

