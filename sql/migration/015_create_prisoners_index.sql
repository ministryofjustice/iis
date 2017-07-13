-- Index covering currently supported prisoner search queries
CREATE INDEX HPA_PRISONER_SEARCH
    ON HPA.PRISONERS
    (
        SURNAME,
        FORENAME_1,
        FORENAME_2,
        BIRTH_DATE,
        SEX,
        HAS_HDC,
        IS_LIFER,
        IS_ALIAS,
        PRIMARY_INITIAL,
        RECEPTION_DATE DESC,
        PRISON_NUMBER
    ) INCLUDE (
    PNC_NUMBER,
    CRO_NUMBER,
    PERSON_IDENTIFIER,
    PRIMARY_SURNAME,
    PRIMARY_FORENAME_1,
    PRIMARY_FORENAME_2,
    PRIMARY_BIRTH_DATE,
    SUMMARY
)
    WITH (ONLINE = ON);
GO
-- approx 30m
-- count = 4,220,054



-- total approx 0.5h
