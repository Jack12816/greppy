/**
 * Array Data-Type Extension
 *
 * @module greppy/extension/datatype/array
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

/**
 * Sort the array values to unique entries.
 *
 * @return {Array}
 */
Array.prototype.uniq = function()
{
    var arr = this.sort(function (a, b) { return a*1 - b*1; });
    var ret = [arr[0]];

    for (var i = 1; i < arr.length; i++) {
        if (arr[i-1] !== arr[i]) {
            ret.push(arr[i]);
        }
    }

    return ret;
}

