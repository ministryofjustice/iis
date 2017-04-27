# DB Schema Migrations

1. Create a database with case-sensitive collation
    `CREATE DATABASE iis CONTAINMENT = PARTIAL`
2. Run all the /schema SQL files in order into the database with an admin user.
3. The first one needs a password to be added for the application user.
4. Afterwards, use the created user & password for the application's access
5. Run files in /seed in order, which will create sample data
