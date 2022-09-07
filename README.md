# Historical Prisoner Application UI.

[![CircleCI](https://circleci.com/gh/noms-digital-studio/iis/tree/master.svg?style=svg)](https://circleci.com/gh/noms-digital-studio/iis/tree/master)
[![Known Vulnerabilities](https://snyk.io/test/github/noms-digital-studio/iis/badge.svg)](https://snyk.io/test/github/noms-digital-studio/iis)

# Get Started

1. Install the dependencies required to run the service:

  ```
  $ npm install
  ```  

2. Start the DB

Start the sql server instance by running `docker-compose up`.

This will create 1 DB: `IIS`, and 3 schemas: `IIS`, `NON_IIS` and `HPA`.

3 users will be created:

| Name         | Password
| sa           | NotVerySecretPa55word_SA_01
| iisuser      | NotVerySecretPa55word_IIS_01
| schemaowner  | NotVerySecretPa55word_IIS_01

It will then seed test data and finally run the DB migrations.

3. Start the App

```
NODE_ENV=test                        \
DB_SERVER=localhost                  \
DB_USER=iisuser                      \
DB_NAME=iis                          \
DB_PASS=NotVerySecretPa55word_IIS_01 \
ADMINISTRATORS=test@test.com         \
npm run start:dev
```

(environmental variables are listed in server/config.js)

This will disable auth.
The test user will have admin privileges and so can access the admin pages on `/admin`

Search uses data defined in the `[HPA].[PRISONERS]` table, e.g searching for `George` should return 3 results.
  
4. Visit [localhost:3000](http://localhost:3000/)

## Developer Commands

 - `npm run lint` -> style checks using eslint
 - `npm test` -> runs all unit tests
 (Note that tests run with authentication disabled and sending logs to file in tests.log)
 - `npm run clean` -> cleans previously generated files
 - `npm run build` -> cleans and regenerates assets

# SSO

There are two options for authentication:

* Run the IIS Mock SSO (available in GitHub) - user is automatically logged in via mock SSO

* Set the environment variables listed below to direct SSO requests to an instance of MoJ SSO


# Environment variables

The following environment variables are used and values should be supplied for correct operation but have defaults.

* ADMINISTRATORS - a comma separted list containing the list of emails belonging to admins
* DB_USER - username for DB access
* DB_PASS - password for DB access
* DB_SERVER - DB server host
* DB_NAME - DB name
* CLIENT_ID - SSO Client ID
* CLIENT_SECRET - SSO Client secret
* TOKEN_HOST - SSO server host
* AUTHORIZE_PATH - SSO authorization endpoint, usually /oauth/authorize
* TOKEN_PATH - SSO token endpoint, usually /oauth/token
* USER_DETAILS_PATH - SSO user details endpoint, usually /api/user_details
* HEALTHCHECK_INTERVAL - how often to run the passive healthcheck and output to logs, in minutes
* APPINSIGHTS_INSTRUMENTATIONKEY - Key for Azure application inisghts logger
* APP_BASE_URL - Points to healthcheck endpoint?
* COMPARISON_ENABLED - set to false to disable the comparison feature
* ADDRESS_SEARCH_ENABLED - set to false to disable the address search feature

The following environment variables are used and a value MUST be supplied in production.

* SESSION_SECRET - Secure session configuration
 
# Deploying the service

The application is deployed using Azure Web App Service.

The deployment part of the CI pipeline is meant to trigger upon merging to `main` however this is
currently broken, despite significant effort to fix it. The CircleCI deployment job is meant to 
add the build details to a build-info.json file and commit that to a new branch `azure`, on top of
`main`.  As part of the Azure Web App setup, Azure registers a webhook with GitHub for the `azure`
branch and **should** automatically deploy to the `iis-stage` environment, however this no longer
works.

The only way we now have of deploying the service is to find the `iis-stage` App Service in the 
Azure portal, open the Deployment Center, 'disconnect' the code source and reconnect it. Deployment
to the other environments also done in this way.

This is terrible and we are hoping to migrate the app away from Azure and keep in line with other
HMPPS services.
