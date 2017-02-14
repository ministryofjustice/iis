-- NEEDS TO BE RUN ON MASTER , before schemaSetup.sql
--MASTER
USE master
GO

-- Use Master to create IISUSER - Add in password
CREATE LOGIN iisuser
    WITH PASSWORD = '????';
GO
