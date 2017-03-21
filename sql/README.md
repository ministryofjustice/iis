# DB Schema Migrations

1. Create a database with case-sensitive collation
    `CREATE DATABASE iis CONTAINMENT = PARTIAL COLLATE Latin1_General_CS_AS`
2. Run all the SQL files in order into the database with an admin user.
3. The first one needs a password to be added for the application user.
4. Afterwards, use the created user & password for the application's access
