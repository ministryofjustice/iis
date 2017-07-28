module.exports = {
    objectKeysInArray,
    itemsInQueryString,
    removeArrayContentsFromObject,
    formItemsArray,
    filterUserInputByArray,
    arrayDifference
};

function objectKeysInArray(object, array) {
    return Object.keys(object).filter(objectKey => array.includes(objectKey));
}

function itemsInQueryString(queryString) {
    return Object.keys(queryString).map(key => queryString[key]);
}

function removeArrayContentsFromObject(object, array) {
    return Object.keys(object).reduce((newObject, itemKey) => {
        if (!array.includes(itemKey)) {
            return Object.assign({}, newObject, {[itemKey]: object[itemKey]});
        }
        return newObject;
    }, {});
}

function formItemsArray(items) {
    const array = typeof items === 'string' ? [items] : items;
    return array;
}

function filterUserInputByArray(filterArray) {
    return function(formResponse) {
        return Object.keys(formResponse).filter(field => filterArray.includes(field));
    };
}

function arrayDifference(array1, array2) {
    return array1.filter(uiTerm => !array2.includes(uiTerm));
}
