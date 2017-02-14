README for running the Database Scripts:

1. Run setupIISUser.sql. Please ENSURE you ADD in a PASSWORD for the USER.
2. Run schemaSetup.sql
3. Run the noniisTable.sql script.
4. Run the Data Migration - This will be either a Database Backup or a Migration from SQL Server Instance
5. Run generateTransferDDL.sql.
6. Run the generated DDL from the last script agaisnt IIS Database.
7. Login into the database with the IIS USER and determine if a Query can be selected agasint the IIS Tables and NON IIS tables.
