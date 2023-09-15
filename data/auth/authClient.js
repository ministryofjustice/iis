const uuid = require('uuid');

const config = require('../../server/config');
const get = require('../restClient');

const ssoConfig = config.sso;

function userFor(userDetails) {
  return {
    id: userDetails.userId,
    firstName: userDetails.name.split(' ').slice(0, -1).join(' '),
    lastName: userDetails.name.split(' ').slice(-1).join(' '),
    profileLink: ssoConfig.url + ssoConfig.userProfilePath,
    logoutLink: ssoConfig.url + ssoConfig.signOutPath,
    sessionTag: uuid.v1()
  };
}

module.exports = function(token) {
  return get(ssoConfig.userDetailsPath, config.sso, token)
      .then(userFor)
      .then(userDetails =>
        get(ssoConfig.userEmailPath, config.sso, token)
            .then(email => {
              if (!email) {
                throw new Error('User has no email address. This is required for audit continuity.');
              }
              return Object.assign({email: email.email, token}, userDetails);
            })
      );
};
