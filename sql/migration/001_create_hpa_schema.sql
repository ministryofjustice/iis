CREATE TABLE [HPA].[ADDRESSES] (
    [PK_ADDRESS]    [INT]         NOT NULL IDENTITY (1, 1)
        CONSTRAINT PK_ADDRESSES PRIMARY KEY,
    [PRISON_NUMBER] [VARCHAR](8)  NOT NULL,
    [STREET]        [VARCHAR](50) NULL,
    [TOWN]          [VARCHAR](30) NULL,
    [COUNTY]        [VARCHAR](10) NULL,
    [TYPE]          [VARCHAR](28) NULL,
    [PERSON]        [VARCHAR](30) NULL
);
GO

-------------------------------------------------------------------------------------------------------

CREATE TABLE [HPA].[ALIASES] (
    [ALIAS_ID]         [INT]           NOT NULL IDENTITY (1, 1),
    [PK_PRISON_NUMBER] [VARCHAR](8)    NOT NULL
        CONSTRAINT PK_ALIASES PRIMARY KEY,
    [ALIASES]          [NVARCHAR](MAX) NULL
);
GO

ALTER TABLE [HPA].[ALIASES]
    ADD CONSTRAINT [ALIASES.ALIASES should be formatted as JSON]
CHECK (ISJSON(ALIASES) > 0);
GO

-------------------------------------------------------------------------------------------------------

CREATE TABLE [HPA].[COURT_HEARINGS] (
    [PK_COURT_HEARING] [INT]         NOT NULL IDENTITY (1, 1)
        CONSTRAINT PK_COURT_HEARINGS PRIMARY KEY,
    [PRISON_NUMBER]    [VARCHAR](8)  NOT NULL,
    [DATE]             [DATE]        NULL,
    [COURT]            [VARCHAR](28) NULL
);
GO

-------------------------------------------------------------------------------------------------------

CREATE TABLE [HPA].[HDC_INFO] (
    [PK_HDC_INFO]   [INT]           NOT NULL IDENTITY (1, 1)
        CONSTRAINT PK_HDC_INFO PRIMARY KEY,
    [PRISON_NUMBER] [VARCHAR](8)    NOT NULL,
    [DATE]          [DATE]          NULL,
    [STAGE]         [VARCHAR](28)   NULL,
    [STATUS]        [VARCHAR](28)   NULL,
    [REASONS]       [NVARCHAR](512) NULL
);
GO

ALTER TABLE [HPA].[HDC_INFO]
    ADD CONSTRAINT [HDC_INFO.REASONS should be formatted as JSON]
CHECK (ISJSON(REASONS) > 0);
GO

-------------------------------------------------------------------------------------------------------

CREATE TABLE [HPA].[HDC_RECALL] (
    [PK_HDC_RECALL]   [INT]         NOT NULL IDENTITY (1, 1)
        CONSTRAINT PK_HDC_RECALL PRIMARY KEY,
    [PRISON_NUMBER]   [VARCHAR](8)  NOT NULL,
    [CREATED_DATE]    [DATE]        NULL,
    [CURFEW_END_DATE] [DATE]        NULL,
    [OUTCOME_DATE]    [DATE]        NULL,
    [OUTCOME]         [VARCHAR](28) NULL,
    [REASON]          [VARCHAR](28) NULL
);
GO

-------------------------------------------------------------------------------------------------------

CREATE TABLE [HPA].[MOVEMENTS] (
    [PK_MOVEMENT]   [INT]         NOT NULL IDENTITY (1, 1)
        CONSTRAINT PK_MOVEMENTS PRIMARY KEY,
    [PRISON_NUMBER] [VARCHAR](8)  NOT NULL,
    [DATE]          [DATE]        NULL,
    [TIME]          [DECIMAL](6)  NULL,
    [TYPE]          [CHAR](1)     NULL,
    [MOVEMENT]      [VARCHAR](28) NULL,
    [ESTABLISHMENT] [VARCHAR](30) NULL
);
GO

-------------------------------------------------------------------------------------------------------

CREATE TABLE [HPA].[OFFENCES] (
    [PK_OFFENCE]    [INT]         NOT NULL IDENTITY (1, 1)
        CONSTRAINT PK_OFFENCES PRIMARY KEY,
    [PRISON_NUMBER] [VARCHAR](8)  NOT NULL,
    [CODE]          [INT]         NULL,
    [DATE]          [DATE]        NULL,
    [ESTABLISHMENT] [VARCHAR](30) NULL
);
GO

-------------------------------------------------------------------------------------------------------

CREATE TABLE [HPA].[OFFENCES_IN_CUSTODY] (
    [PK_OFFENCE_IN_CUSTODY] [INT]         NOT NULL IDENTITY (1, 1)
        CONSTRAINT PK_OFFENCES_IN_CUSTODY PRIMARY KEY,
    [PRISON_NUMBER]         [VARCHAR](8)  NOT NULL,
    [DATE]                  [DATE]        NULL,
    [CHARGE]                [VARCHAR](28) NULL,
    [OUTCOME]               [VARCHAR](28) NULL,
    [ESTABLISHMENT]         [VARCHAR](30) NULL
);
GO

-------------------------------------------------------------------------------------------------------

CREATE TABLE [HPA].[PERSONAL_DETAILS] (
    [PERSONAL_DETAILS_ID] [INT]           NOT NULL IDENTITY (1, 1),
    [PK_PRISON_NUMBER]    [VARCHAR](8)    NOT NULL
        CONSTRAINT PK_PERSONAL_DETAILS PRIMARY KEY,
    [PERSON_IDENTIFIER]   [DECIMAL](10)   NOT NULL,
    [PNC_NUMBER]          [VARCHAR](14)   NULL,
    [CRO_NUMBER]          [VARCHAR](14)   NULL,
    [PAROLE_NUMBERS]      [NVARCHAR](256) NULL,
    [SURNAME]             [VARCHAR](24)   NULL,
    [FORENAME_1]          [VARCHAR](13)   NULL,
    [INITIAL]             [CHAR](1)       NULL,
    [FORENAME_2]          [VARCHAR](13)   NULL,
    [SEX]                 [CHAR](1)       NULL,
    [BIRTH_DATE]          [DATE]          NULL,
    [ETHNICITY]           [VARCHAR](28)   NULL,
    [BIRTH_COUNTRY]       [VARCHAR](28)   NULL,
    [NATIONALITY]         [VARCHAR](28)   NULL,
    [RELIGION]            [VARCHAR](28)   NULL,
    [RECEPTION_DATE]      [DATE]          NULL,
    [MARITAL_STATUS]      [VARCHAR](28)   NULL
);
GO

-------------------------------------------------------------------------------------------------------

CREATE TABLE [HPA].[PRISONER_CATEGORY] (
    [PK_PRISONER_CATEGORY] [INT]         NOT NULL IDENTITY (1, 1)
        CONSTRAINT PK_PRISONER_CATEGORIES PRIMARY KEY,
    [PRISON_NUMBER]        [VARCHAR](8)  NOT NULL,
    [DATE]                 [DATE]        NULL,
    [CATEGORY]             [VARCHAR](28) NULL
);
GO

-------------------------------------------------------------------------------------------------------

CREATE TABLE [HPA].[SENTENCING] (
    [PK_SENTENCING] [INT]         NOT NULL IDENTITY (1, 1)
        CONSTRAINT PK_SENTENCING PRIMARY KEY,
    [PRISON_NUMBER] [VARCHAR](8)  NOT NULL,
    [LENGTH]        [DECIMAL](10) NOT NULL,
    [CHANGE_DATE]   [DATE]        NULL,
    [SED]           [DATE]        NULL,
    [PED]           [DATE]        NULL,
    [NPD]           [DATE]        NULL,
    [LED]           [DATE]        NULL,
    [CRD]           [DATE]        NULL,
    [HDCAD]         [DATE]        NULL,
    [HDCED]         [DATE]        NULL,
);
GO

-------------------------------------------------------------------------------------------------------

-- Names etc from IIS.KNOWN_AS - Enables searching for prisoners.
CREATE TABLE [HPA].[PRISONERS] (
    [PK_PRISONER]        [INT]         NOT NULL IDENTITY (1, 1)
        CONSTRAINT PK_PRISONERS PRIMARY KEY,
    [PRISON_NUMBER]      [VARCHAR](8)  NOT NULL,
    [PERSON_IDENTIFIER]  [DECIMAL](10) NOT NULL,
    [SURNAME]            [VARCHAR](24) NULL,
    [FORENAME_1]         [VARCHAR](13) NULL,
    [FORENAME_2]         [VARCHAR](13) NULL,
    [BIRTH_DATE]         [DATE]        NULL,
    [IS_ALIAS]           [BIT]         NOT NULL,
    [SEX]                [CHAR](1)     NULL,
    [PNC_NUMBER]         [VARCHAR](14) NULL,
    [CRO_NUMBER]         [VARCHAR](14) NULL,
    [HAS_HDC]            [BIT]         NOT NULL,
    [IS_LIFER]           [BIT]         NOT NULL,
    [RECEPTION_DATE]     [DATE]        NULL,
    [PRIMARY_SURNAME]    [VARCHAR](24) NULL,
    [PRIMARY_FORENAME_1] [VARCHAR](13) NULL,
    [PRIMARY_INITIAL]    [CHAR](1)     NULL,
    [PRIMARY_FORENAME_2] [VARCHAR](13) NULL,
    [PRIMARY_BIRTH_DATE] [DATE]        NULL
);
GO

-------------------------------------------------------------------------------------------------------

-- JSON documents containing details for a prison number, organised by section
CREATE TABLE [HPA].[PRISONER_DETAILS] (
    [PRISONER_DETAILS_ID] [INT]            NOT NULL IDENTITY (1, 1),
    [PK_PRISON_NUMBER]    [VARCHAR](8)     NOT NULL
        CONSTRAINT PK_PRISON_NUMBER PRIMARY KEY,
    [PERSONAL_DETAILS]    [NVARCHAR](512)  NULL,
    [ADDRESSES]           [NVARCHAR](MAX)  NULL,
    [ALIASES]             [NVARCHAR](MAX)  NULL,
    [CATEGORY]            [NVARCHAR](256)  NULL,
    [COURT_HEARINGS]      [NVARCHAR](1024) NULL,
    [HDC_INFO]            [NVARCHAR](MAX)  NULL,
    [HDC_RECALL]          [NVARCHAR](512)  NULL,
    [MOVEMENTS]           [NVARCHAR](MAX)  NULL,
    [OFFENCES]            [NVARCHAR](MAX)  NULL,
    [OFFENCES_IN_CUSTODY] [NVARCHAR](MAX)  NULL,
    [SENTENCING]          [NVARCHAR](MAX)  NULL
);
GO

ALTER TABLE [HPA].[PRISONER_DETAILS]
    ADD CONSTRAINT [PRISONER_DETAILS.PERSONAL_DETAILS should be formatted as JSON]
CHECK (ISJSON(PERSONAL_DETAILS) > 0);
GO

ALTER TABLE [HPA].[PRISONER_DETAILS]
    ADD CONSTRAINT [PRISONER_DETAILS.ADDRESSES should be formatted as JSON]
CHECK (ISJSON(ADDRESSES) > 0);
GO

ALTER TABLE [HPA].[PRISONER_DETAILS]
    ADD CONSTRAINT [PRISONER_DETAILS.ALIASES should be formatted as JSON]
CHECK (ISJSON(ALIASES) > 0);
GO

ALTER TABLE [HPA].[PRISONER_DETAILS]
    ADD CONSTRAINT [PRISONER_DETAILS.CATEGORY should be formatted as JSON]
CHECK (ISJSON(CATEGORY) > 0);
GO

ALTER TABLE [HPA].[PRISONER_DETAILS]
    ADD CONSTRAINT [PRISONER_DETAILS.COURT_HEARINGS should be formatted as JSON]
CHECK (ISJSON(COURT_HEARINGS) > 0);
GO

ALTER TABLE [HPA].[PRISONER_DETAILS]
    ADD CONSTRAINT [PRISONER_DETAILS.HDC_INFO should be formatted as JSON]
CHECK (ISJSON(HDC_INFO) > 0);
GO

ALTER TABLE [HPA].[PRISONER_DETAILS]
    ADD CONSTRAINT [PRISONER_DETAILS.HDC_RECALL should be formatted as JSON]
CHECK (ISJSON(HDC_RECALL) > 0);
GO

ALTER TABLE [HPA].[PRISONER_DETAILS]
    ADD CONSTRAINT [PRISONER_DETAILS.MOVEMENTS should be formatted as JSON]
CHECK (ISJSON(MOVEMENTS) > 0);
GO

ALTER TABLE [HPA].[PRISONER_DETAILS]
    ADD CONSTRAINT [PRISONER_DETAILS.OFFENCES should be formatted as JSON]
CHECK (ISJSON(OFFENCES) > 0);
GO

ALTER TABLE [HPA].[PRISONER_DETAILS]
    ADD CONSTRAINT [PRISONER_DETAILS.OFFENCES_IN_CUSTODY should be formatted as JSON]
CHECK (ISJSON(OFFENCES_IN_CUSTODY) > 0);
GO

ALTER TABLE [HPA].[PRISONER_DETAILS]
    ADD CONSTRAINT [PRISONER_DETAILS.SENTENCING should be formatted as JSON]
CHECK (ISJSON(SENTENCING) > 0);
GO

