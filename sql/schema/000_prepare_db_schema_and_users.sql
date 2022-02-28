sp_configure 'contained database authentication', 1;  
GO  
RECONFIGURE;  
GO 

CREATE DATABASE iis CONTAINMENT = PARTIAL
GO

USE [IIS]
GO

CREATE USER schemaowner WITH PASSWORD = {iisuser_password};
GO

CREATE USER iisuser WITH PASSWORD = {iisuser_password};
GO

CREATE SCHEMA NON_IIS AUTHORIZATION schemaowner;
GO

CREATE SCHEMA IIS AUTHORIZATION schemaowner;
GO

CREATE SCHEMA HPA AUTHORIZATION schemaowner;
GO

-- grant read-only permissions on the IIS schema
GRANT SELECT
  ON SCHEMA::IIS TO iisuser;
GO

GRANT SELECT
  ON SCHEMA::HPA TO iisuser;
GO

-- grant read/write permissions on the other schema
GRANT SELECT, INSERT, DELETE
  ON SCHEMA::NON_IIS TO iisuser;
GO
