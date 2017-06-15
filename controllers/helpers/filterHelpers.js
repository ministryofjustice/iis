module.exports = {
    getInputtedFilters,
    removeAllFilters
};

const filterValues = {
    Female: {
        parameter: 'gender', value: 'F'
    },
    Male: {
        parameter: 'gender', value: 'M'
    },
    HDC: {
        parameter: 'hasHDC', value: true
    }
};

function getInputtedFilters(query) {

    if (!query.filters) return {filtersForQuery: null, filtersForView: {}};

    const filters = typeof query.filters === 'string' ? [query.filters] : query.filters;

    const filtersForQuery = filters.map(filter => filterValues[filter].parameter)
                                   .filter((key, index, array) => array.indexOf(key) === index)
                                   .reduce(createParamatersFromFilters(filterValues, filters), {});

    const filtersForView = filters.reduce((concat, filter) => Object.assign({}, concat, {[filter]: true}), {});

    return {filtersForQuery, filtersForView};
}

const createParamatersFromFilters = (filterValues, filters) => (combinedFilters, key) => {

    if(!combinedFilters[key]) combinedFilters[key] = [];

    filters.forEach(filter => {
        if(filterValues[filter].parameter === key) {
            combinedFilters[key].push(filterValues[filter].value);
        }
    });

    return combinedFilters;
};

function removeAllFilters(userInput) {
    const filterParameters = new Set(Object.keys(filterValues).map(filter => filterValues[filter].parameter));

    const newUserInput = Object.assign({}, userInput)

    Object.keys(newUserInput).forEach(input => {
        if (filterParameters.has(input)){
            delete newUserInput[input];
        }
    });

    return newUserInput;
}
