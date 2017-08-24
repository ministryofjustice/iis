const {getSubjectsForComparison} = require('../data/subject');
const MAX_PRISONERS_FOR_COMPARISON = 3;
const {capital} = require('./helpers/textHelpers');
const {createUrl, retainUrlQuery} = require('./helpers/urlHelpers');
const logger = require('../log');
const audit = require('../data/audit');
const PATH = '/comparison/';

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
    const subjects = addRemoveLinksFor(limitedSubjects);

    return {
        content: {title: 'Prisoner Comparison'},
        subjects,
        moment: require('moment'),
        returnQuery: retainUrlQuery(req.url),
        returnClearShortListQuery: removeShortListFrom(req.query),
        setCase: {capital}
    };
}

function addRemoveLinksFor(subjects) {
    const path = '/comparison/';
    const allPrisonNumbers = subjects.map(subject => subject.summary.prisonNumber);

    return subjects.map(subjectWithRemoveHref(path, allPrisonNumbers));
}

const subjectWithRemoveHref = (path, allPrisonNumbers) => subject => {
    const prisonNumbersToSearch = allPrisonNumbers.filter(number => number !== subject.summary.prisonNumber);
    const pathString = path.concat(prisonNumbersToSearch.join(','));

    return Object.assign({}, subject, {removePath: pathString});
};

function removeShortListFrom(queryObj) {
    const shortListItems = ['shortList', 'shortListName'];
    const urlObject = Object.keys(queryObj).reduce((object, item) => {
        if (!shortListItems.includes(item)) {
            return Object.assign({}, object, {[item]: queryObj[item]});
        }
        return object;
    }, {});
    return createUrl('/search/results', urlObject);
}
