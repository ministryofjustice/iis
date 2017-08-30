const {getSubjectsForComparison} = require('../data/subject');
const MAX_PRISONERS_FOR_COMPARISON = 3;
const {capital} = require('./helpers/textHelpers');
const {createUrl, retainUrlQuery, removeValue} = require('./helpers/urlHelpers');
const logger = require('../log');
const audit = require('../data/audit');
const PATH = '/comparison/';
const url = require('url');

exports.getComparison = function(req, res) {
    const idsToCompare = req.params.prisonNumbers.split(',');

    audit.record('COMPARISON', req.user.email, idsToCompare);

    getSubjectsForComparison(idsToCompare)
        .then(result => res.render('comparison/index', parseResult(req, result)))
        .catch(error => {
            logger.error('Error during comparison search: ' + error.message);
            const query = {error: error.code};
            return res.redirect(createUrl('/search', query));
        });
};

function parseResult(req, result) {

    const limitedSubjects = result.slice(0, MAX_PRISONERS_FOR_COMPARISON);
    const returnQuery = retainUrlQuery(req.url);
    const subjects = addRemoveLinksFor(limitedSubjects, req.query);
    const returnClearShortListQuery = createUrl('/search/results', removeTermsFrom(req.query, ['shortList', 'shortListName']));

    return {
        content: {title: 'Prisoner Comparison'},
        subjects,
        returnQuery,
        returnClearShortListQuery,
        moment: require('moment'),
        setCase: {capital},
        showAliases: anyContain('aliases', subjects),
        showAddresses: anyContain('addresses', subjects),
    };
}

function addRemoveLinksFor(subjects, query) {
    const path = '/comparison/';
    const allPrisonNumbers = subjects.map(subject => subject.summary.prisonNumber);

    return subjects.map(subjectWithRemoveHref(path, allPrisonNumbers, query));
}

const subjectWithRemoveHref = (path, allPrisonNumbers, query) => subject => {
    const prisonNumbersToSearch = allPrisonNumbers.filter(number => number !== subject.summary.prisonNumber);
    const pathString = path.concat(prisonNumbersToSearch.join(','));

    const queryWithoutPrisonNumber = removeValue(query, 'shortList', subject.summary.prisonNumber);
    const queryWithoutName = removeTermsFrom(queryWithoutPrisonNumber, ['shortListName']);

    return Object.assign({}, subject, {removePath: pathString.concat(url.format({query: queryWithoutName}))});
};


function removeTermsFrom(queryObj, terms) {
    return Object.keys(queryObj).reduce((object, item) => {
        if (!terms.includes(item)) {
            return Object.assign({}, object, {[item]: queryObj[item]});
        }
        return object;
    }, {});
}

function anyContain(field, subjects) {
    return subjects.some(subject => {
        return subject[field] && subject[field].length > 0;
    });
}
