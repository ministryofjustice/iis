const logger = require('../log');
const audit = require('../data/audit');
const pdf = require('./helpers/pdfHelpers');

const DATA_ERROR = {
  title: 'An error occurred retrieving audit data',
  desc: 'Please reload the page to try again'
};

const availablePrintOptions = {
  latestAccess: {
    title: 'Latest action per user',
    addContent: pdf.twoColumnTable,
    getData: audit.getLatestActions
  }
};

exports.getIndex = (req, res) => {
  logger.info('GET /admin', req.user.email);

  audit.getLatestActions()
      .then(data => {
        return res.render('admin', {
          content: {title: 'Admin'},
          latestAccess: data
        });
      })
      .catch(error => {
        logger.error('Error accessing latest actions: ' + error.message);

        return res.render('admin', {
          content: {title: 'Admin'},
          latestAccess: [],
          err: DATA_ERROR
        });
      });
};

exports.printItems = (req, res) => {

  audit.getLatestActions()
      .then(data => {
        pdf.createPdf(res, ['latestAccess'], [data], availablePrintOptions);
      })
      .catch(error => {
        logger.error('Error printing latest actions: ' + error.message);

        return res.render('admin', {
          content: {title: 'Admin'},
          latestAccess: [],
          err: DATA_ERROR
        });
      });
};
