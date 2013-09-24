## Config

### Build a new configuration without the store

    var Config = greppy.get('config');

    var config = new Config({
        path: process.cwd() + '/app/config/application.js',
        default: {
            infrastructure: {
                b: 2
            }
        }
    });

    console.log(config.get('infrastructure'));

### Load a configuration into the store

    var config = greppy.config.load(process.cwd() + '/app/config/application.js', 'app', {
        default: {
            infrastructure: {
                b: 2
            }
        }
    });

    console.log(config);
    console.log(greppy.config.get('app'));

