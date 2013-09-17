## LDAP

### Fetch LDAP information by query

    ldapAuth.search('ou=Users, dc=acme, dc=lan', {
        sizeLimit : 10,
        filter    : '(|(cn=*' + 'h.mayer' +'*)(uid=' + 'h.mayer' + '*))',
        scope     : 'sub'
    }, function(err, data) {
        console.log(ldapAuth.resultsToJSON(data));
    });

