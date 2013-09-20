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

/**
 * Either casts an array to an object or combines two arrays containing
 * keys and values.
 *
 * @param {Array} first - the first array to be used
 * @param {Array} second - the second array to be used
 * @return {Object}
 */
Array.toObject = function(first, second)
{
    if (1 == arguments.length && first instanceof Array) {

        var object = {};

        first.forEach(function(itm, idx) {
            object[idx] = itm;
        });

        return object;
    }

    if (2 == arguments.length &&
        first instanceof Array &&
        second instanceof Array) {

        if (first.length !== second.length) {

            throw new TypeError(
                'Length mismatch. The length of the given arrays didn\'t match.'
            );
            return;
        }

        var object = {};

        first.forEach(function(item, idx) {
            object[item] = second[idx];
        });

        return object;
    }

    throw new Error('Argument amount didn\'t match or they weren\'t instances of Array.');
}

