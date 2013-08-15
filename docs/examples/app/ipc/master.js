/**
 * Broadcast Listening
 */
setTimeout(function() {

    master.getIPC().broadcast('gracefull.shutdown', {
        shutdownTime: new Date()
    });

}, 2000);


/**
 * Interval based IPC req/res
 */
master.getIPC().addMethod('notify.request', function(msg, options, callback) {

    callback && callback(undefined, {
        test: ++options.test
    });
});

