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

