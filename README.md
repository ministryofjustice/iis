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

Historical Prisoner Application now uses HMPPS Auth for Single Sign On (it used to use the legacy MoJ SSO application).
A local instance of HMPPS Auth can be set up by cloning the project from GitHub: https://github.com/ministryofjustice/hmpps-auth

To run using HMPPS Auth:
* Run HMPPS Auth: `./gradlew bootRun --args='--spring.profiles.active=dev'`
* Then run the app with (**note: no `NODE_ENV=test` this time**):
```
DB_SERVER=localhost                  \
DB_USER=iisuser                      \
DB_NAME=iis                          \
DB_PASS=NotVerySecretPa55word_IIS_01 \
ADMINISTRATORS=test@test.com         \
npm run start:dev
```
* A test user needs setting up with the `HPA_USER` role to be able to access the service.


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
* CALLBACK_URL - SSO callback URL to complete the authorization code flow redirect
* AUTHORIZE_PATH - SSO authorization endpoint, usually /oauth/authorize
* TOKEN_PATH - SSO token endpoint, usually /oauth/token
* USER_DETAILS_PATH - user details endpoint
* USER_EMAIL_PATH - user email endpoint
* USER_PROFILE_PATH - user profile endpoint
* SIGN_OUT_PATH - SSO sign out endpoint
* HEALTHCHECK_INTERVAL - how often to run the passive healthcheck and output to logs, in minutes
* APPINSIGHTS_INSTRUMENTATIONKEY - Key for Azure application inisghts logger
* APP_BASE_URL - Points to healthcheck endpoint?
* COMPARISON_ENABLED - set to false to disable the comparison feature
* ADDRESS_SEARCH_ENABLED - set to false to disable the address search feature

The following environment variables are used and a value MUST be supplied in production.

* SESSION_SECRET - Secure session configuration
 
# Deploying the service

The application is deployed using Azure Web App Service.

## Deployment configuration:

To access the deployment configuration in the Azure UI, you need an account here:
https://github.com/ministryofjustice/dso-infra-azure-ad with access to HPA. Then from the Azure
homepage find 'App Services' and navigate to `iis-stage` for example. In the navigation bar to the 
left, find 'Deployment Center'. The app is set up to deploy using the 'App Service Build Service'.

It installs webhooks on the following branches:

| Environment | Branch        |
|-------------|---------------|
| iis-stage   | azure-stage   |
| iis-preprod | azure-preprod |
| iis-prod    | azure-prod    |

The CircleCI pipeline, as part of its 'deploy' jobs, creates a build-info.json file,
commits it and pushes to the above branches. The webhook fires and triggers the Azure App Service 
to deploy that branch.

This is now fixed, after we had issues with allowing Azure access to GitHub, and whitelisting GitHub 
webhook IPs in Azure.
