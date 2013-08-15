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

