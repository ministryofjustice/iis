const {getSubjectsForComparison} = require('../data/subject');
const MAX_PRISONERS_FOR_COMPARISON = 3;
const {capital} = require('./helpers/textHelpers');
const {retainUrlQuery} = require('./helpers/urlHelpers');

exports.getComparison = function(req, res) {
    const idsToCompare = req.params.prisonNumbers.split(',');

    getSubjectsForComparison(idsToCompare)
        .then(result => res.render('comparison/index', parseResult(req.url, result)))
        .catch(() => {

        });
};

function parseResult(url, result) {

    const limitedSubjects = result.slice(0, MAX_PRISONERS_FOR_COMPARISON);
    const subjects = addRemoveLinksFor(limitedSubjects);

    return {
        content: {title: 'Prisoner Comparison'},
        subjects,
        moment: require('moment'),
        returnQuery: retainUrlQuery(url),
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
