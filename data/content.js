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
        ATLEAST_ONE_REQUIRED: 'All the fields cannot be empty',
        LETTERS_ONLY: 'A name mustn\'t contain space, numbers or special characters',
        INVALID_DOB: 'Invalid date of birth',
        INVALID_AGE: 'Age must be a whole number',
        INVALID_AGE_RANGE: 'Invalid age range or age range too big',
        TRY_AGAIN: 'Try again',
        INVALID_PAGE: 'The page you requested does not exist'
    },

    view: {
        error: {title: 'Error'},
        notfound: {title: 'Not found'},

        disclaimer: {title: 'Usage'},

        feedback: {title: 'Feedback'},

        search: {
            title: 'What information do you have on the inmate?',
            body: 'Select all that apply'
        },

        changepassword: {
            title: 'Contact administrator',
            body: 'Send an email to whatever@digital.justice.gov.uk from the email address registered with IIS'
        },

        identifier: {title: 'Enter at least one unique identifier'},

        names: {title: 'Enter at least one name'},

        dob: {title: 'Enter inmate\'s date of birth or age/range'},

        results: {title: 'Your search returned _x_ result',
                  title_no_results: 'Your search did not return any results'},

        subject: {title: 'Subject details',
                  aliases: 'Subject has no aliases',
                  offencesincustody: 'Subject has no offences in custody',
                  movements: 'Subject has no movements',
                  hdcinfo: 'Subject has no HDC history',
                  hdcrecall: 'Subject has no HDC recall history',
                  offences: 'Subject has no offences',
                  addresses: 'Subject has no addresses',
                  sentences: 'Subject has no sentence history'
                  },

         print: {
             body: 'Select all that apply',
             noneSelected: 'Please select at least one item to print'
         }
    },
    pdf: {
        disclaimer: 'This information is Official Sensitive and should not be shared with anyone who does not ' +
            'have a valid reason to use it. The Information in this document which was created using the legacy ' +
            'application, LIDS, is accurate for that period of time entered and should be used in conjunction with ' +
            'legislation and codes which applied at the time of entry. Information in this document which was ' +
            'created using Prison NOMIS may not be accurate and should be discounted. Any information which can be ' +
            'found on Prison NOMIS should be taken from Prison NOMIS. Please note that MoJ/HMPPS will not accept any ' +
            'responsibility for errors on the system.',
        summary: {
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
        dbError: {
            title: 'There was a problem getting the data from the database',
            desc: 'Please try again'
        }
    }
};
