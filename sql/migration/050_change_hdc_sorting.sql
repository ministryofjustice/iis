SET QUOTED_IDENTIFIER ON
GO

DROP TABLE [HPA].[HDC_INFO];
GO

CREATE TABLE [HPA].[HDC_INFO] (
    [PK_HDC_INFO]   [INT]          NOT NULL IDENTITY (1, 1)
        CONSTRAINT PK_HDC_INFO PRIMARY KEY,
    [PRISON_NUMBER] [VARCHAR](8)   NOT NULL,
    [DATE]          [DATE]         NULL,
    [TIME]          [DECIMAL](10)  NULL,
    [STAGE]         [VARCHAR](28)  NULL,
    [STATUS]        [VARCHAR](28)  NULL,
    [REASONS]       [VARCHAR](512) NULL
);
GO

INSERT INTO HPA.HDC_INFO
    SELECT DISTINCT
        TRIM(l.PK_PRISON_NUMBER) AS PRISON_NUMBER,
        CASE WHEN (h.STAGE_DATE = '18991231')
            THEN NULL
        ELSE h.STAGE_DATE
        END                      AS DATE,
        h.STAGE_TIME             AS TIME,
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
            STUFF(
                (SELECT DISTINCT ', ' + (
                    SELECT TRIM(CODE_DESCRIPTION)
                    FROM IIS.IIS_CODE
                    WHERE PK_CODE_TYPE = 120 AND PK_CODE_REF_NUM = r.REASON
                )
                 FROM
                     IIS.HDC_REASON r
                 WHERE
                     r.FK_HDC_HISTORY = h.PKTS_HDC_HISTORY
                 FOR XML PATH (''), TYPE
                ).value('text()[1]', 'NVARCHAR(512)'), 1, 2, N'')
        )                        AS REASONS

    FROM IIS.LOSS_OF_LIBERTY l
        INNER JOIN IIS.HDC_HISTORY h
            ON FK_PRISON_NUMBER = l.PK_PRISON_NUMBER
    WHERE
        NOT EXISTS(SELECT 1
                   FROM IIS.IIS_IDENTIFIER i
                   WHERE i.FK_PERSON_IDENTIFIER = l.FK_PERSON_IDENTIFIER AND PERSON_IDENT_TYPE_CODE = 'NOM');
GO



CREATE INDEX HPA_HDC_INFO
    ON HPA.HDC_INFO
    (
        PRISON_NUMBER, DATE, TIME
    ) INCLUDE (
    STAGE, STATUS, REASONS
)
    WITH (ONLINE = ON);
GO



UPDATE HPA.PRISONER_DETAILS
SET HDC_INFO =
(
    SELECT
        STAGE   AS stage,
        STATUS  AS status,
        DATE    AS date,
        TIME    AS time,
        REASONS AS reasons
    FROM HPA.HDC_INFO h
    WHERE h.PRISON_NUMBER = PK_PRISON_NUMBER
    ORDER BY DATE DESC, TIME DESC
    FOR JSON PATH
);
GO
