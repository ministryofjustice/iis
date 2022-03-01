const {getCollection} = require('./dataAccess/iisData');

module.exports = {
  dbCheck
};

function dbCheck() {
  return new Promise((resolve, reject) => {
    getCollection('SELECT 1 AS [ok]', null, resolve, reject);
  });
}
