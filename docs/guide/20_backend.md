# Backend Management

## Managing the backend with db-Store

To manage the framework's backend connections, a special backend layer was implemented.

The db-Store now acts as the layer's head. It processes the backend configuration and intializes all backends with their corresponding connections. Furthermore, it provides the possibility to integrate different a different ORM for each backend.

db-Store works absolutely asynchronous, which results in the layer's high performance.

Additionally, db-Store includes and defines a set of methods for every backend interface. A purposeful and easy workflow is etablished using these methods. The current backend adapters are currently limited to MySQL, MongoDB, and Memcached.

Every adapter provides the possibility to use the backend's native implementation, making specialised accesses easy.

## db-Store's methods

db-Store should be the first big initialisation as it is of vital importance for persisting data.

If the adapter's configuration fails, the worker has to be shut down by normal means. After shutting down the worker, the master tries to spawn a new worker to take the previous one's place which enables the worker to start a fresh backend connection.

Unless interrupted manually, the server tries to spawn workers indefinitely until the designated amount of workers is reached. Database failures and other external failures can be bypassed by this measurement, without requiring manual interference.

## db-Store in action

### Configuration

db-Store can handle multiple backend connections by using a structure like these:

    /**
     * Current Environment specific Database connections
     */
    config.database = {

        mysql: {

            eds: {
                username    : 'root',
                password    : '',
                db          : 'eds_development',
                host        : '127.0.0.1',
                port        : 3306
            },

            // Next connection
        },

        // Next backend
    }

### Initialisation

Inside the generic worker, you can use db-Store like this:

    // @TODO: Update example
    dbReg = require('../modules/default/worker/db/registry.js');

    dbReg.configure(/* { specific backends/connections config to load } */, function(err)
    {
        // Your further application here
    });

### Accessing a backend connection

The backend instance provides the method ``getConnection`` to get the instance's connection.

    greppy.db.get('mysql.demo').instance.getConnection(function(err, con) {
        console.log(con);
    });

### Methods

Methods used by the backend are:

    configure();
    getORM();
    close();

## Working with backends
