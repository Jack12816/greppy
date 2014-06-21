/**
 * Number Data-Type Extension
 *
 * @module greppy/extension/datatype/number
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

/**
 * Format a number.
 *
 * @param {Number} [decimals] - How many decimals
 * @param {String} [decPoint] - Decimal point
 * @param {String} [thousandsSep] - Thousands separator
 * @return {String}
 */
Number.prototype.format = function(decimals, decPoint, thousandsSep)
{
    // Strip all characters but numerical ones.
    number = (this + '').replace(/[^0-9+\-Ee.]/g, '');

    var n    = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep  = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep,
        dec  = (typeof decPoint === 'undefined') ? '.' : decPoint,
        s    = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };

    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }

    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
};

/**
 * Humanize a number for pretty printing.
 *
 * @return {String}
 */
Number.prototype.humanize = function()
{
    if (1000 > this) {
        return this.format(0, ',', ' ');
    } else if (1000000 > this) {
        return (this/1000).toFixed(0 !== this % 1000) + 'k'; // Kilo
    } else if (1000000000 > this) {
        return (this/1000000).toFixed(0 !== this % 1000000) + 'M'; // Mega
    } else if (1000000000000 > this) {
        return (this/1000000000).toFixed(0 !== this % 1000000000) + 'G'; // Giga
    } else if (1000000000000000 > this) {
        return (this/1000000000000).toFixed(0 !== this % 1000000000000) + 'T'; // Tera
    } else if (1000000000000000000 > this) {
        return (this/1000000000000000).toFixed(0 !== this % 1000000000000000) + 'P'; // Peta
    } else if (1000000000000000000000 > this) {
        return (this/1000000000000000000).toFixed(0 !== this % 1000000000000000000) + 'E'; // Exa
    } else if (1000000000000000000000000 > this) {
        return (this/1000000000000000000000).toFixed(0 !== this % 1000000000000000000000) + 'Z'; // Zeta
    }

    return (this/1000000000000000000000000000).toFixed(0 !== this % 1000000000000000000000000000)+'Y'; // Yotta
};

/**
 * Humanize a number to memory for pretty printing.
 *
 * @return {String}
 */
Number.prototype.memory = function()
{
    if (0 == this) {
        return '0.00 B';
    }

    var units = ['B','KB','MB','GB','TB','PB'];
    return (
        this / Math.pow(1024, i = Math.floor(Math.log(this) / Math.log(1024)))
    ).toFixed(2).toString() + ' ' + units[i];
};

