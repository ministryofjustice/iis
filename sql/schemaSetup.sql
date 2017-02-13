-- NEEDS TO BE RUN ON IIS DATABASE NOT ON MASTER
--Create IIS USER
CREATE USER iisuser FOR LOGIN iisuser;  
GO

-- Create NON IIS Schema
CREATE SCHEMA NON_IIS AUTHORIZATION iisuser;
GO

-- Create IIS Schema
CREATE SCHEMA IIS AUTHORIZATION iisuser;
GO

-- grant them explicit permissions on the schema only
GRANT SELECT
  ON SCHEMA::IIS TO iisuser;
GO

-- grant them read and write explicit permissions on the schema only
GRANT SELECT, INSERT, DELETE
  ON SCHEMA::NON_IIS TO iisuser;
GO



