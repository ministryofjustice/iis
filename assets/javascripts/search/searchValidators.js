const $ = require('jquery');

const dob = require('../../../data/dob');
const names = require('../../../data/names');
const prisonNumber = require('../../../data/identifier');

const getValue = (items) => (itemWantedId) => $(items.get(items.index($('#'+itemWantedId)))).val();
const getChecked = (items) => (itemWantedId) => $(items.get(items.index($('#'+itemWantedId)))).prop('checked');

exports.isValidDob = function(userInput) {
    const formObject = {};
    const value = getValue(userInput);
    const checked = getChecked(userInput);

    if (checked('optDob')) {
        formObject.dobOrAge = 'dob';
        formObject.dobDay = value('dobDay');
        formObject.dobMonth = value('dobMonth');
        formObject.dobYear = value('dobYear');

        return dob.validate(formObject, (err) => err);
    }

    formObject.dobOrAge = 'age';
    formObject.age = value('age');

    return dob.validate(formObject, (err) => err);
};

exports.isValidName = function(userInput) {
    const value = getValue(userInput);

    return names.validate({forename: value('forename'),
                           forename2: value('forename2'),
                           surname: value('surname')}, (err) => err);
};

exports.isValidPrisonNumber = function(userInput) {
    const value = getValue(userInput);

    return prisonNumber.validate({prisonNumber: value('prisonNumber')}, (err) => err);
};
