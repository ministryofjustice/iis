INSERT INTO IIS.KNOWN_AS (
    PKTS_KNOWN_AS,
    PERSON_SURNAME,
    PERSON_FORENAME_1,
    PERSON_FORENAME_2,
    PERSON_BIRTH_DATE,
    PERSON_SEX,
    XIDBKEY,
    FK_PERSON_IDENTIFIER,
    SQ_REFERENCED_BY
) VALUES
    ('1234561', 'SURNAMEA ',   'FIRSTA',   'MIDDLEA',   '19800101', 'M', 1.0, '1234567891', '11111'),
    ('1234562', 'SURNAMEB ',   'FIRSTB',   'MIDDLEB',   '19800102', 'F', 1.0, '1234567892', '11112'),
    ('1234563', 'SURNAMEC ',   'FIRSTC',   'MIDDLEC',   '19800103', 'M', 1.0, '1234567893', '11113'),
    ('1234564', 'SURNAMED ',   'FIRSTD',   'MIDDLED',   '19800104', 'F', 1.0, '1234567894', '11114'),
    ('1234565', 'SURNAMEE ',   'FIRSTE',   'MIDDLEE',   '19800105', 'M', 1.0, '1234567895', '11115'),
    ('1234566', 'SURNAMEF ',   'FIRSTF',   'MIDDLEF',   '19800106', 'F', 1.0, '1234567896', '11116'),
    ('1234567', 'SURNAMEG ',   'FIRSTG',   'MIDDLEG',   '19800107', 'M', 1.0, '1234567897', '11117'),
    ('1234568', 'SURNAMEH ',   'FIRSTH',   'MIDDLEH',   '19800108', 'F', 1.0, '1234567898', '11118'),
    ('1234569', 'SURNAMEI ',   'FIRSTI',   'MIDDLEI',   '19800109', 'M', 1.0, '1234567899', '11119'),
    ('1234570', 'SURNAME''J ', 'FIRST''J', 'MIDDLE''J', '19800110', 'M', 1.0, '1234567901', '11121'),
    ('1234571', 'SURNAME-K ',  'FIRST-K',  'MIDDLE-K',  '19800111', 'M', 1.0, '1234567902', '11122'),
    ('1234572', 'SURNAME L ',  'FIRST L',  'MIDDLE L',  '19800112', 'M', 1.0, '1234567903', '11123'),
    ('1234596', 'SURNAMEM ',   'FIRSTM',   'MIDDLEM',   '19800112', 'M', 1.0, '1234567912', '11123'),

    ('1234573', 'ALIASA', 'OTHERA', 'A', '19800101', 'M', 1.0, '1234567891', '11124'),
    ('1234574', 'ALIASA', 'OTHERA', 'A', '19800101', 'M', 1.0, '1234567891', '11125'),
    ('1234575', 'ALIASB', 'OTHERB', 'B', '19800102', 'M', 1.0, '1234567891', '11126'),

    ('1234576', 'ALIASA', 'OTHERA', 'A', '19800101', 'F', 1.0, '1234567892', '11127'),
    ('1234577', 'ALIASB', 'OTHERB', 'B', '19800102', 'F', 1.0, '1234567892', '11128'),
    ('1234578', 'ALIASC', 'C',      '',  '19800103', 'F', 1.0, '1234567892', '11129'),

    ('1234579', 'ALIASA', 'OTHERA', 'A', '19800101', 'M', 1.0, '1234567893', '11131'),
    ('1234580', 'ALIASB', 'OTHERB', 'B', '19800102', 'M', 1.0, '1234567893', '11132'),

    ('1234581', 'ALIASA', 'OTHERA', 'A', '19800101', 'F', 1.0, '1234567894', '11133'),



    ('1234582', 'FOX',           'MICHAEL',     'J', '19670101', 'M', 1.0, '1234567904', '11134'),
    ('1234583', 'WOLF',          'TEEN',        '',  '19670102', 'M', 1.0, '1234567904', '11135'),
    ('1234584', 'LLOYD',         'CHRISTOPHER', '',  '18950102', 'M', 1.0, '1234567905', '11136'),
    ('1234585', 'WILSON',        'MAYOR',       '',  '19300102', 'M', 1.0, '1234567908', '11137'),
    ('1234586', 'BAINES-MCFLY',  'LORRAINE',    '',  '19370103', 'F', 1.0, '1234567910', '11138'),


    ('1234587', 'MCFLY',      'MARTY',    '',       '19670101', 'M', 1.0, '1234567904', '11139'),
    ('1234588', 'BROWN',      'DOC',      'EMMET',  '19670102', 'M', 1.0, '1234567905', '11140'),
    ('1234589', 'TANNEN',     'BIFF',     'BUFORD', '19670103', 'M', 1.0, '1234567906', '11141'),
    ('1234590', 'MCFLY',      'GEORGE',   '',       '19670104', 'M', 1.0, '1234567907', '11142'),
    ('1234591', 'WILSON',     'GOLDIE',   '',       '19670105', 'M', 1.0, '1234567908', '11143'),
    ('1234592', 'STRICKLAND', 'MR',       '',       '19670106', 'M', 1.0, '1234567909', '11144'),
    ('1234593', 'BAINES',     'LORRAINE', '',       '19670107', 'F', 1.0, '1234567910', '11145'),
    ('1234594', 'PARKER',     'JENNIFER', '',       '19670108', 'F', 1.0, '1234567911', '11156'),

    ('1234595', 'MCFLY',         'GEORGE',      '',  '19670104', 'M', 1.0, '1234567904', '11157'),
    ('1234597', 'WOLF2',         'TEEN',      'T',  '19551105', 'M', 1.0, '1234567904', '1157')
    ;
GO
