-------------------------------------------------------------------------------------------------------

-- create new table to hold adjudications and punishments
CREATE TABLE [HPA].[ADJUDICATIONS] (
    [PK_ADJUDICATION] [INT]            NOT NULL IDENTITY (1, 1)
        CONSTRAINT PK_ADJUDICATIONS PRIMARY KEY,
    [ADJ_OFFENCE_ID]  [CHAR](26)       NOT NULL,
    [PRISON_NUMBER]   [VARCHAR](8)     NOT NULL,
    [DATE]            [DATE]           NULL,
    [CHARGE]          [VARCHAR](28)    NULL,
    [OUTCOME]         [VARCHAR](28)    NULL,
    [ESTABLISHMENT]   [VARCHAR](30)    NULL,
    [PUNISHMENTS]     [NVARCHAR](2048) NULL,
);
GO

CREATE INDEX HPA_ADJUDICATIONS
    ON HPA.ADJUDICATIONS
    (
        PRISON_NUMBER, DATE
    ) INCLUDE (
    CHARGE, OUTCOME, ESTABLISHMENT, PUNISHMENTS
)
    WITH (ONLINE = ON);
GO

-------------------------------------------------------------------------------------------------------

-- ensure punishments column is JSON
ALTER TABLE [HPA].[ADJUDICATIONS]
    ADD CONSTRAINT [ADJUDICATIONS.PUNISHMENTS should be formatted as JSON]
CHECK (ISJSON(PUNISHMENTS) > 0);
GO

-------------------------------------------------------------------------------------------------------

-- populate from IIS
INSERT INTO HPA.ADJUDICATIONS
    SELECT
        o.PKTS_ADJ_OFFENCE                                                 AS ADJ_OFFENCE_ID,
        TRIM(l.PK_PRISON_NUMBER)                                           AS PRISON_NUMBER,
        o.DATE_OF_FINDING                                                  AS DATE,
        (
            SELECT TRIM(CODE_DESCRIPTION)
            FROM IIS.IIS_CODE
            WHERE PK_CODE_TYPE = 2 AND PK_CODE_REF = o.ADJ_CHARGE)         AS CHARGE,
        (
            SELECT TRIM(CODE_DESCRIPTION)
            FROM IIS.IIS_CODE
            WHERE PK_CODE_TYPE = 8 AND PK_CODE_REF = o.OUTCOME_OF_HEARING) AS OUTCOME,
        (
            SELECT TRIM(e.ESTABLISHMENT_NAME)
            FROM IIS.ESTABLISHMENT e
            WHERE e.PK_ESTABLISHMENT_CODE = SUBSTRING(o.OFFENCE_ESTAB_COMP_CODE, 1, 2)
        )                                                                  AS ESTABLISHMENT,
        (
            SELECT
                (SELECT TRIM(CODE_DESCRIPTION)
                 FROM IIS.IIS_CODE
                 WHERE PK_CODE_TYPE = '3' AND PK_CODE_REF = p.PUNISHMENT) AS 'punishment',
                p.DURATION_PUN                                            AS 'duration'
            FROM IIS.ADJ_PUNISHMENT p
            WHERE p.FK_ADJ_OFFENCE = o.PKTS_ADJ_OFFENCE
            FOR JSON PATH)                                                 AS PUNISHMENTS
    FROM IIS.LOSS_OF_LIBERTY l
        INNER JOIN IIS.ADJ_OFFENCE o
            ON o.FK_PRISON_NUMBER = l.PK_PRISON_NUMBER
    WHERE
        NOT EXISTS(SELECT 1
                   FROM IIS.IIS_IDENTIFIER i
                   WHERE i.FK_PERSON_IDENTIFIER = l.FK_PERSON_IDENTIFIER AND PERSON_IDENT_TYPE_CODE = 'NOM');
GO
--7m
-------------------------------------------------------------------------------------------------------

-- add new version of offences_in-Custody
ALTER TABLE HPA.PRISONER_DETAILS
    ADD [ADJUDICATIONS] [NVARCHAR](MAX) NULL;
GO

-------------------------------------------------------------------------------------------------------

-- ensure new version is JSON
ALTER TABLE [HPA].[PRISONER_DETAILS]
    ADD CONSTRAINT [PRISONER_DETAILS.ADJUDICATIONS should be formatted as JSON]
CHECK (ISJSON(ADJUDICATIONS) > 0);
GO
--15m
-------------------------------------------------------------------------------------------------------

-- populate new version with JSON
UPDATE HPA.PRISONER_DETAILS
SET ADJUDICATIONS =
(
    SELECT
        DATE                    AS date,
        OUTCOME                 AS outcome,
        CHARGE                  AS charge,
        ESTABLISHMENT           AS establishment,
        JSON_QUERY(PUNISHMENTS) AS punishments
    FROM HPA.ADJUDICATIONS o
    WHERE o.PRISON_NUMBER = PK_PRISON_NUMBER
    ORDER BY DATE DESC
    FOR JSON PATH
);
GO
--1h
-------------------------------------------------------------------------------------------------------




