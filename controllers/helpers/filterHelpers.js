module.exports = {
    getInputtedFilters,
    addFiltersToUserInput
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
    },
    Lifer: {
        parameter: 'isLifer', value: true
    }
};

function getInputtedFilters(query, type) {

    if (!query.filters) return {};

    const filters = typeof query.filters === 'string' ? [query.filters] : query.filters;

    if(type === 'QUERY') {
        return filters.map(filter => filterValues[filter].parameter)
                      .filter((key, index, array) => array.indexOf(key) === index)
                      .reduce(createParamatersFromFilters(filterValues, filters), {});
    }

    return filters.reduce((concat, filter) => Object.assign({}, concat, {[filter]: true}), {});
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

    const newUserInput = Object.assign({}, userInput);

    Object.keys(newUserInput).forEach(input => {
        if (filterParameters.has(input)){
            delete newUserInput[input];
        }
    });

    return newUserInput;
}

function addFiltersToUserInput(userInput, query) {
    const filtersForQuery = getInputtedFilters(query, 'QUERY');
    const cleanInput = removeAllFilters(userInput);

    if (!filtersForQuery) {
        return Object.assign({}, cleanInput);
    }
    return Object.assign({}, cleanInput, filtersForQuery);
}
