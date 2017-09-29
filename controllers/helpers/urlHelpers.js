const url = require('url');

module.exports = {
    getQueryStringsForSearch,
    mergeIntoQuery,
    toggleFromQueryItem,
    removeValue,
    getUrlAsObject,
    createUrl,
    retainUrlQuery
};


function getQueryStringsForSearch(currentUrl) {
    const query = url.parse(currentUrl, true).query;
    const currentPage = query.page ? query.page : 1;

    const queryStrings = {
        nextPage: url.format({query: Object.assign({}, query, {page: Number(currentPage) + 1})}),
        thisPage: url.format({query}),
        prevPage: url.format({query: Object.assign({}, query, {page: Number(currentPage) - 1})})
    };

    if (query.shortList) {
        return Object.assign(queryStrings, {shortList: url.format({query: {shortList: query.shortList}})});
    }

    return queryStrings;
}

// append to existing query
function mergeIntoQuery(queryObject, objectToMergeIn) {
    return Object.assign({}, queryObject, objectToMergeIn);
}

function removeValue(query, term, value) {
    if (containsValue(query, term, value)) {
        return deleteValue(query, term, value);
    }
    return query;
}

function toggleFromQueryItem(req, term, value, referrer = false) {

    const query = !referrer ? req.query : getUrlAsObject(req.get('referrer')).query;

    if (containsValue(query, term, value)) {
        return deleteValue(query, term, value)
    } else {
        return addValue(query, term, value)
    }
}

function containsValue(query, term, value) {
    return query[term] && asArray(query[term]).includes(value);
}

function deleteValue(query, term, value) {
    if (asArray(query[term]).includes(value)) {
        const index = asArray(query[term]).indexOf(value);
        return mergeIntoQuery(query, {[term]: deleteFromArray(asArray(query[term]), index)});
    }
}

function addValue(query, term, value) {
    const item = query[term] ? [...asArray(query[term]), value] : value;
    return mergeIntoQuery(query, {[term]: item});
}

function asArray(possibleArray) {
    return typeof possibleArray === 'string' ? [possibleArray] : possibleArray;
}

const deleteFromArray = (array, index) => array.slice(0, index).concat(array.slice(index + 1));

function getUrlAsObject(urlToParse) {
    return url.parse(urlToParse, true);
}

function createUrl(pathname, queryObject) {
    return url.format({pathname, query: queryObject});
}

function retainUrlQuery(urlToParse) {
    return url.parse(urlToParse).search ? url.parse(urlToParse).search : '';
}
