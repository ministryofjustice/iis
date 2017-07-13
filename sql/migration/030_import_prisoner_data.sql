-------------------------------------------------------------------------------------------------------

INSERT INTO HPA.PERSONAL_DETAILS
    SELECT
        TRIM(l.PK_PRISON_NUMBER)                                             PK_PRISON_NUMBER,
        l.FK_PERSON_IDENTIFIER                                               PERSON_IDENTIFIER,
        (
            SELECT TOP 1 TRIM(i.PERSON_IDENTIFIER_VALUE)
            FROM IIS.IIS_IDENTIFIER i
            WHERE i.PERSON_IDENT_TYPE_CODE = 'PNC'
                  AND i.FK_PERSON_IDENTIFIER = l.FK_PERSON_IDENTIFIER
        )            AS                                                      PNC_NUMBER,
        (
            SELECT TOP 1 TRIM(i.PERSON_IDENTIFIER_VALUE)
            FROM IIS.IIS_IDENTIFIER i
            WHERE i.PERSON_IDENT_TYPE_CODE = 'CRO'
                  AND i.FK_PERSON_IDENTIFIER = l.FK_PERSON_IDENTIFIER
        )                                                                    CRO_NUMBER,
        (
            STUFF(
                (SELECT
                     DISTINCT ', ' + CAST(PAROLE_REF_NUMBER AS VARCHAR(7))
                 FROM
                     IIS.PAROLE_REVIEW
                 WHERE
                     FK_PRISON_NUMBER = L.PK_PRISON_NUMBER
                 FOR XML PATH ('')
                ), 1, 2, '')
        )                                                                    PAROLE_NUMBERS,
        TRIM(l.INMATE_SURNAME)                                               SURNAME,
        TRIM(l.INMATE_FORENAME_1)                                            FORENAME_1,
        SUBSTRING(l.INMATE_FORENAME_1, 1, 1)                                 INITIAL,
        TRIM(l.INMATE_FORENAME_2)                                            FORENAME_2,
        l.INMATE_SEX AS                                                      SEX,
        CASE
        WHEN (l.INMATE_BIRTH_DATE = '18991231')
            THEN NULL
        ELSE l.INMATE_BIRTH_DATE
        END          AS                                                      DOB,
        (
            SELECT TRIM(CODE_DESCRIPTION)
            FROM IIS.IIS_CODE
            WHERE PK_CODE_TYPE = 22 AND PK_CODE_REF = L.ETHNIC_GROUP_CODE)   ETHNICITY,
        (
            SELECT TRIM(CODE_DESCRIPTION)
            FROM IIS.IIS_CODE
            WHERE PK_CODE_TYPE = 14 AND PK_CODE_REF = L.BIRTH_COUNTRY_CODE)  BIRTH_COUNTRY,
        (
            SELECT TRIM(CODE_DESCRIPTION)
            FROM IIS.IIS_CODE
            WHERE PK_CODE_TYPE = 25 AND PK_CODE_REF = L.NATIONALITY_CODE)    NATIONALITY,
        (
            SELECT TRIM(CODE_DESCRIPTION)
            FROM IIS.IIS_CODE
            WHERE PK_CODE_TYPE = 27 AND PK_CODE_REF = L.RELIGION_CODE)       RELIGION,
        CASE
        WHEN (l.DATE_1ST_RECEP = '18991231')
            THEN NULL
        ELSE l.DATE_1ST_RECEP
        END          AS                                                      RECEPTION_DATE,
        (
            SELECT TRIM(CODE_DESCRIPTION)
            FROM IIS.IIS_CODE
            WHERE PK_CODE_TYPE = 63 AND PK_CODE_REF = L.MARITAL_STATUS_CODE) MARITAL_STATUS
    FROM IIS.LOSS_OF_LIBERTY l
    WHERE
        NOT EXISTS(SELECT 1
                   FROM IIS.IIS_IDENTIFIER i
                   WHERE i.FK_PERSON_IDENTIFIER = l.FK_PERSON_IDENTIFIER AND PERSON_IDENT_TYPE_CODE = 'NOM');
GO
--approx 5m

-------------------------------------------------------------------------------------------------------

INSERT INTO HPA.ADDRESSES
    SELECT DISTINCT
        TRIM(l.PK_PRISON_NUMBER) AS PRISON_NUMBER,
        TRIM(INMATE_ADDRESS_1)      STREET,
        TRIM(INMATE_ADDRESS_2)      TOWN,
        TRIM(INMATE_ADDRESS_4)      COUNTY,
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
        )                           TYPE,
        TRIM(PERSON_DETS)           PERSON
    FROM IIS.LOSS_OF_LIBERTY l
        INNER JOIN IIS.INMATE_ADDRESS a ON l.PK_PRISON_NUMBER = a.FK_PRISON_NUMBER
    WHERE
        NOT EXISTS(SELECT 1
                   FROM IIS.IIS_IDENTIFIER i
                   WHERE i.FK_PERSON_IDENTIFIER = l.FK_PERSON_IDENTIFIER AND PERSON_IDENT_TYPE_CODE = 'NOM');
GO
--approx 9m

-------------------------------------------------------------------------------------------------------

INSERT INTO HPA.ALIASES
    SELECT DISTINCT
        TRIM(l.PK_PRISON_NUMBER) AS PK_PRISON_NUMBER,
        (SELECT DISTINCT
             TRIM(PERSON_SURNAME)    last,
             TRIM(PERSON_FORENAME_1) first,
             TRIM(PERSON_FORENAME_2) middle,
             CASE
             WHEN (PERSON_BIRTH_DATE = '18991231')
                 THEN NULL
             ELSE PERSON_BIRTH_DATE
             END AS                  birthDate
         FROM IIS.KNOWN_AS
         WHERE
             FK_PERSON_IDENTIFIER =
             (SELECT DISTINCT FK_PERSON_IDENTIFIER
              FROM IIS.LOSS_OF_LIBERTY
              WHERE FK_PERSON_IDENTIFIER = l.FK_PERSON_IDENTIFIER
                    AND (
                        l.INMATE_SURNAME <> PERSON_SURNAME
                        OR
                        l.INMATE_FORENAME_1 <> PERSON_FORENAME_1
                        OR
                        l.INMATE_FORENAME_2 <> PERSON_FORENAME_2
                    )
             )
         FOR JSON PATH
        )                           ALIASES
    FROM IIS.LOSS_OF_LIBERTY l
    WHERE
        NOT EXISTS(SELECT 1
                   FROM IIS.IIS_IDENTIFIER i
                   WHERE i.FK_PERSON_IDENTIFIER = l.FK_PERSON_IDENTIFIER AND PERSON_IDENT_TYPE_CODE = 'NOM');
GO
--approx 7m

-------------------------------------------------------------------------------------------------------


INSERT INTO HPA.COURT_HEARINGS
    SELECT DISTINCT
        TRIM(l.PK_PRISON_NUMBER) AS PRISON_NUMBER,
        court.HEARING_DATE       AS DATE,
        (
            SELECT TRIM(CODE_DESCRIPTION)
            FROM IIS.IIS_CODE
            WHERE PK_CODE_TYPE = 42 AND PK_CODE_REF_NUM = court.IIS_COURT_CODE
        )                        AS COURT
    FROM IIS.LOSS_OF_LIBERTY l
        INNER JOIN IIS.INMATE_CASE inmate ON inmate.FK_PRISON_NUMBER = l.pK_PRISON_NUMBER
        INNER JOIN IIS.COURT_HEARING court ON inmate.PKTS_INMATE_CASE = court.FK_CASE
    WHERE
        court.COURT_TYPE_CODE = 'SC'
        AND
        NOT EXISTS(SELECT 1
                   FROM IIS.IIS_IDENTIFIER i
                   WHERE i.FK_PERSON_IDENTIFIER = l.FK_PERSON_IDENTIFIER AND PERSON_IDENT_TYPE_CODE = 'NOM');
GO
--approx 4m

-------------------------------------------------------------------------------------------------------

INSERT INTO HPA.HDC_INFO
    SELECT DISTINCT
        TRIM(l.PK_PRISON_NUMBER) AS PRISON_NUMBER,
        CASE WHEN (h.STAGE_DATE = '18991231')
            THEN NULL
        ELSE h.STAGE_DATE
        END                      AS DATE,
        (
            SELECT TRIM(CODE_DESCRIPTION)
            FROM IIS.IIS_CODE
            WHERE PK_CODE_TYPE = 118 AND PK_CODE_REF_NUM = h.STAGE
        )                        AS STAGE,
        (
            SELECT TRIM(CODE_DESCRIPTION)
            FROM IIS.IIS_CODE
            WHERE PK_CODE_TYPE = 119 AND PK_CODE_REF_NUM = h.HDC_STATUS
        )                        AS STATUS,
        (
            SELECT (
                       SELECT TRIM(CODE_DESCRIPTION)
                       FROM IIS.IIS_CODE
                       WHERE PK_CODE_TYPE = 120 AND PK_CODE_REF_NUM = r.REASON
                   ) AS reason
            FROM
                IIS.HDC_REASON r
            WHERE
                r.FK_HDC_HISTORY = h.PKTS_HDC_HISTORY
            FOR JSON PATH)       AS REASONS
    FROM IIS.LOSS_OF_LIBERTY l
        INNER JOIN IIS.HDC_HISTORY h
            ON FK_PRISON_NUMBER = l.PK_PRISON_NUMBER
    WHERE
        NOT EXISTS(SELECT 1
                   FROM IIS.IIS_IDENTIFIER i
                   WHERE i.FK_PERSON_IDENTIFIER = l.FK_PERSON_IDENTIFIER AND PERSON_IDENT_TYPE_CODE = 'NOM');
GO
--approx 15m

-------------------------------------------------------------------------------------------------------

INSERT INTO HPA.HDC_RECALL
    SELECT
        TRIM(l.PK_PRISON_NUMBER) AS PRISON_NUMBER,
        CASE WHEN (h.RECALL_DATE_CREATED = '18991231')
            THEN NULL
        ELSE h.RECALL_DATE_CREATED
        END                      AS CREATED_DATE,
        CASE WHEN (h.ORIGINAL_CURFEW_END_DATE = '18991231')
            THEN NULL
        ELSE h.ORIGINAL_CURFEW_END_DATE
        END                      AS CURFEW_END_DATE,
        CASE WHEN (h.RECALL_OUTCOME_DATE = '18991231')
            THEN NULL
        ELSE h.RECALL_OUTCOME_DATE
        END                      AS OUTCOME_DATE,
        (
            SELECT TRIM(CODE_DESCRIPTION)
            FROM IIS.IIS_CODE
            WHERE PK_CODE_TYPE = 127 AND PK_CODE_REF = h.RECALL_OUTCOME)
                                 AS OUTCOME,
        (
            SELECT TRIM(CODE_DESCRIPTION)
            FROM IIS.IIS_CODE
            WHERE PK_CODE_TYPE = 122 AND PK_CODE_REF = r.REASON_ID)
                                 AS REASON
    FROM IIS.LOSS_OF_LIBERTY l
        INNER JOIN IIS.HDC_RECALL h ON h.FK_PRISON_NUMBER = l.PK_PRISON_NUMBER
        INNER JOIN IIS.REASON_RECALL r ON h.PKTS_HDC_RECALL = r.FK_HDC_RECALL
    WHERE
        NOT EXISTS(SELECT 1
                   FROM IIS.IIS_IDENTIFIER i
                   WHERE i.FK_PERSON_IDENTIFIER = l.FK_PERSON_IDENTIFIER AND PERSON_IDENT_TYPE_CODE = 'NOM');
GO
--approx 1m

-------------------------------------------------------------------------------------------------------

INSERT INTO HPA.MOVEMENTS
    SELECT
        TRIM(l.PK_PRISON_NUMBER) AS PRISON_NUMBER,
        CASE
        WHEN (m.DATE_OF_MOVE = '18991231')
            THEN NULL
        ELSE m.DATE_OF_MOVE
        END                      AS DATE,
        m.TYPE_OF_MOVE           AS TYPE,
        CASE
        WHEN (m.TYPE_OF_MOVE = 'D')
            THEN (
                SELECT TRIM(CODE_DESCRIPTION)
                FROM IIS.IIS_CODE
                WHERE PK_CODE_TYPE = 35 AND PK_CODE_REF = M.MOVEMENT_CODE)
        WHEN (m.TYPE_OF_MOVE = 'R')
            THEN (
                SELECT TRIM(CODE_DESCRIPTION)
                FROM IIS.IIS_CODE
                WHERE PK_CODE_TYPE = 34 AND PK_CODE_REF = M.MOVEMENT_CODE)
        ELSE M.MOVEMENT_CODE
        END                      AS MOVEMENT,
        (
            SELECT TRIM(e.ESTABLISHMENT_NAME)
            FROM IIS.ESTABLISHMENT e
            WHERE e.PK_ESTABLISHMENT_CODE = SUBSTRING(M.ESTAB_COMP_OF_MOVE, 1, 2)
        )                        AS ESTABLISHMENT
    FROM IIS.LOSS_OF_LIBERTY l
        INNER JOIN IIS.INMATE_MOVEMENT M
            ON M.FK_PRISON_NUMBER = l.PK_PRISON_NUMBER
    WHERE
        NOT EXISTS(SELECT 1
                   FROM IIS.IIS_IDENTIFIER i
                   WHERE i.FK_PERSON_IDENTIFIER = l.FK_PERSON_IDENTIFIER AND PERSON_IDENT_TYPE_CODE = 'NOM');
GO
--approx 55m

-------------------------------------------------------------------------------------------------------

INSERT INTO HPA.OFFENCES
    SELECT
        TRIM(l.PK_PRISON_NUMBER) AS PRISON_NUMBER,
        o.IIS_OFFENCE_CODE       AS CODE,
        CASE
        WHEN (c.CASE_DATE = '18991231')
            THEN NULL
        ELSE c.CASE_DATE
        END                      AS DATE,
        (
            SELECT TRIM(e.ESTABLISHMENT_NAME)
            FROM IIS.ESTABLISHMENT e
            WHERE e.PK_ESTABLISHMENT_CODE = SUBSTRING(CASE_ESTAB_COMP_CODE, 1, 2)
        )                        AS ESTABLISHMENT
    FROM IIS.LOSS_OF_LIBERTY l
        INNER JOIN IIS.INMATE_CASE c
            ON c.FK_PRISON_NUMBER = L.PK_PRISON_NUMBER
        INNER JOIN IIS.CASE_OFFENCE o
            ON c.PKTS_INMATE_CASE = o.FK_CASE
    WHERE
        NOT EXISTS(SELECT 1
                   FROM IIS.IIS_IDENTIFIER i
                   WHERE i.FK_PERSON_IDENTIFIER = l.FK_PERSON_IDENTIFIER AND PERSON_IDENT_TYPE_CODE = 'NOM');
GO
--approx 11m

-------------------------------------------------------------------------------------------------------

INSERT INTO HPA.OFFENCES_IN_CUSTODY
    SELECT
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
        )                                                                  AS ESTABLISHMENT
    FROM IIS.LOSS_OF_LIBERTY l
        INNER JOIN IIS.ADJ_OFFENCE o
            ON o.FK_PRISON_NUMBER = l.PK_PRISON_NUMBER
    WHERE
        NOT EXISTS(SELECT 1
                   FROM IIS.IIS_IDENTIFIER i
                   WHERE i.FK_PERSON_IDENTIFIER = l.FK_PERSON_IDENTIFIER AND PERSON_IDENT_TYPE_CODE = 'NOM');
GO
--approx 3m

-------------------------------------------------------------------------------------------------------

INSERT INTO HPA.SENTENCING
    SELECT
        TRIM(l.PK_PRISON_NUMBER)       AS PRISON_NUMBER,
        hist.EFFECTIVE_SENTENCE_LENGTH AS LENGTH,
        CASE
        WHEN (hist.SENTENCE_CHANGE_DATE = '18991231')
            THEN NULL
        ELSE hist.SENTENCE_CHANGE_DATE
        END                            AS CHANGE_DATE,
        CASE WHEN (hist.SENTENCE_EXPIRY_DATE = '18991231')
            THEN NULL
        ELSE hist.SENTENCE_EXPIRY_DATE
        END                            AS SED,
        CASE WHEN (hist.PED = '18991231')
            THEN NULL
        ELSE hist.PED
        END                            AS PED,
        CASE WHEN (hist.NPD = '18991231')
            THEN NULL
        ELSE hist.NPD
        END                            AS NPD,
        CASE WHEN (hist.LED = '18991231')
            THEN NULL
        ELSE hist.LED
        END                            AS LED,
        CASE WHEN (hist.CRD = '18991231')
            THEN NULL
        ELSE hist.CRD
        END                            AS CRD,
        CASE WHEN (hist.HDCAD = '18991231')
            THEN NULL
        ELSE hist.HDCAD
        END                            AS HDCAD,
        CASE WHEN (hist.HDCED = '18991231')
            THEN NULL
        ELSE hist.HDCED
        END                            AS HDCED
    FROM IIS.LOSS_OF_LIBERTY l
        INNER JOIN IIS.STATE_CHANGE state
            ON state.FK_PRISON_NUMBER = l.PK_PRISON_NUMBER
        INNER JOIN IIS.EFF_SEN_HIST hist
            ON hist.FK_STATE_CHANGE = state.PKTS_STATE_CHANGE
    WHERE
        (state.STATE_VALUE = '03' OR state.STATE_VALUE = '06')
        AND
        NOT EXISTS(SELECT 1
                   FROM IIS.IIS_IDENTIFIER i
                   WHERE i.FK_PERSON_IDENTIFIER = l.FK_PERSON_IDENTIFIER AND PERSON_IDENT_TYPE_CODE = 'NOM');
GO
--approx 5m

-------------------------------------------------------------------------------------------------------
-- total approx 2h
