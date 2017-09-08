const logger = require('../log');
const {sentence, capital, capitalWithAcronyms, sentenceWithAcronyms} = require('./helpers/textHelpers');
const {getUrlAsObject, retainUrlQuery} = require('./helpers/urlHelpers');
const {getSubject} = require('../data/subject');
const content = require('../data/content');
const audit = require('../data/audit');
const dataRequiredForPage = {
    movements: ['movements'],
    aliases: ['aliases'],
    addresses: ['addresses'],
    offences: ['offences'],
    hdcinfo: ['hdcRecall', 'hdcInfo'],
    offencesincustody: ['offencesInCustody'],
    summary: ['sentenceSummary'],
    sentences: ['sentencing']
};


exports.getSubject = function(req, res) {

    const returnToShortlist = isShortlistView(req);
    const shortlistHref = returnToShortlist ? getShortlistHref(req) : '';

    const {page, id} = req.params;
    saveVisited(req.session, id);
    audit.record('VIEW', req.user.email, {page, prisonNumber: id});

    const pageObject = {
        res,
        page,
        subjectData: {},
        noResultsText: content.view.subject[page],
        returnQuery: retainUrlQuery(req.url),
        returnToShortlist,
        shortlistHref
    };

    return getSubject(id, dataRequiredForPage[page])
        .then(subjectData => {
            pageObject.subjectData = subjectData;
            return renderPage(pageObject);
        }).catch(error => {
            logger.error('Error during get subject request: ', error.message);
            renderErrorPage(res, error);
        });
};

function isShortlistView(req){
    const referrer = ''+req.get('referrer');
    return referrer && referrer.indexOf('/comparison') !== -1;
}

function getShortlistHref( req){
    const theQuery = getUrlAsObject(req.get('referrer')).query;
    return `/comparison/${asArray(theQuery.shortList).join(',')}`;
}

function renderPage(data) {
    const {res, page, subjectData, noResultsText, returnQuery, returnToShortlist, shortlistHref} = data;

    res.render('subject/' + page, {
        subject: subjectData,
        content: content.view.subject,
        returnQuery,
        returnToShortlist,
        shortlistHref,
        nav: getNavigation(page),
        noResultsText,
        moment: require('moment'),
        setCase: {capital, sentence, capitalWithAcronyms, sentenceWithAcronyms}
    });
}

function renderErrorPage(res, err) {
    logger.error('Error getting subject details', {error: err});
    res.render('subject/error', {
        content: content.view.subject,
        title: content.errMsg.DB_ERROR,
        err: {
            title: content.errMsg.DB_ERROR,
            desc: content.errMsg.DB_ERROR_DESC
        }
    });
}

function getNavigation(page) {
    let nav = {
        summary: {title: 'Sentence summary'},
        sentences: {title: 'Sentence history'},
        movements: {title: 'Movements'},
        hdcinfo: {title: 'HDC recalls and history'},
        offences: {title: 'Offences'},
        offencesincustody: {title: 'Offences in custody'},
        aliases: {title: 'Aliases'},
        addresses: {title: 'Addresses'}
    };

    nav[page].active = true;

    return nav;
}

function saveVisited(session, item) {
    if (session.visited && session.visited.length > 0) {
        session.visited.push(item);
    } else {
        session.visited = [item];
    }
}

function asArray(possibleArray){
    return typeof possibleArray === 'string' ? [possibleArray] : possibleArray;
}
