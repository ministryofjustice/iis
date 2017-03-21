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
  
4. Visit [localhost:3000](http://localhost:3000/)

## Developer Commands

 - `gulp lint` -> style checks using eslint
 - `gulp test` -> runs all unit tests
 (Note that tests run with authentication disabled and sending logs to file in iis-ui.log)
 - `gulp clean` -> cleans previously generated files
 - `gulp build` -> cleans and regenerates assets. This is also the default gulp task
 
 Gulp tasks are defined in individual files under/gulp.
 Coordinating tasks such as `dev`, `test` etc are defined in `/gulp/tasks.js`
 

# SSO

There are two options for authentication:

* Run the IIS Mock SSO (available in GitHub) - user is automatically logged in via mock SSO

* Set the environment variables listed below to direct SSO requests to an instance of MoJ SSO


# Environment variables

The following environment variables are required

* DB_USER - username for DB access
* DB_PASS - password for DB access
* DB_SERVER - DB server host
* DB_NAME - DB name
* HTTPS - set to true to run in HTTPS mode, otherwise HTTP
* SESSION_SECRET - ? todo
* CLIENT_ID - SSO Client ID
* CLIENT_SECRET - SSO Client secret
* REDIRECT_URI - Redirect URI for SSO callback - specify service host location with path of /authentication
* TOKEN_HOST - SSO server host
* AUTHORIZE_PATH - SSO authorization endpoint, usually /oauth/authorize
* TOKEN_PATH - SSO token endpoint, usually /oauth/token
* USER_DETAILS_PATH - SSO user details endpoint, usually /api/user_details

