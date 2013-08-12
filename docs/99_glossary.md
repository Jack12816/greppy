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

