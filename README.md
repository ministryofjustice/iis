# HOA-UI
Ministry of Justice Inmate Information System - Historical Offenders Application UI.

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


# User Accounts
A user account can be created by supplying the required database 
connection environment variables and executing node utils/app-create-user.js, eg

`DB_SERVER=something  DB_PASS=secretThing node utils/app-create-user.js`



