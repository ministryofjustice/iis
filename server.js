'use strict';
require('./azure-appinsights');

const logger = require('./log');

const app = require('./server/app');
// TODO: move all references to use server/app directly
module.exports = app;


app.listen(app.get('port'), function() {
    logger.info('IIS server listening on port ' + app.get('port'));
});
