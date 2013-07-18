# Greppy

Greppy is a top layer framework which builds upon the Express framework.
It extends the functionality of Express and increases the reuseability of
common parts from your application. Further it standardizes a application
directory structure which helps you to manage large code bases.

## Features

* Well structured application hierarchy
* Split your application into specific modules
    * Can be started individually or bundled by an worker
    * Enables you to build Cloud/Cluster software with multi- threading/server support
* Easy integration of MongoDB/Maria|MySQL ORMs (mongoose, sequelize)
* Configuration and extension support
* Simple but powerful MVC setup to ease the getting started process

## Application Structure

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

## Installation

    npm install -g greppy

