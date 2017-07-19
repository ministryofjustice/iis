-- Create a prisoner details record for each prison number
INSERT INTO HPA.PRISONER_DETAILS (PK_PRISON_NUMBER)
    SELECT DISTINCT p.PRISON_NUMBER
    FROM HPA.PRISONERS p;
GO
-- approx 4m
-- count 2,814,762
-------------------------------------------------------------------------------------------------------

UPDATE HPA.PRISONER_DETAILS
SET PERSONAL_DETAILS =
(
    (SELECT
         personal.PK_PRISON_NUMBER AS prisonNumber,
         PNC_NUMBER                AS pncNumber,
         CRO_NUMBER                AS croNumber,
         PAROLE_NUMBERS            AS paroleNumbers,
         INITIAL                   AS initial,
         FORENAME_1                AS firstName,
         FORENAME_2                AS middleName,
         SURNAME                   AS lastName,
         SEX                       AS sex,
         BIRTH_DATE                AS dob,
         ETHNICITY                 AS ethnicity,
         BIRTH_COUNTRY             AS birthCountry,
         NATIONALITY               AS nationality,
         RELIGION                  AS religion,
         RECEPTION_DATE            AS receptionDate,
         MARITAL_STATUS            AS maritalStatus
     FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
)
FROM HPA.PRISONER_DETAILS prisoner
    INNER JOIN HPA.PERSONAL_DETAILS personal
        ON prisoner.PK_PRISON_NUMBER = personal.PK_PRISON_NUMBER;
GO
-- approx 30m
-------------------------------------------------------------------------------------------------------

UPDATE HPA.PRISONER_DETAILS
SET ADDRESSES =
(
    SELECT
        TYPE   AS type,
        PERSON AS person,
        STREET AS street,
        TOWN   AS town,
        COUNTY AS county
    FROM HPA.ADDRESSES a
    WHERE a.PRISON_NUMBER = PK_PRISON_NUMBER
    FOR JSON PATH
);
GO
-- approx 15m
-------------------------------------------------------------------------------------------------------

UPDATE HPA.PRISONER_DETAILS
SET ALIASES = a.ALIASES
FROM HPA.ALIASES a
WHERE a.PK_PRISON_NUMBER = PRISONER_DETAILS.PK_PRISON_NUMBER
GO
-- approx 10m
-------------------------------------------------------------------------------------------------------

UPDATE HPA.PRISONER_DETAILS
SET CATEGORY =
(
    SELECT TOP 1
        DATE     AS date,
        CATEGORY AS category
    FROM HPA.PRISONER_CATEGORY c
    WHERE c.PRISON_NUMBER = PK_PRISON_NUMBER
    ORDER BY DATE DESC
    FOR JSON PATH
);
GO
-- approx 48m
-------------------------------------------------------------------------------------------------------

UPDATE HPA.PRISONER_DETAILS
SET COURT_HEARINGS =
(
    SELECT
        DATE  AS date,
        COURT AS court
    FROM HPA.COURT_HEARINGS c
    WHERE c.PRISON_NUMBER = PK_PRISON_NUMBER
    ORDER BY DATE DESC
    FOR JSON PATH
);
GO
-- approx 15m
-------------------------------------------------------------------------------------------------------

UPDATE HPA.PRISONER_DETAILS
SET HDC_INFO =
(
    SELECT
        STAGE   AS stage,
        STATUS  AS status,
        DATE    AS date,
        REASONS AS reasons
    FROM HPA.HDC_INFO h
    WHERE h.PRISON_NUMBER = PK_PRISON_NUMBER
    ORDER BY DATE DESC, STAGE DESC
    FOR JSON PATH
);
GO
-- approx 22m
-------------------------------------------------------------------------------------------------------

UPDATE HPA.PRISONER_DETAILS
SET HDC_RECALL =
(
    SELECT
        CREATED_DATE    AS createdDate,
        CURFEW_END_DATE AS curfewEndDate,
        OUTCOME_DATE    AS outcomeDate,
        OUTCOME         AS outcome,
        REASON          AS reason
    FROM HPA.HDC_RECALL h
    WHERE h.PRISON_NUMBER = PK_PRISON_NUMBER
    ORDER BY CREATED_DATE DESC
    FOR JSON PATH
);
GO
-- approx 18m
-------------------------------------------------------------------------------------------------------

UPDATE HPA.PRISONER_DETAILS
SET MOVEMENTS =
(
    SELECT
        DATE          AS date,
        ESTABLISHMENT AS establishment,
        TYPE          AS type,
        MOVEMENT      AS movement
    FROM HPA.MOVEMENTS m
    WHERE m.PRISON_NUMBER = PK_PRISON_NUMBER
    ORDER BY DATE DESC, TIME DESC
    FOR JSON PATH
);
GO
-- approx 1h20m
-------------------------------------------------------------------------------------------------------

UPDATE HPA.PRISONER_DETAILS
SET OFFENCES =
(
    SELECT
        DATE          AS date,
        CODE          AS code,
        ESTABLISHMENT AS establishment
    FROM HPA.OFFENCES o
    WHERE o.PRISON_NUMBER = PK_PRISON_NUMBER
    ORDER BY DATE DESC
    FOR JSON PATH
);
GO
-- approx 45m
-------------------------------------------------------------------------------------------------------

UPDATE HPA.PRISONER_DETAILS
SET OFFENCES_IN_CUSTODY =
(
    SELECT
        DATE          AS date,
        OUTCOME       AS outcome,
        CHARGE        AS charge,
        ESTABLISHMENT AS establishment
    FROM HPA.OFFENCES_IN_CUSTODY o
    WHERE o.PRISON_NUMBER = PK_PRISON_NUMBER
    ORDER BY DATE DESC
    FOR JSON PATH
);
GO
-- approx 45m
-------------------------------------------------------------------------------------------------------

UPDATE HPA.PRISONER_DETAILS
SET SENTENCING =
(
    SELECT
        LENGTH      AS lengthDays,
        CHANGE_DATE AS changeDate,
        SED         AS SED,
        PED         AS PED,
        NPD         AS NPD,
        LED         AS LED,
        CRD         AS CRD,
        HDCAD       AS HDCAD,
        HDCED       AS HDCED
    FROM HPA.SENTENCING s
    WHERE s.PRISON_NUMBER = PK_PRISON_NUMBER
    ORDER BY CHANGE_DATE DESC
    FOR JSON PATH
);
GO
-- approx 45m
-------------------------------------------------------------------------------------------------------

-- approx 6.5h
