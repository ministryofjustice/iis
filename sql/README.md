# DB

Start sql server instance by running `docker-compose up`.

This will create 1 DB: `IIS`, and 3 schemas: `IIS`, `NON_IIS` and `HPA`.

3 users will be created:

| Name         | Password
| sa           | NotVerySecretPa55word_SA_01
| iisuser      | NotVerySecretPa55word_IIS_01
| schemaowner  | NotVerySecretPa55word_IIS_01

It will then seed test data and then run migrations.


## To connect to running app run:

```
NODE_ENV=test                        \
DB_SERVER=localhost                  \
DB_USER=iisuser                      \
DB_NAME=iis                          \
DB_PASS=NotVerySecretPa55word_IIS_01 \
npm run start
```

This will disable auth allowing direct access on localhost:3000.
Search uses `[HPA].[PRISONERS]`, e.g searching for `George` should return 3 results.