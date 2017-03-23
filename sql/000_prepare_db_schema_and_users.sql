CREATE USER iisuser WITH PASSWORD = {iisuser_password};
GO

CREATE SCHEMA NON_IIS AUTHORIZATION iisuser;
GO

CREATE SCHEMA IIS AUTHORIZATION iisuser;
GO

-- grant read-only permissions on the IIS schema
GRANT SELECT
  ON SCHEMA::IIS TO iisuser;
GO

-- grant read/write permissions on the other schema
GRANT SELECT, INSERT, DELETE
  ON SCHEMA::NON_IIS TO iisuser;
GO
