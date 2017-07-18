-- Create prisoner record for each name in IIS.KNOWN_AS
INSERT INTO HPA.PRISONERS
    SELECT DISTINCT
        TRIM(l.PK_PRISON_NUMBER)             PRISON_NUMBER,
        k.FK_PERSON_IDENTIFIER               PERSON_IDENTIFIER,
        TRIM(k.PERSON_SURNAME)               SURNAME,
        TRIM(k.PERSON_FORENAME_1)            FORENAME_1,
        TRIM(k.PERSON_FORENAME_2)            FORENAME_2,
        CASE
        WHEN (k.PERSON_BIRTH_DATE = '18991231')
            THEN NULL
        WHEN (k.PERSON_BIRTH_DATE = 'Invalid ')
            THEN NULL
        ELSE k.PERSON_BIRTH_DATE
        END          AS                      BIRTH_DATE,
        CASE
        WHEN (
            l.INMATE_SURNAME = k.PERSON_SURNAME
            AND l.INMATE_FORENAME_1 = k.PERSON_FORENAME_1
            AND l.INMATE_FORENAME_2 = k.PERSON_FORENAME_2
            AND l.INMATE_BIRTH_DATE = k.PERSON_BIRTH_DATE
        )
            THEN 0
        ELSE 1
        END          AS                      IS_ALIAS,
        l.INMATE_SEX AS                      SEX,
        (
            SELECT TOP 1 TRIM(i.PERSON_IDENTIFIER_VALUE)
            FROM IIS.IIS_IDENTIFIER i
            WHERE i.PERSON_IDENT_TYPE_CODE = 'PNC'
                  AND i.FK_PERSON_IDENTIFIER = k.FK_PERSON_IDENTIFIER
        )            AS                      PNC_NUMBER,
        (
            SELECT TOP 1 TRIM(i.PERSON_IDENTIFIER_VALUE)
            FROM IIS.IIS_IDENTIFIER i
            WHERE i.PERSON_IDENT_TYPE_CODE = 'CRO'
                  AND i.FK_PERSON_IDENTIFIER = l.FK_PERSON_IDENTIFIER
        )                                    CRO_NUMBER,
        CASE
        WHEN (EXISTS(SELECT 1
                     FROM IIS.HDC_HISTORY h
                     WHERE h.FK_PRISON_NUMBER = l.PK_PRISON_NUMBER))
            THEN 1
        ELSE 0
        END          AS                      HAS_HDC,
        CASE
        WHEN (PK_PRISON_NUMBER IN (SELECT PK_CL_PRISON_NUMBER
                                   FROM IIS.CATA_LIFER))
            THEN 1
        ELSE 0
        END          AS                      IS_LIFER,
        CASE
        WHEN (l.DATE_1ST_RECEP = '18991231')
            THEN NULL
        ELSE l.DATE_1ST_RECEP
        END          AS                      RECEPTION_DATE,
        TRIM(l.INMATE_SURNAME)               PRIMARY_SURNAME,
        TRIM(l.INMATE_FORENAME_1)            PRIMARY_FORENAME_1,
        SUBSTRING(l.INMATE_FORENAME_1, 1, 1) PRIMARY_INITIAL,
        TRIM(l.INMATE_FORENAME_2)            PRIMARY_FORENAME_2,
        CASE
        WHEN (l.INMATE_BIRTH_DATE = '18991231')
            THEN NULL
        ELSE l.INMATE_BIRTH_DATE
        END          AS                      DOB
    FROM IIS.KNOWN_AS k
        INNER JOIN IIS.LOSS_OF_LIBERTY l ON l.FK_PERSON_IDENTIFIER = K.FK_PERSON_IDENTIFIER
    WHERE
        NOT EXISTS(SELECT 1
                   FROM IIS.IIS_IDENTIFIER i
                   WHERE i.FK_PERSON_IDENTIFIER = k.FK_PERSON_IDENTIFIER AND PERSON_IDENT_TYPE_CODE = 'NOM');
GO
-- approx 10m
-- count = 4,220,054

