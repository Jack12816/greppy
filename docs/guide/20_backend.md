# Backend Management

## Managing the backend with db-Store

To manage the framework's backend connections, a special backend
layer was implemented. The db-Store now acts as the layer's head.
It processes the backend configuration and initializes all backends
with their corresponding connections. Furthermore, it provides the
possibility to integrate a different ORM for each backend.
db-Store works absolutely asynchronous, which results in the layer's
high performance. Additionally, db-Store includes and defines a set
of methods for every backend interface. A purposeful and easy workflow
is established using these methods. The current backend adapters are
currently limited to MySQL, MongoDB, and Memcached.
Every adapter provides the possibility to use the backend's
native implementation, making specialised accesses easy.

## db-Store's methods

db-Store should be the first big initialisation as it
is of vital importance for persisting data.
If the adapter's configuration fails, the worker has to
be shut down by normal means. After shutting down the worker,
the master tries to spawn a new worker to take the previous
one's place which enables the worker to start a fresh
backend connection.

Unless interrupted manually, the server tries to spawn workers
indefinitely until the designated amount of workers is reached.
Database failures and other external failures can be bypassed by
this measurement, without requiring manual interference.

## db-Store in action

### Configuration

db-Store can handle multiple backend connections by
using a structure like this:

    /**
     * Current Environment specific Database connections
     */
    config.database = {

        mysql: {

            demo: {
                username    : 'root',
                password    : '',
                db          : 'demo_development',
                host        : '127.0.0.1',
                port        : 3306
            },

            // Next connection
            connection: {...}
        },

        // Next backend
        backend: {...}
    }

### Initialisation

The generic worker implementation will setup the db-Store automatically
by your given configuration. So after booting the worker you can use all
configured backend connections.

### Accessing a backend connection

The db-Store provides the method ``get()`` to get the backend connection.
This is just a wrapper class around the real backend adapter.

    var connection = greppy.db.get('mysql.demo');

#### Methods of a backend connection

Methods wrapped by the backend adapters are:

    constructor(name, backend, config)
    configure(callback)
    getORM(callback)
    close(callback)

#### Properties of a backend connection

A backend connection also ships with some public
accessible properties:

    errors // All errors which came from the backend adapter
    instance // The plain backend connection instance
    name // Name of the connection
    config // Configuration of the connection

## Working with backends
