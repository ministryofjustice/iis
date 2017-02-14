
-- Create NON ISS tables
CREATE TABLE NON_IIS.users (
    id  smallint IDENTITY(1,1)PRIMARY KEY CLUSTERED,
    login_id varchar(10) not null unique,
    pwd varchar(60) not null,
    email varchar(30) not null unique,
    last_login timestamp null
);