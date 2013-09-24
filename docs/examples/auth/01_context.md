## Context and Controller

### Context

    Context.prototype.configure = function(app, server, callback)
    {
        // Define some Auth stuff
        var httpAuth = new (greppy.get('auth.handler.http'))({
            adapter: [
                new (greppy.get('auth.adapter.array'))({
                    users: [
                        {username: 'admin', password: 'admin'}
                    ]
                }),
                new (greppy.get('auth.adapter.htpasswd'))({
                    file: __dirname + '/../config/htpasswd'
                })
            ]
        });

        app.set('auth.http', httpAuth);

        // ...
    }

### Controller

    Controller.prototype.configure = function(app, server, callback)
    {
        this.options.auth.handler = app.get('auth.http');
        this.options.auth.routes  = [];

        callback && callback();
    };

