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
    (25, 'US',       1, null, null, null, 'United States of America    ', null, 1, null, null),
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
    (42, '4',        4, null, null, null, 'WELLS COUNTY COURT          ', null, 1, null, null),
    (42, '5',        5, null, null, null, 'HILL VALLEY COURTHOUSE      ', null, 1, null, null),
    -- HDC stage
    (118, '1',        1, null, null, null, 'HDC FINAL DECISION         ', null, 1, null, null),
    (118, '2',        2, null, null, null, 'HDC ELIGIBILITY            ', null, 1, null, null),
    (118, '3',        3, null, null, null, 'HDC ELIGIBILITY RESULT     ', null, 1, null, null),
    (118, '4',        4, null, null, null, 'ASSESSMENT PROCESS         ', null, 1, null, null),
    -- HDC status
    (119, '1',        1, null, null, null, 'HDC GRANTED                ', null, 1, null, null),
    (119, '4',        4, null, null, null, 'AUTO CHECK PASS            ', null, 1, null, null),
    (119, '5',        5, null, null, null, 'MANUAL CHECK PASS          ', null, 1, null, null),
    (119, '8',        8, null, null, null, 'ELIGIBLE                   ', null, 1, null, null),
    (119, '10',       10, null, null, null, 'SUIT ASSESS                ', null, 1, null, null),
    (119, '11',       11, null, null, null, 'ENHANCED ASSESS            ', null, 1, null, null),
    -- HDC reason
    (120, '10',       10, null, null, null, 'CHANGE IN SENTENCE HISTORY  ', null, 1, null, null),
    (120, '11',       11, null, null, null, 'MANUAL CHECK - PREV. CUSTODY', null, 1, null, null),
    (120, '12',       12, null, null, null, '<14 DAYS FROM HDCED         ', null, 1, null, null),
    (120, '13',       13, null, null, null, 'HDCED EARLIER THAN 28/01/99 ', null, 1, null, null),
    (120, '14',       14, null, null, null, 'UNDER 18                    ', null, 1, null, null),
    (120, '39',       39, null, null, null, 'PASS ALL ELIGIBILITY CHECKS ', null, 1, null, null),
    (120, '41',       41, null, null, null, 'FAILED MANUAL CHECKS        ', null, 1, null, null),
    (120, '45',       45, null, null, null, 'CREATED MANUALLY            ', null, 1, null, null),
    (120, '65',       65, null, null, null, 'PRES/UNSUITABLE             ', null, 1, null, null),
    (120, '120',      120, null, null, null, 'FAILED AUTOMATIC ELIGIBILITY', null, 1, null, null),
    (120, '121',      121, null, null, null, 'FAILED AUTOMATIC ELIGIBILITY', null, 1, null, null),
    --HDC recall outcome
    (127, '1',      1, null, null, null, 'Licence revoked: recalled     ', null, 1, null, null),
    (127, '2',      2, null, null, null, 'Re-released following recall  ', null, 1, null, null),
    (127, '4',      4, null, null, null, 'Licence breach: rec rejected  ', null, 1, null, null),
    --HDC recall reason
    (122, '1',      1, null, null, null, 'BREACH CONDITIONS 38A1(a)     ', null, 1, null, null),
    (122, '3',      3, null, null, null, 'CHANGE OF CIRCS 38A1(b)       ', null, 1, null, null),
    (122, '9',      9, null, null, null, 'INABILITY & CHARGE 38A1(b)    ', null, 1, null, null),
    -- Movements - return
    (34, 'M',      1, null, null, null, 'TRANSFER IN FROM OTHER ESTAB    ', null, 1, null, null),
    (34, 'N',      1, null, null, null, 'UNCONVICTED REMAND              ', null, 1, null, null),
    (34, 'W',      1, null, null, null, 'DETENTION IN YO INSTITUTION     ', null, 1, null, null),
    -- Movements - discharge
    (35, 'DC',      1, null, null, null, 'DISCHARGED TO COURT            ', null, 1, null, null),
    (35, 'TI',      1, null, null, null, 'TRANSFER IN ENGLAND & WALES    ', null, 1, null, null),
    (35, 'YP',      1, null, null, null, 'PAROLE/LICENSE                 ', null, 1, null, null),
    -- Adjudication charge
    (2, '13',      13, null, null, null, 'ASSAULT ON INMATE            ', null, 1, null, null),
    (2, '40',      40, null, null, null, 'FIGHTING                     ', null, 1, null, null),
    (2, '85',      85, null, null, null, 'UNAUTH USE OF CTRL''D DRUG   ', null, 1, null, null),
    (2, '92',      92, null, null, null, 'POSSESSION UNAUTHORISED ITEM ', null, 1, null, null),
    (2, '190',     190, null, null, null, 'DISOBEYING A LAWFUL ORDER   ', null, 1, null, null),
    (2, '210',     210, null, null, null, 'POFFENCE AGAINST GOAD       ', null, 1, null, null),
    -- Adjudication outcome
    (8, '1',      1, null, null, null, 'PROVED                 ', null, 1, null, null),
    (8, '2',      2, null, null, null, 'NOT PROVEN             ', null, 1, null, null),
    (8, '3',      3, null, null, null, 'NOT COMPLETED          ', null, 1, null, null),
    (8, '6',      6, null, null, null, 'DISMISSED              ', null, 1, null, null),
    (8, '8',      8, null, null, null, 'NOT PROCEEDED WITH     ', null, 1, null, null),
    -- Prisoner category
    (11, 'C       ',      1, null, null, null, 'CATEGORY C', null, 1, null, null),
    (11, 'D       ',      2, null, null, null, 'CATEGORY D', null, 1, null, null),
    (11, 'X       ',      3, null, null, null, 'UNCATEGORISED (SENT MALES)  ', null, 1, null, null)
;
GO
