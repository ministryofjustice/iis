CREATE TABLE users (
    id  smallint IDENTITY(1,1)PRIMARY KEY CLUSTERED,
    logid varchar(10) not null unique,
    pwd varchar(60) not null,
    email varchar(30) not null unique,
    last_login timestamp null
);
