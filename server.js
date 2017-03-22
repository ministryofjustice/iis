'use strict';
// Azure App Insights
if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    require("applicationinsights").setup().start();
}

const app = require('./server/app');
// TODO: move all references to use server/app directly
module.exports = app;

app.listen(app.get('port'), function() {
    console.log('IIS server listening on port ' + app.get('port'));
});
