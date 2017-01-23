CREATE TABLE "public"."users" (
    "id" serial,
    "username" varchar(20) NOT NULL,
    "password" varchar(60) NOT NULL,
    "last_login" timestamp,
    PRIMARY KEY ("id"),
    UNIQUE ("username")
);
