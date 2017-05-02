INSERT INTO IIS.PERSON_REFERENCE (
    PK_PERSON_IDENTIFIER,
    XIDBKEY
) VALUES
    ('1234567891',1.0),
    ('1234567892',1.0),
    ('1234567893',1.0),
    ('1234567894',1.0),
    ('1234567895',1.0)
GO

INSERT INTO IIS.LOSS_OF_LIBERTY (
    PK_PRISON_NUMBER,
    DATE_1ST_RECEP,
    BIRTH_COUNTRY_CODE,
    RELIGION_CODE,
    ETHNIC_GROUP_CODE,
    MARITAL_STATUS_CODE,
    INMATE_SURNAME,
    INMATE_FORENAME_1,
    INMATE_FORENAME_2,
    INMATE_BIRTH_DATE,
    INMATE_SEX,
    NATIONALITY_CODE,
    XIDBKEY,
    FK_PERSON_IDENTIFIER)
VALUES

    ('AB111111', '19990101', 00000001, 'CE',  'W1', 'S', 'surnamea ', 'firsta', 'middlea', '19800101', 'M', 'UK', 1.0, '1234567891'),
    ('AB111112', '19990102', 00000002, 'CE',  'A2', 'M', 'surnameb ', 'firstb', 'middleb', '19800102', 'F', 'GM', 1.0, '1234567892'),
    ('AB111113', '19990103', 00000098, 'MOS', 'BO', 'S', 'surnamec ', 'firstc', 'middlec', '19800103', 'M', 'ZW', 1.0, '1234567893'),
    ('AB111114', '19990104', 00000099, 'GOS', 'W1', 'M', 'surnamed ', 'firstd', 'middled', '19800104', 'F', 'UK', 1.0, '1234567894'),
    ('AB111115', '19990105', 00000001, 'CE',  'A2', 'S', 'surnamee ', 'firste', 'middlee', '19800105', 'M', 'GM', 1.0, '1234567895'),
    ('AB111116', '19990106', 00000002, 'CE',  'BO', 'M', 'surnamef ', 'firstf', 'middlef', '19800106', 'F', 'ZW', 1.0, null),
    ('AB111117', '19990107', 00000098, 'MOS', 'W1', 'S', 'surnameg ', 'firstg', 'middleg', '19800107', 'M', 'UK', 1.0, null),
    ('AB111118', '19990108', 00000099, 'GOS', 'A2', 'M', 'surnameh ', 'firsth', 'middleh', '19800108', 'F', 'GM', 1.0, null),
    ('AB111119', '19990109', 00000001, 'CE',  'BO', 'S', 'surnamei ', 'firsti', 'middlei', '19800109', 'M', 'ZW', 1.0, null)
;

GO