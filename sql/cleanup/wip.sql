INSERT INTO NON_IIS.PRISONER_DETAILS
        SELECT  PK_PRISON_NUMBER,
                
                DATE_1ST_RECEP, 
                
                (SELECT 
                        TRIM(INMATE_SURNAME) lastName, 
                        TRIM(INMATE_FORENAME_1) firstName, 
                        TRIM(INMATE_FORENAME_2) middleName,
                        ETHNIC_GROUP_CODE ethnicityCode,
                        TRIM((SELECT CODE_DESCRIPTION FROM IIS.IIS_CODE WHERE PK_CODE_TYPE=22 AND PK_CODE_REF=L.ETHNIC_GROUP_CODE)) ethnicity
                FROM IIS.LOSS_OF_LIBERTY
                WHERE PK_PRISON_NUMBER = L.PK_PRISON_NUMBER
                FOR JSON AUTO) PERSONAL_DETAILS,
                
                (SELECT
                     TRIM(PERSON_SURNAME)    AS aliasLastName,
                     TRIM(PERSON_FORENAME_1) AS aliasFirstName,
                     TRIM(PERSON_FORENAME_2) AS aliasMiddleName,
                     TRIM(PERSON_BIRTH_DATE) AS aliasDob
                   FROM IIS.KNOWN_AS
                   WHERE
                     FK_PERSON_IDENTIFIER =
                     (SELECT FK_PERSON_IDENTIFIER
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
                   FOR JSON AUTO
                 ) ALIASES,
                
                FK_PERSON_IDENTIFIER
       FROM IIS.LOSS_OF_LIBERTY L;
       
	   
	   
INSERT INTO NON_IIS.PRISONERS        
        SELECT PKTS_KNOWN_AS, PERSON_SURNAME, PERSON_FORENAME_1, PERSON_FORENAME_2, PERSON_BIRTH_DATE, PERSON_SEX, FK_PERSON_IDENTIFIER
        FROM IIS.KNOWN_AS


CREATE TABLE [NON_IIS].[PRISONER_DETAILS](
	[PK_PRISON_NUMBER] [char](8) NOT NULL,
	[DATE_1ST_RECEP] [char](8) NULL,
	[PERSONAL_DETAILS] [text] NOT NULL,
	[ALIASES] [text] NULL,
	[FK_PERSON_IDENTIFIER] [decimal](10, 0) NULL,
 CONSTRAINT [PK_PRISONER_DETAILS] PRIMARY KEY CLUSTERED
(
	[PK_PRISON_NUMBER] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]



CREATE TABLE [NON_IIS].[PRISONERS](
	[PK_PRISONER] [char](26) NOT NULL,
	[PERSON_SURNAME] [char](24) NULL,
	[PERSON_FORENAME_1] [char](13) NULL,
	[PERSON_FORENAME_2] [char](13) NULL,
	[PERSON_BIRTH_DATE] [char](8) NULL,
	[PERSON_SEX] [char](1) NULL,
	[FK_PERSON_IDENTIFIER] [decimal](10, 0) NOT NULL,
 CONSTRAINT [PK_PRISONERS] PRIMARY KEY NONCLUSTERED
(
	[PK_PRISONER] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]