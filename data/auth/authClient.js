const request = require('request-promise');
const config = require('../../server/config');
const uuidV1 = require('uuid/v1');

const ssoConfig = config.sso;

function userFor(userDetails) {
    return {
        id: userDetails.userId,
        firstName: userDetails.name.split(' ').slice(0, -1).join(' '),
        lastName: userDetails.name.split(' ').slice(-1).join(' '),
        profileLink: ssoConfig.TOKEN_HOST + ssoConfig.USER_PROFILE_PATH,
        logoutLink: ssoConfig.TOKEN_HOST + ssoConfig.SIGN_OUT_PATH,
        sessionTag: uuidV1()
    };
}

module.exports = function(token) {
  const ssoConfig = config.sso;
  const userDetailsOptions = {
    uri: ssoConfig.TOKEN_HOST + ssoConfig.USER_DETAILS_PATH,
    qs: {access_token: token},
    json: true
  };
  const userEmailOptions = {
    uri: ssoConfig.TOKEN_HOST + ssoConfig.USER_EMAIL_PATH,
    qs: {access_token: token},
    json: true
  };

  return request(userDetailsOptions)
      .then(userFor)
      .then(function(userDetails) {
          return request(userEmailOptions)
              .then(function(email) {
                  return { ...userDetails, email: email.email }
              })
      })
};
