/**
 * Application Configuration
 */
var config = {};

/**
 * Cluster infrastructure
 */
config.infrastructure = {

    acme: {
        url    : 'http://localhost:3000',
        slaves : ['localhost'],
        host   : '0.0.0.0',
        port   : 3000,
        worker : 1
    }
};

/**
 * Database connections
 */
config.database = {

    // mongodb: {

    //     blog: {
    //         plain   : true,
    //         orm     : true,
    //         uri     : 'mongodb://127.0.0.1:27017/acme_website',
    //         options : {
    //             db: {
    //                 native_parser: true
    //             }
    //         }
    //     }
    // },

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

