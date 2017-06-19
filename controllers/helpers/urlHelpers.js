const url = require('url');

module.exports = {
    getQueryStringsForSearch,
    mergeIntoQuery,
    toggleFromQueryItem,
    getUrlAsObject,
    createUrl
};


function getQueryStringsForSearch(currentUrl) {
    const query = url.parse(currentUrl, true).query;
    const currentPage = query.page ? query.page : 1;

    return {
        nextPage: url.format({query: Object.assign({}, query, {page: Number(currentPage) + 1})}),
        thisPage: url.format({query}),
        prevPage: url.format({query: Object.assign({}, query, {page: Number(currentPage) - 1})})
    };
}

// append to existing query
function mergeIntoQuery(queryObject, objectToMergeIn) {
    return Object.assign({}, queryObject, objectToMergeIn);
}

// if item exists in query remove it. Else add it
function toggleFromQueryItem(req, queryItem, itemToAddOrRemove, referrer = false) {
    const query = !referrer ? req.query : getUrlAsObject(req.get('referrer')).query;

    if(!query[queryItem]) {
        return mergeIntoQuery(query, {[queryItem]: itemToAddOrRemove});
    }

    if(typeof query[queryItem] === 'string') {
        query[queryItem] = [query[queryItem]];
    }

    if(query[queryItem].includes(itemToAddOrRemove)) {
        const index = query[queryItem].indexOf(itemToAddOrRemove);
        return mergeIntoQuery(query, {[queryItem]: deleteFromArray(query[queryItem], index)});
    }

    const item = [...query[queryItem], itemToAddOrRemove];
    return mergeIntoQuery(query, {[queryItem]: item});
}

const deleteFromArray = (array, index) => array.slice(0, index).concat(array.slice(index+1));

function getUrlAsObject(urlToParse) {
    return url.parse(urlToParse, true);
}

function createUrl(pathname, queryObject) {
    return url.format({pathname, query: queryObject});
}
