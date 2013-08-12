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

