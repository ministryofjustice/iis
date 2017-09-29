-- Drop old address import table
DROP TABLE HPA.ADDRESSES;
GO

-- Also drop the old OIC table which was superseded
DROP TABLE HPA.OFFENCES_IN_CUSTODY;
GO

------------------------------------------------------------------------------------------------------------------------

-- Recreate a new address import table
CREATE TABLE [HPA].[ADDRESSES] (
    [PK_ADDRESS]    [INT]         NOT NULL IDENTITY (1, 1)
        CONSTRAINT PK_ADDRESSES PRIMARY KEY,
    [ORIGIN_ID]     [VARCHAR](30) NOT NULL,
    [PRISON_NUMBER] [VARCHAR](8)  NOT NULL,
    [STREET]        [VARCHAR](50) NULL,
    [TOWN]          [VARCHAR](30) NULL,
    [COUNTY]        [VARCHAR](10) NULL,
    [POSTCODE]      [VARCHAR](10) NULL,
    [TYPE]          [VARCHAR](28) NULL,
    [PERSON]        [VARCHAR](30) NULL
);
GO

------------------------------------------------------------------------------------------------------------------------

-- Import raw address data
INSERT INTO HPA.ADDRESSES
    SELECT
        PKTS_INMATE_ADDRESS      AS ORIGIN_ID,
        TRIM(l.PK_PRISON_NUMBER) AS PRISON_NUMBER,
        TRIM(INMATE_ADDRESS_1)   AS STREET,
        TRIM(INMATE_ADDRESS_2)   AS TOWN,
        TRIM(INMATE_ADDRESS_4)   AS COUNTY,
        TRIM(INMATE_POSTCODE)    AS POSTCODE,
        (
            CASE ADDRESS_TYPE
            WHEN 'C'
                THEN 'Curfew'
            WHEN 'D'
                THEN 'Discharge'
            WHEN 'H'
                THEN 'Home'
            WHEN 'N'
                THEN 'Next of kin'
            WHEN 'O'
                THEN 'Other'
            WHEN 'P'
                THEN 'Probation Office'
            WHEN 'R'
                THEN 'Reception'
            WHEN 'S'
                THEN 'Supervising officer'
            ELSE 'Unknown'
            END
        )                        AS TYPE,
        TRIM(PERSON_DETS)        AS PERSON
    FROM IIS.LOSS_OF_LIBERTY l
        INNER JOIN IIS.INMATE_ADDRESS a ON l.PK_PRISON_NUMBER = a.FK_PRISON_NUMBER
    WHERE
        NOT EXISTS(SELECT 1
                   FROM IIS.IIS_IDENTIFIER i
                   WHERE i.FK_PERSON_IDENTIFIER = l.FK_PERSON_IDENTIFIER AND PERSON_IDENT_TYPE_CODE = 'NOM')
    ORDER BY SQ_HAS_ADDRESS ASC;
GO

------------------------------------------------------------------------------------------------------------------------

-- Create address lookup table
CREATE TABLE [HPA].[ADDRESS_LOOKUP] (
    [PK_ADDRESS_LOOKUP] [INT]          NOT NULL IDENTITY (1, 1)
        CONSTRAINT PK_ADDRESS_LOOKUP PRIMARY KEY,
    [FK_ADDRESS]        [INT]          NOT NULL,
    [PRISON_NUMBER]     [VARCHAR](8)   NOT NULL,
    [STREET]            [VARCHAR](100) NULL,
    [TOWN]              [VARCHAR](100) NULL,
    [POSTCODE]          [VARCHAR](10)  NULL,
    [ADDRESS_TEXT]      [VARCHAR](500) NULL,
);
GO

------------------------------------------------------------------------------------------------------------------------

-- Import raw address data with initial cleanup
INSERT INTO HPA.ADDRESS_LOOKUP
    SELECT
        PK_ADDRESS    AS FK_ADDRESS,
        PRISON_NUMBER AS PRISON_NUMBER,
        UPPER(
            REPLACE(
                REPLACE(
                    REPLACE(STREET, ',', ' '),
                    '''', ''),
                '.', ' ')
        )             AS STREET,
        UPPER(
            REPLACE(
                REPLACE(
                    REPLACE(TOWN, ',', ' '),
                    '''', ''),
                '.', ' ')
        )             AS TOWN,
        POSTCODE,
        NULL
    FROM HPA.ADDRESSES;
GO

------------------------------------------------------------------------------------------------------------------------

-- Clean up end of line abbreviations
UPDATE HPA.ADDRESS_LOOKUP
SET STREET = CASE
             WHEN STREET LIKE '% ST'
                 THEN LEFT(STREET, LEN(STREET) - 3) + ' STREET'
             WHEN STREET LIKE '% RD'
                 THEN LEFT(STREET, LEN(STREET) - 3) + ' ROAD'
             WHEN STREET LIKE '% DR'
                 THEN LEFT(STREET, LEN(STREET) - 3) + ' DRIVE'
             WHEN STREET LIKE '% SQ'
                 THEN LEFT(STREET, LEN(STREET) - 3) + ' SQUARE'
             WHEN STREET LIKE '% CT'
                 THEN LEFT(STREET, LEN(STREET) - 3) + ' COURT'
             WHEN STREET LIKE '% AVE'
                 THEN LEFT(STREET, LEN(STREET) - 4) + ' AVENUE'
             WHEN STREET LIKE '% EST'
                 THEN LEFT(STREET, LEN(STREET) - 4) + ' ESTATE'
             WHEN STREET LIKE '% HSE'
                 THEN LEFT(STREET, LEN(STREET) - 4) + ' HOUSE'
             WHEN STREET LIKE '% CRT'
                 THEN LEFT(STREET, LEN(STREET) - 4) + ' COURT'
             WHEN STREET LIKE '% CRES'
                 THEN LEFT(STREET, LEN(STREET) - 5) + ' CRESCENT'
             ELSE STREET
             END,
    TOWN   = CASE
             WHEN TOWN LIKE '% ST'
                 THEN LEFT(TOWN, LEN(TOWN) - 3) + ' STREET'
             WHEN TOWN LIKE '% RD'
                 THEN LEFT(TOWN, LEN(TOWN) - 3) + ' ROAD'
             WHEN TOWN LIKE '% DR'
                 THEN LEFT(TOWN, LEN(TOWN) - 3) + ' DRIVE'
             WHEN TOWN LIKE '% SQ'
                 THEN LEFT(TOWN, LEN(TOWN) - 3) + ' SQUARE'
             WHEN TOWN LIKE '% CT'
                 THEN LEFT(TOWN, LEN(TOWN) - 3) + ' COURT'
             WHEN TOWN LIKE '% AVE'
                 THEN LEFT(TOWN, LEN(TOWN) - 4) + ' AVENUE'
             WHEN TOWN LIKE '% EST'
                 THEN LEFT(TOWN, LEN(TOWN) - 4) + ' ESTATE'
             WHEN TOWN LIKE '% HSE'
                 THEN LEFT(TOWN, LEN(TOWN) - 4) + ' HOUSE'
             WHEN TOWN LIKE '% CRT'
                 THEN LEFT(TOWN, LEN(TOWN) - 4) + ' COURT'
             WHEN TOWN LIKE '% CRES'
                 THEN LEFT(TOWN, LEN(TOWN) - 5) + ' CRESCENT'
             ELSE TOWN
             END;
GO

------------------------------------------------------------------------------------------------------------------------

-- Create lookup data
UPDATE HPA.ADDRESS_LOOKUP
SET ADDRESS_TEXT = CONCAT(STREET, ' ', TOWN, ' ', POSTCODE);
GO

------------------------------------------------------------------------------------------------------------------------

-- Clean up mid-line abbreviations
-- dont do st because it might mean saint
-- dont do dr because it might mean doctor
UPDATE HPA.ADDRESS_LOOKUP
SET ADDRESS_TEXT =
REPLACE(
    REPLACE(
        REPLACE(
            REPLACE(
                REPLACE(
                    REPLACE(
                        REPLACE(
                            REPLACE(ADDRESS_TEXT, ' RD ', ' ROAD '),
                            ' AVE ', ' AVENUE '),
                        ' SQ ', ' SQUARE '),
                    ' CT ', ' COURT '),
                ' EST ', ' ESTATE '),
            ' HSE ', ' HOUSE '),
        ' CRES ', ' CRESCENT '),
    ' CRT ', ' COURT ');
GO

------------------------------------------------------------------------------------------------------------------------


-- Create catalog for full text indices
CREATE FULLTEXT CATALOG HPA_FTS
WITH ACCENT_SENSITIVITY = OFF;
GO

-- Create full text index but don't start population
CREATE FULLTEXT INDEX
    ON HPA.ADDRESS_LOOKUP (ADDRESS_TEXT)
KEY INDEX PK_ADDRESS_LOOKUP
ON HPA_FTS
WITH STOPLIST OFF, CHANGE_TRACKING OFF, NO POPULATION;
GO

-- Start full text index population AT A TIME OF LOW SYSTEM USAGE AND IDEALLY OUT OF HOURS BECAUSE IT CAN TAKE
-- MORE THAN A DAY AND CONSUMES A LOT OF RESOURCES - ie DO IT ON A WEEKEND
ALTER FULLTEXT INDEX ON HPA.ADDRESS_LOOKUP
START FULL POPULATION;
GO

