/**
 * Fixture Helper
 *
 * @module greppy/helper/db/fixture
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var password = require('password');
var uuid     = require('node-uuid');

/**
 * @constructor
 */
var Fixture = function()
{
};

/**
 * Generate one random word.
 *
 * @param {Integer} amount - How many words to generate
 * @return {String}
 */
Fixture.prototype.word = function(amount)
{
    return password(amount || 1).capitalize();
};

/**
 * Generate one random wordgroup.
 *
 * @param {Integer} amount - How many words to generate
 * @return {String}
 */
Fixture.prototype.wordgroup = function(amount)
{
    return password(amount || 7).capitalize();
};

/**
 * Generate a random top-level-domain.
 *
 * @return {String}
 */
Fixture.prototype.tld = function()
{
    var tlds = [
        'com', 'org', 'net', 'biz', 'org', 'name',
        'de', 'ca', 'be', 'ch', 'eu', 'jp', 'ru', 'pl', 'us'
    ];

    return tlds[Math.floor(Math.random()*tlds.length)];
};

/**
 * Generate a random domain name.
 *
 * @return {String}
 */
Fixture.prototype.domain = function()
{
    return (password(1) + '.' + this.tld()).toLowerCase();
};

/**
 * Generate a random email address.
 *
 * @return {String}
 */
Fixture.prototype.email = function()
{
    return (password(2).replace(' ', '.') + '@' + this.domain()).toLowerCase();
};

/**
 * Generate a random fullname.
 *
 * @return {String}
 */
Fixture.prototype.fullname = function()
{
    var name = password(2).split(' ');
    return name[0].capitalize() + ' ' + name[1].capitalize();
};

/**
 * Generate a random integer.
 *
 * @return {Integer}
 */
Fixture.prototype.integer = function(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate a random float.
 *
 * @return {Float}
 */
Fixture.prototype.float = function(min, max)
{
    return Math.random() * (max - min) + min;
};

/**
 * Generate a random float.
 *
 * @return {String}
 */
Fixture.prototype.phone = function(min, max)
{
    var phone = '+' + this.integer(1, 50) + ' ';

    for (var i = 0; i < 4; i++) {
        phone += this.integer(0, 9);
    }

    phone += ' ';

    for (var j = 0; j < 6; j++) {
        phone += this.integer(0, 9);
    }

    return phone;
};

/**
 * Generate a random text.
 *
 * @return {String}
 */
Fixture.prototype.text = function()
{
    var words = [
        'a','a,','ac','ac,','accumsan','accumsan,','adipiscing','aenean','aliquam','aliquam,',
        'aliquet','amet','amet,','ante','arcu','arcu,','at','auctor','augue','bibendum',
        'blandit','commodo','commodo,','condimentum','congue','consectetur','consequat',
        'consequat,','convallis','cras','cum','curabitur','cursus','dapibus','diam',
        'diam,','dictum','dictumst','dignissim','dis','dolor','dolor,','donec','dui','dui,',
        'duis','egestas','eget','eleifend','elementum','elementum,','elit','elit,','enim',
        'enim,','erat','eros','eros,','est','est,','et','et,','etiam','eu','eu,',
        'euismod','facilisi','facilisis','fames','faucibus','felis','felis,','fermentum',
        'fermentum,','feugiat','fringilla','fusce','gravida','habitant','habitasse',
        'hac','hendrerit','iaculis','id','imperdiet','in','integer','interdum','ipsum',
        'ipsum,','justo','justo,','lacinia','lacus','lacus,','laoreet','lectus','leo','leo,',
        'libero','libero,','ligula','lobortis','lorem','luctus','maecenas','magna',
        'magnis','malesuada','massa','massa,','mattis','mauris','mauris,','metus','metus,',
        'mi','mi,','molestie','mollis','montes,','morbi','mus','nam','nascetur',
        'natoque','nec','nec,','neque','neque,','netus','nibh','nisi','nisi,','nisl','nisl,',
        'non','non,','nulla','nullam','nunc','nunc,','odio','orci','orci,','ornare',
        'parturient','pellentesque','penatibus','pharetra','pharetra,','phasellus','placerat',
        'platea','porta','porttitor','posuere','potenti','praesent','pretium','pretium,',
        'proin','pulvinar','purus','purus,','quam','quis','quisque','rhoncus','rhoncus,',
        'ridiculus','risus','risus,','rutrum','sagittis','sagittis,','sapien','sapien,',
        'scelerisque','sed','sem','semper','senectus','sit','sociis','sodales','sollicitudin',
        'suscipit','suspendisse','tellus','tellus,','tempor','tempor,','tempus','tempus,',
        'tincidunt','tortor','tortor,','tristique','turpis','ullamcorper','ultrices','ultricies',
        'urna','urna,','ut','varius','vehicula','vel','vel,','velit','velit,','venenatis',
        'venenatis,','vestibulum','vestibulum,','vitae','vitae,','vivamus','viverra','volutpat',
        'volutpat,','vulputate'
    ];

    var paragraphs = [];

    for (var p = 0; p < 3; p++) {

        var sentences = [];

        // Generate sentences
        for (var i = 0; i < 50; i++) {

            var wordsUsed = [];

            for (var j = 0; j < this.integer(5, 15); j++) {
                wordsUsed.push(words[Math.floor(Math.random()*words.length)]);
            }

            wordsUsed[0] = wordsUsed[0].capitalize();
            sentences.push(wordsUsed.join(' '));
        }

        paragraphs.push((sentences.join('. ') + '.').replace(/(\.\,|\,\.)/g, '.'));
    }

    return paragraphs.join('\n\n');
};

/**
 * Generate a random md5 hash.
 *
 * @return {String}
 */
Fixture.prototype.md5 = function()
{
    return require('crypto').createHash('md5').update(this.word()).digest('hex');
};

/**
 * Generate a random sha512 hash.
 *
 * @return {String}
 */
Fixture.prototype.sha512 = function()
{
    return require('crypto').createHash('sha512').update(this.word()).digest('hex');
};

/**
 * Generate a UUID.
 *
 * @param {Integer} version - Version of the UUID (1|4)
 * @return {String}
 */
Fixture.prototype.uuid = function(version)
{
    version = version || 4;

    if (4 === version) {
        return uuid.v4();
    }

    if (1 === version) {
        return uuid.v1();
    }
};

/**
 * Generate a random boolean.
 *
 * @return {Boolean}
 */
Fixture.prototype.boolean = function()
{
    if (Math.round(Math.random())) {
        return true;
    }

    return false;
};

/**
 * Generate a random date between 2000-01-01 and now.
 *
 * @return {Boolean}
 */
Fixture.prototype.date = function()
{
    return new Date(this.integer(1000 * 946681200, (new Date()).getTime()));
};

/**
 * Generate an optional value (get the value or not).
 *
 * @param {Mixed} value - Value to return or not
 * @return {Mixed|undefined}
 */
Fixture.prototype.optional = function(value)
{
    if (Math.round(Math.random())) {
        return value;
    }

    return undefined;
};

/**
 * Generate an array of values by given generator.
 *
 * @param {Integer} min - Min amount of values
 * @param {Integer} max - Max amount of values
 * @param {Function} generator - Function to call for values
 * @return {Array}
 */
Fixture.prototype.array = function(min, max, generator)
{
    var result = [];

    for (var i = 0; i <= this.integer(min, max); i++) {
        result.push(generator());
    }

    return result;
};

module.exports = Fixture;

