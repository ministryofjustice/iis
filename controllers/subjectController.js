const logger = require('../log');
const utils = require('../data/utils');
const url = require('url');
const {
    getSubject,
    getMovements,
    getAliases,
    getAddresses,
    getOffences,
    getHDCInfo,
    getHDCRecall,
    getAdjudications,
    getCourtHearings,
    getSentenceHistory
} = require('../data/subject');
const content = require('../data/content');
const audit = require('../data/audit');
const dataRequestFunction = {
    movements: [getMovements],
    aliases: [getAliases],
    addresses: [getAddresses],
    offences: [getOffences],
    hdcinfo: [getHDCInfo],
    hdcrecall: [getHDCRecall],
    offencesincustody: [getAdjudications],
    summary: [getCourtHearings, getSentenceHistory],
    sentences: [getSentenceHistory]
};

exports.getSubject = function(req, res) {

    const {page, id} = req.params;
    const prisonNumber = utils.padPrisonNumber(id);
    saveVisited(req.session, id);
    audit.record('VIEW', req.user.email, {page, prisonNumber});

    const pageObject = {
        res,
        page,
        subjectData: {},
        pageData: {},
        noResultsText: content.view.subject[page],
        returnQuery: url.parse(req.url).search ? url.parse(req.url).search : ''
    };

    return getSubject(prisonNumber)
        .then(subjectData => {

            pageObject.subjectData = subjectData;

            return getPageSpecificDataAndRender(pageObject);

    }).catch(error => {
        logger.error('Error during get subject request: ', error.message);
        renderErrorPage(res, error);
    });
};

function getPageSpecificDataAndRender(pageObject) {

    const {res, page, subjectData} = pageObject;
    const {prisonNumber} = subjectData;

    let dataFunctions = dataRequestFunction[page];

    return Promise.all(dataFunctions.map(f => f(prisonNumber)))
        .then(pageSpecificData => {

            if (pageSpecificData.length === 1) {
                pageObject.pageData = pageSpecificData[0];
            } else {
                pageObject.pageData = pageSpecificData;
            }
            return renderPage(pageObject);

        }).catch(error => {

        logger.error('Error during get details request: ', error.message);
        renderErrorPage(res, error);
    });
}

function renderPage(data) {
    const {res, page, pageData, subjectData, noResultsText, returnQuery} = data;

    res.render('subject/' + page, {
        data: {details: pageData, subject: subjectData, noResultsText},
        content: content.view.subject,
        returnQuery,
        nav: getNavigation(page)
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
        hdcinfo: {title: 'HDC history'},
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
