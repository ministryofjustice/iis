const logger = require('../log');
const utils = require('../data/utils');
const subject = require('../data/subject');
const content = require('../data/content');
const audit = require('../data/audit');


exports.getSubject = function(req, res) {
    let page = req.params.page;
    let prisonNumber = utils.padPrisonNumber(req.params.id);
    saveVisited(req.session, req.params.id);

    audit.record('VIEW', req.user.email, {page: page, prisonNumber: prisonNumber});

    subject.info(prisonNumber, function(err, data) {
        if (err) {
            logger.error('Error during get subject info', err);
            renderErrorPage(res, err);
            return;
        }

        let summary = data;
        let ids = {
            prisonNumber: prisonNumber,
            personIdentifier: data.personIdentifier
        };

        subject[page](ids, function(err, details) {
            if (err) {
                renderErrorPage(res, err);
                return;
            }

            if (details.dob) {
                details.age = utils.getAgeFromDOB(details.dob);
            }

            let data = {
                subject: summary,
                details: details,
                noResultsText: content.view.subject[page]
            };
            renderPage(res, {page: page, data: data, lastPageNum: req.session.lastPage || 1});
        });
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