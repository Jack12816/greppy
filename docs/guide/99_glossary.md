# Glossary

## Worker-Crashs

Worker crashs indicate various problems of the system. It could show a problem
with the used hardware or external resources like the network or timeouted packets.
On the other hand, the cause of worker crashs could be bugs in your application.
An uncaught exception or faulty syntax on specific execution paths can lead to
worker crashs.

Nerver ignore these crashs, however they are not system breaking. The autonomous
regulation of the system can bypass those errors for a while, so the normal development
cycle can fix those problems. You should always perform this error handling strategy
if errors occur.

## Master-Crashs

Master crashs got the highest priority and need an immediate operation by a human.
They cause a breakdown of whole cluster slaves and/or application contexts. So
your application or parts of it won't work anymore. A master crash should never
occur in normal production cases, because the master implementation is rock-solid
and well tested. If such an error occurs though, you need to restart the master.
This step could be automated by a watchdog solution with a cronjob daemon.

## Middleware

Middleware is computer software that provides services to software applications
beyond those available from the operating system. It can be described as "software glue".
Middleware makes it easier for software developers to perform communication and
input/output, so they can focus on the specific purpose of their application.

Source: http://en.wikipedia.org/wiki/Middleware

