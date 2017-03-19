# HOA-UI
Ministry of Justice Inmate Information System - Historical Offenders Application UI.

[![CircleCI](https://circleci.com/gh/noms-digital-studio/iis.svg?style=shield)](https://circleci.com/gh/noms-digital-studio/iis)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-google-brightgreen.svg)](http://standardjs.com/)

# Get Started

1. Install the dependencies required to run the service:

  ```
  $ npm install
  ```  
2. Supply environment variables. The required environment variables are defined in server/config.js.


3. Start the server

  ```   
  $ npm start
  ```

   Or, for development, run inspections, tests, watch for changes and start the server:
   
  ```   
  $ gulp dev
  ```
  
  Or, for development without SSO authentication, set AUTHENTICATION_ENABLED to false
  ```
  $ AUTHENTICATION_ENABLED=false gulp dev
  ```
  
4. Visit [localhost:3000](http://localhost:3000/)

## Developer Commands

 - `gulp lint` -> style checks using eslint
 - `gulp test` -> runs all unit tests
 - `gulp silent-test` -> runs all unit tests with logging turned off
 - `gulp clean` -> cleans previously generated files
 - `gulp build` -> cleans and regenerates assets. This is also the default gulp task
 
 Gulp tasks are defined in individual files under/gulp.
 Coordinating tasks such as `dev`, `test` etc are defined in `/gulp/tasks.js`
 
 NB You can disable logging output during test execution either by running the `silent-test` task instead of `test`,
 or by setting the NODE_ENV environment variable to `test`, eg
 
 ` TEST_ENV=test gulp test`


# SSO

Unless AUTHENTICATION_ENABLED is false, the service requires users to authenticate via MOJ SSO. Supply the
required environment variables to direct to the appropriate SSO server.

With authentication off, eg in dev, a default test user profile is used and access is
open.

For development, you may wish to run IIS_MOCK_SSO which can be found in GitHub.


# Environment variables

The following environment variables are required

* DB_USER - username for DB access
* DB_PASS - password for DB access
* DB_SERVER - DB server host
* DB_NAME - DB name
* AUTHENTICATION_ENABLED - set to true to enable SSO authentication, otherwise default test user profile used 
* HTTPS - set to true to run in HTTPS mode, otherwise HTTP
* SESSION_SECRET - ?
* CLIENT_ID - SSO Client ID
* CLIENT_SECRET - SSO Client secret
* REDIRECT_URI - Redirect URI for SSO callback - specify service host location with path of /authentication
* TOKEN_HOST - SSO server host
* AUTHORIZE_PATH - SSO authorization endpoint, usually /oauth/authorize
* TOKEN_PATH - SSO token endpoint, usually /oauth/token
* USER_DETAILS_PATH - SSO user details endpoint, usually /api/user_details

