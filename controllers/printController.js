const content = require('../data/content');
const logger = require('../log');
const url = require('url');
const {
  objectKeysInArray,
  itemsInQueryString
} = require('./helpers/formHelpers');
const {getSubject} = require('../data/subject');
const {retainUrlQuery} = require('./helpers/urlHelpers');
const pdf = require('./helpers/pdfHelpers');
const audit = require('../data/audit');
const Case = require('case');

const availablePrintOptions = {
  summary: {
    summary: {
      title: 'Subject',
      addContent: pdf.subjectContent
    }
  },
  sentenceSummary: {
    sentenceSummary: {
      title: 'Sentence Summary',
      addContent: pdf.sentenceSummaryContent
    }
  },
  sentencing: {
    sentencing: {
      title: 'Sentence History',
      addContent: pdf.sentenceHistoryContent
    }
  },
  courtHearings: {
    courtHearings: {
      title: 'Court Hearings',
      addContent: pdf.courtHearingsContent
    }
  },
  movements: {
    movements: {
      title: 'Movements',
      addContent: pdf.movementContent
    }
  },
  hdc: {
    hdcRecall: {
      title: 'HDC recall',
      addContent: pdf.hdcRecallContent
    },
    hdcInfo: {
      title: 'HDC history',
      addContent: pdf.hdcInfoContent
    }
  },
  offences: {
    offences: {
      title: 'Offences',
      addContent: pdf.offenceContent
    }
  },
  offencesInCustody: {
    offencesInCustody: {
      title: 'Offences in custody',
      addContent: pdf.custodyOffenceContent
    }
  },
  addresses: {
    addresses: {
      title: 'Addresses',
      addContent: pdf.addressContent
    }
  },
  aliases: {
    aliases: {
      title: 'Aliases',
      addContent: pdf.aliasContent
    }
  }
};

exports.getPrintForm = (req, res) => {
  logger.debug('GET /print');

  const prisonNo = req.params.prisonNo;
  const err = req.query.err;

  if (!prisonNo) {
    logger.debug('no prison number');
    return res.redirect('/search');
  }
  renderFormPage(req, res, prisonNo, err);
};

function renderFormPage(req, res, prisonNo, err) {
  const renderData = {
    content: content.view.print,
    prisonNumber: prisonNo,
    name: null,
    err: err ? getDisplayError(err) : null,
    returnQuery: retainUrlQuery(req.url)
  };

  if (!err || err !== 'db') return getNameAndRender(res, renderData);
  renderWithoutName(res, renderData);
}

function getNameAndRender(res, renderData) {
  return getSubject(renderData.prisonNumber)
      .then(subject => {

        renderData.name = {
          forename: Case.capital(subject.summary.firstName),
          surname: subject.summary.lastName
        };

        return res.render('print', renderData);
      })
      .catch(error => showDbError({error}, renderData.prisonNumber, res));
}

function renderWithoutName(res, renderData) {
  return res.render('print', renderData);
}

exports.postPrintForm = (req, res) => {
  logger.debug('POST /print');

  const prisonNo = req.params.prisonNo;
  if (!req.body.printOption) {
    logger.warn('No print items selected');
    return renderFormPage(req, res, prisonNo, 'noneSelected');
  }

  const userReturnedOptions = Array.isArray(req.body.printOption) ? req.body.printOption : [req.body.printOption];
  audit.record('PRINT', req.user.email, {prisonNo, fieldsPrinted: userReturnedOptions});

  const selectedOptions = objectKeysInArray(availablePrintOptions, userReturnedOptions);
  const query = {
    fields: selectedOptions
  };

  const redirectUrl = url.format({pathname: `/print/${req.params.prisonNo}/pdf`, query});
  return res.redirect(redirectUrl);
};

exports.getPdf = function(req, res) {

  const prisonNumber = req.params.prisonNo;
  if (!prisonNumber || !req.query.fields) {
    logger.debug('no prison number or query fields');
    return res.redirect('/search');
  }

  const fieldsInQuery = Array.isArray(req.query.fields) ? req.query.fields : [req.query.fields];
  const printItems = itemsInQueryString(fieldsInQuery).filter(item => availablePrintOptions[item]);

  const dataFunctionsToCall = getDataFunctionsToCall(printItems);

  return getSubject(prisonNumber, dataFunctionsToCall.map(dataFunction => dataFunction))
      .then(data => {
        pdf.createPdf(res, printItems, data, availablePrintOptions, {type: 'searchPrint'});
      })
      .catch(error => {
        showDbError({error}, prisonNumber, res);
      });
};

const getDataFunctionsToCall = printItems => {
  const flattenedPrintItems = printItems.map(item => Object.keys(availablePrintOptions[item]))
      .reduce((a, b) => a.concat(b), []);

  return [...new Set(flattenedPrintItems)];
};

function showDbError(error, prisonNo, res) {

  logger.error('Error during data collection for pdf ', error);

  const query = {
    err: 'db'
  };
  const redirectUrl = url.format({pathname: `/print/${prisonNo}`, query});
  return res.redirect(redirectUrl);
}

function getDisplayError(type) {
  const error = {
    db: {title: content.pdf.dbError.title, desc: content.pdf.dbError.desc},
    noneSelected: {title: content.view.print.noneSelected}
  };

  return error[type];
}
