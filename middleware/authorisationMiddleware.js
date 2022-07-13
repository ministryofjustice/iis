const jwtDecode = require('jwt-decode');
const logger = require('../log');
const asyncMiddleware = require('./asyncMiddleware');

module.exports = function authorisationMiddleware(authorisedRoles) {
  if (authorisedRoles === undefined) {
    authorisedRoles = [];
  }
  return asyncMiddleware(function(req, res, next) {
    if (res.locals && res.locals.user && res.locals.token) {
      const {authorities: roles = []} = jwtDecode(res.locals.user.token);
      if (authorisedRoles.length && !roles.some(role => authorisedRoles.includes(role))) {
        logger.error('User is not authorised to access this');
        return res.redirect('/authError');
      }
      return next();
    }
    req.session.returnTo = req.originalUrl;
    return res.redirect('/sign-in');
  });
};
