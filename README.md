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
 - `gulp silent-test` -> runs all unit tests with logging turned off
 - `gulp clean` -> cleans previously generated files
 - `gulp build` -> cleans and regenerates assets. This is also the default gulp task
 
 Gulp tasks are defined in individual files under/gulp.
 Coordinating tasks such as `dev`, `test` etc are defined in `/gulp/tasks.js`
 
 NB You can disable logging output during test execution either by running the `silent-test` task instead of `test`,
 or by setting the NODE_ENV environment variable to `test`, eg
 
 ` TEST_ENV=test gulp test`


# User Accounts
A user account can be created by supplying the required database 
connection environment variables and executing node utils/app-create-user.js, eg

`DB_SERVER=something  DB_PASS=secretThing node utils/app-create-user.js`



