const logger = require('../log');
const utils = require('../data/utils');
const {
    getInfo,
    getSummary,
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
    summary: getSummary,
    movements: getMovements,
    aliases: getAliases,
    addresses: getAddresses,
    offences: getOffences,
    hdcinfo: getHDCInfo,
    hdcrecall: getHDCRecall,
    adjudications: getAdjudications
};

exports.getSubject = function(req, res) {
    let page = req.params.page;
    let prisonNumber = utils.padPrisonNumber(req.params.id);
    saveVisited(req.session, req.params.id);

    audit.record('VIEW', req.user.email, {page: page, prisonNumber: prisonNumber});

    getInfo(prisonNumber)
        .then((info) => {
            const summary = info;
            dataRequestFunction[page]({prisonNumber, personIdentifier: summary.personIdentifier})
                .then((details) => {
                    if (details.dob !== 'Unknown') {
                        details.age = utils.getAgeFromDOB(details.dob);
                    }
                    const data = {
                        subject: summary,
                        details,
                        noResultsText: content.view.subject[page]
                    };
                    renderPage(res, {page, data, lastPageNum: req.session.lastPage || 1});
                }).catch((error) => {
                    renderErrorPage(res, error);
                });

        }).catch((error) => {
            logger.error('Error during get subject info', error);
            renderErrorPage(res, error);
        });
};

function renderPage(res, obj) {
    res.render('subject/' + obj.page, {
        data: obj.data,
        content: content.view.subject,
        lastPageNum: obj.lastPageNum,
        nav: getNavigation(obj.page)
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
        aliases: {title: 'Aliases'},
        addresses: {title: 'Addresses'},
        adjudications: {title: 'Adjudications'}
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
