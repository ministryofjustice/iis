const $ = require('jquery');
const {validateDescriptionForm} = require('../../../controllers/helpers/formValidators');
const {searchError} = require('./searchError');
module.exports = {init};

$(document).ready(function(){
    init();
});

function init() {
    $('#submitId, #submitNonId').on('click', validateForm);
}

function validateForm(event) {
    event.preventDefault();
    const error = event.target.id === 'submitId' ? getIdFormError() : getDescriptionFormError();
    if(error){
        return showError(error)
    }
    $(this.form).submit();
}

function getIdFormError() {
    if(isEmpty($('#idForm :input'))) {
        return {title: 'Please enter a value for at least one field'}
    }
    return null;
}

function getDescriptionFormError() {
    const $inputs = $('#descriptionForm :input');

    if(isEmpty($inputs)) {
        return {title: 'Please enter a value for at least one field'}
    }

    let values = {};
    $inputs.each(function() {
        values[this.name] = $(this).val();
    });

    return validateDescriptionForm(values);
}

function isEmpty(formFields) {

    const $emptyFields = formFields.filter(function() {
        return $.trim(this.value) === "";
    });
    // -1 to account for csrf hidden field
    return $emptyFields.length === formFields.length - 1;
}

function showError(error) {
    removeError();
    $('#resultsBody').prepend(searchError(error));
}

function removeError() {
    $('#errors').remove();
}
