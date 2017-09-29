const {validateDob, validateAge} = require('../../data/dob');
const {validateName} = require('../../data/names');
const utils = require('../../data/utils');

module.exports = {
    validateDescriptionForm,
    validateAddressForm
};

function validateDescriptionForm(userInput) {

    const {dobDay, dobMonth, dobYear} = userInput;

    if(dobDay || dobMonth || dobYear) {
        const validationErrors = validateDob(dobDay, dobMonth, dobYear);
        if(validationErrors) {
            return validationErrors;
        }
    }

    if(userInput.age) {
        const validationErrors = validateAge(userInput.age);
        if (validationErrors) {
            return validationErrors;
        }
    }

    if(userInput.surname) {
        const validationErrors = validateName(userInput.surname);
        if(validationErrors) {
            return validationErrors;
        }
    }

    if(userInput.forename) {
        const validationErrors = validateName(userInput.forename);
        if(validationErrors) {
            return validationErrors;
        }
    }

    if(userInput.forename2) {
        const validationErrors = validateName(userInput.forename2);
        if(validationErrors) {
            return validationErrors;
        }
    }

    return null;
}


function validateAddressForm(userInput) {

    const search = utils.cleanAddressSearch(userInput.address);

    if (search.split(' ').length < 2) {
        return {title: 'Enter at least 2 address elements'};
    }

    return null;
}
