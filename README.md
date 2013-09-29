# Greppy

Greppy is a top layer framework utilising the Express framework. Greppy extends
the functionality of Express and increases the reuseability for common parts of
your application. Furthermore it standardizes an application directory structure
which helps you to manage large code bases.

For more details take a look at [greppy.org](http://greppy.org) or the
[Greppy API](http://greppy.org/docs). If you got any problems, a wish to
contribute or to discuss new features take a look at our #greppy IRC channel on
freenode.

## Features

* Well structured application hierarchy
* Ability to split your application into specific modules
    * These can be started individually or collectively by a worker
    * This enables you to build Cloud/Cluster software with multi-threading/server support
* Easy integration of MongoDB/MariaDB|MySQL ORMs (mongoose, sequelize)
* Configuration and extension support
* Simple but powerful MVC setup to get started with ease
* Rapid Prototyping, simply generate your application scaffold, even with CRUD controllers

## Getting Started

### Installation

    $ npm install -g greppy

### Creating a new Project

Open a terminal and go to your usual workspace. The next step is to create a new
Greppy project.

    $ greppy --new PROJECT_NAME
    $ cd PROJECT_NAME
    $ greppy --start acme -d

The application directory structure will be created and an initial vendor
package installation using npm and bower will be done.

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

## Running Tests

To run the test suite just run the following command, which installs the
development dependencies:

    $ npm install

Run the tests with:

    $ make test

