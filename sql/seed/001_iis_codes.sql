INSERT INTO IIS.IIS_CODE (PK_CODE_TYPE, PK_CODE_REF, PK_CODE_REF_NUM, DATE_CODE_EFFECTIVE_FROM, DATE_CODE_EFFECTIVE_TO, RPS_SCORE_CODE, CODE_DESCRIPTION, CODE_IN_USE_DATE, XIDBKEY, XILDID, XIDB)
VALUES
    -- Birth Country
    (14, '1',        1, null, null, null, 'England                     ', null, 1, null, null),
    (14, '2',        1, null, null, null, 'Scotland                    ', null, 1, null, null),
    (14, '98',       1, null, null, null, 'Other                       ', null, 1, null, null),
    (14, '99',       1, null, null, null, 'Not Known                   ', null, 1, null, null),
    -- Ethnicity
    (22, 'W1      ', 1, null, null, null, 'White                       ', null, 1, null, null),
    (22, 'A2      ', 1, null, null, null, 'Asian-Pakistani             ', null, 1, null, null),
    (22, 'BO      ', 1, null, null, null, 'Black Other                 ', null, 1, null, null),
    -- Nationality
    (25, 'UK      ', 1, null, null, null, 'United Kingdom              ', null, 1, null, null),
    (25, 'GM      ', 1, null, null, null, 'Gambia                      ', null, 1, null, null),
    (25, 'ZW      ', 1, null, null, null, 'Zimbabwe                    ', null, 1, null, null),
    (25, '',         1, null, null, null, 'Not Known                   ', null, 1, null, null),
    -- Religion
    (27, 'CE      ', 1, null, null, null, 'Church of England           ', null, 1, null, null),
    (27, 'MOS     ', 1, null, null, null, 'Muslim                      ', null, 1, null, null),
    (27, 'GOSP    ', 1, null, null, null, 'Gospel                      ', null, 1, null, null),
    (27, '',         1, null, null, null, 'Not Known                   ', null, 1, null, null),
    -- Marital Status
    (63, 'M       ', 1, null, null, null, 'Married                     ', null, 1, null, null),
    (63, 'S       ', 1, null, null, null, 'Single                      ', null, 1, null, null),
    -- Court
    (42, '1',        1, null, null, null, 'ULVERSTON COUNTY COURT      ', null, 1, null, null),
    (42, '2',        2, null, null, null, 'LISKEARD COUNTY COURT       ', null, 1, null, null),
    (42, '3',        3, null, null, null, 'THORNBURY COUNTY COURT      ', null, 1, null, null),
    (42, '4',        4, null, null, null, 'WELLS COUNTY COURT          ', null, 1, null, null)
;
GO
