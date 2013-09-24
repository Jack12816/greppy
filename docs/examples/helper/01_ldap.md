## LDAP

### Fetch LDAP information by query

    var config = {
        url             : 'ldaps://ldap.acme.com',
        bindDN          : 'uid=serviceUser,ou=Services,dc=acme,dc=lan',
        bindCredentials : 'secret',
        tlsOptions      : {
            rejectUnauthorized : false
        },
        userBindDN      : 'uid={{{username}}},ou=Users,dc=acme,dc=lan',
        timeout         : 10,
        connectTimeout  : 5
    };

    var ldapClient = new (greppy.get('helper.ldap.client'))({
        ldap: config
    });

    var base = 'ou=Users,dc=acme,dc=lan';
    var options = {
        sizeLimit : 5,
        filter    : '(|(fullname=*' + query +'*)(uid=' + query + '*))',
        scope     : 'sub'
    };

    ldapClient.search(base, options, function(err, results) {

        if (err) {
            return console.log(err);
        }

        console.log(ldapClient.resultsToJSON(results));
    });

