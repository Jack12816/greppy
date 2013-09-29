# Cluster

## Server

### Tasks

* IPC pool provisioning
* Worker process management
* managing the application logs
* ability to register metrics (counter, stats)

### Description

The server is the starting point of the whole application. Deriving
from other languages and systems, such as Ruby or Java, it represents
the application server. The server implementation also represents the
cluster master. It manages the whole IPC pool and starts and restarts
the workers in case they crash. A crashing worker is called a worker
crash. The master takes care of an application's high availability
to keep it operable even if the worker crashes. To ensure that goal,
the master's implementation is as easy and definitive as possible.

If the master crashes, the application's availability cannot be
ensured anymore. This case is called a master crash.

## Worker

### Tasks

* Bootstraping the backend connection
* Bootstraping the Express application
* Bootstraping the module/model/view/controler layer
* Providing the HTTP servers
* Providing a module's application

### Description

The worker is started and managed by the cluster master.
After forking the worker process, the backend configuration is loaded
and all connections for the specific modules are established.
Once completed, the Express application is initialized and middleware
is loaded into the application's request stack. Subsequently, the
specific modules are searched for controllers and integrated into
the application. Furthermore, the ``configure()`` method of the worker context
is called to load worker specific middleware or to start other bootstrapping
processes.

Finally, the HTTP server is provided with the configured Express
application and starts listening to the configured TCP port.
The application is ready by this point.

## Worker Context

### Tasks

* Configuring the specific application context
* Specifying which backend connections and modules are loaded

### Description

The worker context is different from the generic worker as it provides
the worker with additional information. Theoretically, the generic worker
would suffice to run an application, but it wouldn't describe an application
specific profile.

To add another worker to the project, only a new context is needed,
even if it isn't specialized in anything.

