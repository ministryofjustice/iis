const logger = require('../log');
const utils = require('../data/utils');
const {
    getSubject,
    getMovements,
    getAliases,
    getAddresses,
    getOffences,
    getHDCInfo,
    getHDCRecall,
    getAdjudications
} = require('../data/subject');
const content = require('../data/content');
const audit = require('../data/audit');
const dataRequestFunction = {
    movements: getMovements,
    aliases: getAliases,
    addresses: getAddresses,
    offences: getOffences,
    hdcinfo: getHDCInfo,
    hdcrecall: getHDCRecall,
    adjudications: getAdjudications
};

exports.getSubject = function(req, res) {
    const {page, id} = req.params;
    const prisonNumber = utils.padPrisonNumber(id);
    saveVisited(req.session, id);
    audit.record('VIEW', req.user.email, {page: page, prisonNumber: prisonNumber});

    const pageObject = {
        res,
        page,
        subjectData: {},
        pageData: {},
        noResultsText: content.view.subject[page],
        lastPageNum: req.session.lastPage || 1
    };

    getSubject(prisonNumber).then((subjectData) => {

        pageObject.subjectData = subjectData;
        if(page === 'summary') {
            return renderPage(pageObject);
        }

        getPageSpecificDataAndRender(pageObject);

    }).catch((error) => {
        logger.error('Error during get subject request: ', error.message);
        renderErrorPage(res, error);
    });
};

function getPageSpecificDataAndRender(pageObject) {

    const {res, page, subjectData} = pageObject;
    const {prisonNumber, personIdentifier} = subjectData;

    dataRequestFunction[page]({prisonNumber, personIdentifier})
        .then((pageSpecificData) => {

            pageObject.pageData = pageSpecificData;
            return renderPage(pageObject);

        }).catch((error) => {

            logger.error('Error during get details request: ', error.message);
            renderErrorPage(res, error);
    });
}

function renderPage(data) {
    const {res, page, pageData, subjectData, lastPageNum, noResultsText} = data;

    res.render('subject/' + page, {
        data: {details: pageData, subject: subjectData, noResultsText},
        content: content.view.subject,
        lastPageNum: lastPageNum,
        nav: getNavigation(page)
    });
}

function renderErrorPage(res, err) {
    logger.error('Error getting subject details', {error: err});
    res.render('subject/error', {
        content: content.view.subject,
        title: content.errMsg.INVALID_ID,
        err: {
            title: content.errMsg.INVALID_ID
        }
    });
}

function getNavigation(page) {
    let nav = {
        summary: {title: 'Summary'},
        movements: {title: 'Movements'},
        hdcinfo: {title: 'HDC history'},
        offences: {title: 'Offences'},
        adjudications: {title: 'Offences in custody'},
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
