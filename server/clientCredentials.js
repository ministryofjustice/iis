const config = require('../server/config');

module.exports = function generateOauthClientToken(
    clientId = config.sso.CLIENT_ID,
    clientSecret = config.sso.CLIENT_SECRET
) {
  const token = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  return `Basic ${token}`;
};
