'use strict';

module.exports = {

    errMsg: {
        LOGIN_ERROR: 'Unable to sign in, try again',
        LOGIN_ERROR_DESC: 'All fields are required. Password is case-sensitive',
        LOGIN_ERROR_DISCLAIMER: 'You must confirm that you understand the disclaimer',
        DB_ERROR: 'Unable to talk to the database',
        DB_ERROR_DESC: 'Please try again',
        CANNOT_SUBMIT: 'There was a problem submitting the form',
        NO_OPTION_SELECTED: 'Invalid selection',
        INVALID_ID: 'The identifier you\'ve entered doesn\'t look right',
        ATLEAST_ONE_REQUIRED: 'Please enter a value for at least one field',
        LETTERS_ONLY: 'A name mustn\'t contain space, numbers or special characters',
        INVALID_DOB: 'Invalid date of birth',
        INVALID_AGE: 'Age must be a whole number',
        INVALID_AGE_RANGE: 'Invalid age range. Age ranges should be be no larger than 10 years.',
        TRY_AGAIN: 'Try again',
        INVALID_PAGE: 'The page you requested does not exist'
    },

    dbErrorCodeMessages: {
        ETIMEOUT: 'The search timed out. Try a more specific query',
        emptySubmission: 'Please enter a value for at least one field',
        ECONNREFUSED: 'There was a communication error',
        NOMIS401: 'Could not connect to the NOMIS API'
    },

    view: {
        error: {title: 'Error'},
        notfound: {title: 'Not found'},

        disclaimer: {title: 'Usage'},

        feedback: {title: 'Feedback'},

        search: {
            title: 'What information do you have on the subject?',
            body: 'Select all that apply'
        },

        changepassword: {
            title: 'Contact administrator',
            body: 'Send an email to whatever@digital.justice.gov.uk from the email address registered with IIS'
        },

        identifier: {title: 'Enter at least one unique identifier'},

        names: {title: 'Enter at least one name'},

        dob: {title: 'Enter subject\'s date of birth or age/range'},

        results: {
            title: 'Your search returned _x_ prisoner',
            title_no_results: 'Your search did not return any results'
        },

        subject: {
            title: 'Prisoner details',
            aliases: 'Prisoner has no aliases',
            offencesincustody: 'Prisoner has no offences in custody',
            movements: 'Prisoner has no movements',
            hdcinfo: 'Prisoner has no HDC information',
            hdcrecall: 'Prisoner has no HDC recall history',
            offences: 'Prisoner has no offences',
            addresses: 'Prisoner has no addresses',
            sentences: 'Prisoner has no sentence history'
        },

        suggestions: {
            title: 'Suggestions & tips'
        },

        print: {
            body: 'Select all that apply',
            noneSelected: 'Please select at least one item to print'
        }
    },
    pdf: {
        disclaimer: 'The information in this document is official sensitive and should not be shared with anyone ' +
        'who does not have a valid reason to see it. Inappropriate use of the data may lead to disciplinary action ' +
        'and/or legal proceedings. The information has been produced from the Historic Prisoner Application ' +
        'database (formerly IIS) and the data should be used in conjunction with policy, legislation and codes ' +
        'which applied at the time of entry. Please note that HMPPS/MoJ will not accept responsibility for errors ' +
        'in the system.',
        subject: {
            prisonNumber: 'Prison number',
            personIdentifier: 'Person identifier',
            paroleRefList: 'Parole reference list',
            pnc: 'PNC',
            cro: 'CRO',
            dob: 'Date of birth',
            countryOfBirth: 'Country of birth',
            maritalStatus: 'Marital status',
            ethnicity: 'Ehnicity',
            nationality: 'Nationality',
            religion: 'Religion',
            sex: 'Gender',
            age: 'Age'
        },
        subject2: {
            prisonNumber: 'Prison number',
            paroleNumbers: 'Parole reference list',
            pncNumber: 'PNC',
            croNumber: 'CRO',
            dob: 'Date of birth',
            birthCountry: 'Country of birth',
            maritalStatus: 'Marital status',
            ethnicity: 'Ehnicity',
            nationality: 'Nationality',
            religion: 'Religion',
            sex: 'Gender',
            age: 'Age',
            receptionDate: 'Date of first reception',
            name: 'Name',
            identifier: 'Identifier'
        },
        dbError: {
            title: 'There was a problem getting the data from the database',
            desc: 'Please try again'
        }
    },

    termDisplayNames: {
        prisonNumber: {name: 'Prison number'},
        pncNumber: {name: 'PNC number'},
        croNumber: {name: 'CRO number'},
        forename: {
            name: 'First name',
            textFormat: 'capitalise'
        },
        forename2: {
            name: 'Middle name',
            textFormat: 'capitalise'
        },
        surname: {
            name: 'Last name',
            textFormat: 'capitalise'
        },
        age: {name: 'Age'},
        dob: {name: 'Date of birth'}
    }
};
