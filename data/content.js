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
        TRY_AGAIN: 'Try again'
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
                  aliases: 'This subject has no aliases',
                  movements: 'This subject has no movements',
                  hdcinfo: 'This subject has no HDC history',
                  offences: 'This subject has no offences',
                  addresses: 'This subject has no addresses'}
    }

};
