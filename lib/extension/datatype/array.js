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
Array.uniq = function(arr)
{
    var arr = arr.sort();
    var ret = [arr[0]];

    for (var i = 1; i < arr.length; i++) {
        if (arr[i-1] !== arr[i]) {
            ret.push(arr[i]);
        }
    }

    return ret;
}

