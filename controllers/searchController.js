
function addSelectionVisitedData(data, session) {
    if (!session.visited || session.visited.length === 0) {
        return data;
    }

    return data.map(inmate => {
        inmate.visited = session.visited.includes(inmate.prisonNumber);
        return inmate;
    });
}

function addFiltersToUserInput(userInput, query) {
    const filtersForQuery = getInputtedFilters(query, 'QUERY');
    const cleanInput = removeAllFilters(userInput);

    if (!filtersForQuery) {
        return Object.assign({}, cleanInput);
    }
    return Object.assign({}, cleanInput, filtersForQuery);
}


function getSearchTermsForView(userInput) {

    let searchTerms = {};

    Object.keys(content.termDisplayNames.asIs).forEach(term => {
        if (userInput[term]) {
            searchTerms[content.termDisplayNames.asIs[term]] = userInput[term];
        }
    });

    Object.keys(content.termDisplayNames.capitals).forEach(term => {
        if (userInput[term]) {
            searchTerms[content.termDisplayNames.capitals[term]] = Case.capital(userInput[term]);
        }
    });

    if (userInput['dobOrAge'] === 'dob') {
        let dobParts = [userInput['dobDay'], userInput['dobMonth'], userInput['dobYear']];
        searchTerms[content.termDisplayNames['dob']] = dobParts.join('/');
    }

    return searchTerms;
}

            logger.error('Error during number of rows search ', {error: error});
            const query = {error: error.code};
            return res.redirect(createUrl('/search', query));
    logger.error('content.dbErrorCodeMessages has no message for', {error: errorCode});
function addSelectionVisitedData(data, session) {
    if (!session.visited || session.visited.length === 0) {
        return data;
    }

    return data.map(inmate => {
        inmate.visited = session.visited.includes(inmate.prisonNumber);
        return inmate;
    });
}

function addFiltersToUserInput(userInput, query) {
    const filtersForQuery = getInputtedFilters(query, 'QUERY');
    const cleanInput = removeAllFilters(userInput);

    if (!filtersForQuery) {
        return Object.assign({}, cleanInput);
    }
    return Object.assign({}, cleanInput, filtersForQuery);
}


function getSearchTermsForView(userInput) {

    let searchTerms = {};

    Object.keys(content.termDisplayNames.asIs).forEach(term => {
        if (userInput[term]) {
            searchTerms[content.termDisplayNames.asIs[term]] = userInput[term];
        }
    });

    Object.keys(content.termDisplayNames.capitals).forEach(term => {
        if (userInput[term]) {
            searchTerms[content.termDisplayNames.capitals[term]] = Case.capital(userInput[term]);
        }
    });

    if (userInput['dobOrAge'] === 'dob') {
        let dobParts = [userInput['dobDay'], userInput['dobMonth'], userInput['dobYear']];
        searchTerms[content.termDisplayNames['dob']] = dobParts.join('/');
    }

    return searchTerms;
}
