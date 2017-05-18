CREATE TABLE NON_IIS.Searches
(
    id INT PRIMARY KEY NOT NULL IDENTITY,
    [user] VARCHAR(20),
    details VARCHAR(max)
)

CREATE TABLE NON_IIS.Audit
(
    id INT PRIMARY KEY NOT NULL IDENTITY,
    timestamp DATETIME2 DEFAULT getdate(),
    [user] VARCHAR(20),
    action VARCHAR(50),
    details VARCHAR(max),
    searchID INT,
    CONSTRAINT Audit_Search_id_fk FOREIGN KEY (searchID) REFERENCES NON_IIS.Searches (id)
)
CREATE INDEX Audit_searchID_uindex ON NON_IIS.Audit (searchID)
