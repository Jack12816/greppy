# Structure

The structure results from an application's logical encapsulation of
namespaces and responsibilities. A brief overview can be described
as the following:

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

## Directory Breakdown

* ``package.json`` Package meta data - gives a short description of the package including dependencies.
    See: [http://package.json.nodejitsu.com](http://package.json.nodejitsu.com)

* ``README.md`` A getting started document, describing the workflow and helping new developers to find a starting point.

* ``bin/`` The script directory in which scripts are located.

* ``app/`` The application directory.

    * ``config/`` The config directory contains the application's configuration files.

    * ``context/`` All worker contexts are located here.

    * ``worker.js`` The worker provides the actual application with it's own web server which waits for requests. The main task is to load and run the application with various settings.

    * ``server.js`` File which is passed to Node in order to start the cluster master, which forks the worker processes.

* ``node_modules/`` The node modules are managed by the node package manager (npm) and consist of external libraries.

* ``modules/`` The actual application.

    * ``name`` This directory contains all components of the module "name", like controllers and resources. The name can be chosen freely and classes can be encapsulated in sensible namespaces.

        * ``controllers/`` Every *.js file will be loaded and added to the application.

        * ``models/`` All models of the module are located in here.

            * ``name/`` Name of the connection for the models.

        * ``resources/`` The resources directory contains static files which belong to the module.

            * ``views/`` The views directory contains all views which are used by the module's controllers.

* ``var/`` This directory contains variable files.

    * ``cache/`` The cache is located here.

    * ``log/`` Log files can be found here.

    * ``run/`` Greppy puts all pid files in here.

* ``tests/`` The tests directory contains all test cases.

* ``docs/`` Documentations of the actual project and the API are located here.

* ``public/`` The public directory provides all static content for the whole application. They're accessible over the web browser.

* ``database/`` Migration and fixture files are located in the database directory.

