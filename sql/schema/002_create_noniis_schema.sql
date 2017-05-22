CREATE TABLE NON_IIS.Audit
(
    id INT PRIMARY KEY NOT NULL IDENTITY,
    timestamp DATETIME2 DEFAULT getdate(),
    [user] VARCHAR(50),
    action VARCHAR(50),
    details VARCHAR(max)
)
