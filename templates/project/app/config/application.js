/**
 * Application Configuration
 */
var config = {};

/**
 * Cluster infrastructure
 */
config.infrastructure = {

    acme: {
        slaves   : ['localhost'],
        host     : '0.0.0.0',
        port     : 3000,
        worker   : 1,
    }
}

/**
 * Database connections
 */
config.database = {

    // mysql: {

    //     acme: {
    //         plain    : true,
    //         orm      : true,
    //         username : 'root',
    //         password : '',
    //         db       : 'acme_website',
    //         host     : '127.0.0.1',
    //         port     : 3306
    //     }
    // }
};

module.exports = config;

