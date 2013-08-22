# Greppy

Greppy is a top layer framework which builds upon the Express framework.
It extends the functionality of Express and increases the reuseability of
common parts from your application. Further it standardizes a application
directory structure, which helps you to manage large code bases.

For more details take a look at [greppy.org](http://greppy.org)
or the [Greppy API](http://greppy.org/docs).

## Features

* Well structured application hierarchy
* Split your application into specific modules
    * Can be started individually or bundled by a worker
    * Enables you to build Cloud/Cluster software with multi- threading/server support
* Easy integration of MongoDB/Maria|MySQL ORMs (mongoose, sequelize)
* Configuration and extension support
* Simple but powerful MVC setup to ease the getting started process

## Getting Started

### Installation

    npm install -g greppy

### Create a new project

Open a terminal and go to your usual workspace. The next step
will create a new Greppy project for you.

    greppy --new PROJECT_NAME
    cd PROJECT_NAME
    greppy --start acme -d

The structure will be created and an initial vendor package
installation will be done (npm and bower).

### Project Directory Structure

    .
    ├── app
    │   ├── config
    │   │   └── application.js
    │   ├── context
    │   │   └── acme.js
    │   ├── master.js
    │   └── worker.js
    ├── bin
    ├── database
    │   ├── fixtures
    │   └── migrations
    ├── docs
    ├── modules
    │   └── acme
    │       ├── controllers
    │       │   └── index.js
    │       ├── helpers
    │       ├── models
    │       └── resources
    │           └── views
    │               ├── app
    │               │   └── home.jade
    │               └── layout.jade
    ├── node_modules
    ├── public
    │   ├── components
    │   ├── css
    │   ├── img
    │   └── js
    ├── tests
    ├── var
    │   ├── cache
    │   ├── log
    │   └── run
    ├── bower.json
    ├── package.json
    └── README.md

