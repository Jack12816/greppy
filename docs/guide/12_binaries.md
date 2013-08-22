# Binaries

The framework delivers a binary called ``greppy`` which is an equivalent to the
Ruby on Rails binary ``rails``. With the help of this command you can initalize
new projects, start or stop them and even list contexts or their statuses.

## Common tasks

### version

**Synopsis:** greppy --version|-v

Greppy can print out some information about it's current release and status.
If you run this command in an Greppy project, it will print some details for
this project too.

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

### debug

**Synopsis:** greppy --debug|-d [-s|--start|-k|--stop|-r|--rebstart]

The debug switch can be used in combination with start, stop and restart.
It puts the application into the debugging mode which contains the following
settings:

* If an fatal error or an uncaught exception occurs the master won't
  restart the works. (no handling of worker crashs)
* Starts the application in foreground so everything gets logged on the terminal
* If you specify more than one worker context a GNU Screen session is started

## Application management

### new

**Synopsis:** greppy --new|-n PROJECT_NAME

Bootstrap a new Greppy project in the current working directory. So a directory
with the specified name will be created and the application structure will be
pulled in. Afterwards npm and bower will be ran to fetch all dependencies.

### list

**Synopsis:** greppy --list|-l

List all available worker contexts of the application.

## Database management

### db

**Synopsis:** greppy --db

The ``greppy`` binary supports database management by the ``--db`` switch.
If you specify no operation or any other flag this command will search all
database configurations of the project in the current working directory, if
it is a Greppy project.

You can specify the ``--help`` flag to get a cheatsheet for all database operations.

#### create

**Synopsis:** greppy --db create [adapter.connection ...]

Create all|the given backend connection(s) based on the specified adapter and
configuration. For the MySQL backend adapter it would be tried to create
a new database based on the configuration.

#### drop

**Synopsis:** greppy --db drop [adapter.connection ...]

Drop all|the given backend connection(s) based on the specified adapter.

#### migrate

**Synopsis:** greppy --db migrate [adapter.connection ...]

Run migrations for all|the given connection(s).

#### fill

**Synopsis:** greppy --db fill [adapter.connection ...]

Fill all|the given connection(s) with it's fixture data.

#### build

**Synopsis:** greppy --db fill [adapter.connection ...]

Run these operation for all|the given connection(s):
* create
* migrate
* fill

#### rebuild

**Synopsis:** greppy --db fill [adapter.connection ...]

Run these operation for all|the given connection(s):
* drop
* create
* migrate
* fill

