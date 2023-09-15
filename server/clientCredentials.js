const config = require('../server/config');

module.exports = function generateOauthClientToken(
    clientId = config.sso.clientId,
    clientSecret = config.sso.clientSecret
) {
  const token = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  return `Basic ${token}`;
};
