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

## Getting Started

### Installation

    npm install -g greppy

### Create a new project

Open a terminal and go to your usual workspace. The next step
will create a new Greppy project for you.

    greppy --new=PROJECT_NAME

This will create a new directory in your current working
directory which is named as your specified project name.
The structure will be created and an initial vendor package
installation will be done.

### Project Directory Structure

    .
    ├── app
    │   └── config
    ├── bin
    ├── database
    │   ├── fixtures
    │   └── migrations
    ├── docs
    ├── modules
    ├── public
    │   ├── css
    │   ├── js
    │   └── img
    ├── tests
    ├── var
    │   └── log
    ├── CHANGELOG.md
    ├── package.json
    └── README.md

