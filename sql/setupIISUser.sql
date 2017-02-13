-- NEEDS TO BE RUN ON MASTER , before schemaSetup.sql
--MASTER
USE master
GO

-- Use Master to create IISUSER
CREATE LOGIN iisuser   
    WITH PASSWORD = 'iis%User£3214';  
GO  

-- Run schemaSetup.sql
-- Run the Data Migration.
-- 