
exports.objectKeysInArray = (object, array) => Object.keys(object).filter(objectKey => array.includes(objectKey));

exports.itemsInQueryString = queryString => Object.keys(queryString).map(key => queryString[key]);

