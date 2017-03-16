README for running the Database Scripts:

1. Run setupIISUser.sql. Please ENSURE you ADD in a PASSWORD for the USER - (NEEDS TO BE RUN ON MASTER).
2. Run schemaSetup.sql - (Run in IIS DATABASE).
3. Run the noniisTable.sql script - (Run in IIS DATABASE).
4. Run the Data Migration - This will be either a Database Backup or a Migration from SQL Server Instance.
5. Run generateTransferDDL.sql - (Run in IIS DATABASE).
6. Run the generated DDL from the last script agaisnt IIS Database.
7. Login into the database with the IIS USER and determine if a Query can be selected agasint the IIS Tables and NON IIS tables.
