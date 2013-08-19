# Binaries

The framework delivers a binary called ``greppy`` which is an equivalent to the
Ruby on Rails binary ``rails``. With the help of this command you can initalize
new projects, start or stop them and even list contexts or their statuses.

## Process management

### start

**Synopsis:** greppy --start|-s [CONTEXT1 CONTEXT2 ...] [-d]

Starts all worker contexts of the application if no contexts were given
or the given ones. You got the ability to start the contexts with the
``--debug`` or ``-d`` switch, which starts the contexts as foreground
processes which log all output to the terminal. If you specify more than
one context, a GNU Screen session will be launched.

### stop

**Synopsis:** greppy --stop|-k [CONTEXT1 CONTEXT2 ...]

Stops all worker contexts if none were given or all given ones.

### restart

**Synopsis:** greppy --restart|-r [CONTEXT1 CONTEXT2 ...]

Restart just stops and starts all worker contexts if none were given or
all given ones.

### status

**Synopsis:** greppy --status|-m

The status command lists all worker contexts of the application and detects
if the context is running. If so it shows how much memory the worker context uses.

## Application management

### list

**Synopsis:** greppy --list|-l

List all available worker contexts of the application.

