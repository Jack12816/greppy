# Concept

## Packaging

* Global scope package (npm install -g greppy)

## Greppy Binary

### ./bin/greppy --new[=APPNAME]

Create the application directory structure.
This will create such a directory hierarchy.

    .
    ├── app
    │   └── config
    ├── bin
    │   └── greppy
    ├── database
    ├── docs
    ├── modules
    ├── public
    ├── tests
    ├── var
    │   └── log
    ├── CHANGELOG.md
    ├── package.json
    └── README.md

### ./bin/greppy --start [-d] [MODULE1 MODULE2 ...]

Start the configured application ((non-)clustered).
If the -d switch is passed, the application gets started
in development mode.

Furthermore you can pass explicit module names to start
only some contexts of the application.

### ./bin/greppy --stop [MODULE1 MODULE2 ...]

Stop the whole application. If explicit module names
are given stop just them.

### ./bin/greppy --status

Check the status of the whole application.
List all processes (with pids) according to the application.

### ./bin/greppy --clear logs

Clear all application logs.

### ./bin/greppy --generate docs

Generate an application documentation based on JSDocs.

### ./bin/greppy --generate model [NAME]

Generate a new model scaffold (migration, fixture, model).

### ./bin/greppy --generate controller [NAME]

Generate a new controller scaffold (controller, views).

