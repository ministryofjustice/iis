const {getSubjectsForComparison} = require('../data/subject');
const MAX_PRISONERS_FOR_COMPARISON = 3;
const {capital} = require('./helpers/textHelpers');
const {createUrl, retainUrlQuery, removeValue} = require('./helpers/urlHelpers');
const logger = require('../log');
const audit = require('../data/audit');
const url = require('url');

exports.getComparison = function(req, res) {
  const idsToCompare = req.params.prisonNumbers.split(',');

  audit.record('COMPARISON', req.user.email, idsToCompare);

  getSubjectsForComparison(idsToCompare)
      .then(result => res.render('comparison/index', parseResult(idsToCompare, req, result)))
      .catch(error => {
        logger.error('Error during comparison search: ' + error.message);
        const query = {error: error.code};
        return res.redirect(createUrl('/search', query));
      });
};

function parseResult(idsToCompare, req, result) {

  const limitedSubjects = result.slice(0, MAX_PRISONERS_FOR_COMPARISON);
  const returnQuery = retainUrlQuery(req.url);
  const returnPath = getReturnPath(req);
  const returnClearShortListQuery =
        createUrl('/search/results', removeTermsFrom(req.query, ['shortList', 'shortListName']));


  const orderedSubjects = idsToCompare.map(id => {
    return limitedSubjects.find(subject => subject.summary.prisonNumber === id);
  });

  const subjects = addRemoveLinksFor(orderedSubjects, req.query);

  return {
    content: {title: 'Prisoner Comparison'},
    subjects,
    returnQuery,
    returnPath,
    returnClearShortListQuery,
    moment: require('moment'),
    setCase: {capital},
    showAliases: anyContain('aliases', subjects),
    showAddresses: anyContain('addresses', subjects),
    comparisonEnabled: true
  };
}

function getReturnPath(req) {
  if (isEmpty(req.session.userInput)) {
    return '/search';
  } else {
    return '/search/results';
  }
}

function isEmpty(obj) {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }

  return JSON.stringify(obj) === JSON.stringify({});
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
