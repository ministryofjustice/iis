require('core-js');
const $ = require('jquery');
const validator = require('./searchValidators');
const {searchError} = require('./searchError');

const state = exports.state = {
    position: 0,
    totalPositions: {},
    searchItems: {},
    form: {}
};

(() => {
    const searchItems = $('.searchPrisonerItem');
    setState({
        totalPositions: searchItems.length - 1,
        searchItems: searchItems,
        form: $('form[name="search-prisoner-form"]')
    });

    $(state.searchItems).each((index, item) => {
        $(item).removeClass('initial');
    });

    $('#continue').on('click', continueBtnHandler);
    $('.back-link-container a').on('click', backBtnHandler);


})();

function setState(newState) {
    Object.keys(newState).forEach((key) => {
        state[key] = newState[key];
    });

    render();
}

function render() {
    $(state.searchItems).each((index, item) => {
        if (index === state.position) {
            revealItem(item);
        } else {
            hideItem(item);
        }
    });
}

function revealItem(item) {
    if ($(item).hasClass('js-hidden')) {
        $(item).removeClass('js-hidden');
        $(item).attr('aria-hidden', 'false');
    }
}

function hideItem(item) {
    if (!$(item).hasClass('js-hidden')) {
        $(item).addClass('js-hidden');
        $(item).attr('aria-hidden', 'true');
    }
}

function continueBtnHandler(event) {
    event.preventDefault();

    const validationError = getValidationError();
    if(validationError) {
        return showError(validationError);
    }
    removeError();

    if(state.position < state.totalPositions) {
        incrementPosition(1);
        return;
    }
    state.form.submit();
}

function backBtnHandler(event) {
    if(state.position !== 0) {
        event.preventDefault();
        incrementPosition(-1);
    }
}

function incrementPosition(amount) {
    const newPosition = state.position + amount;
    if(newPosition >= 0 && newPosition <= state.totalPositions) {
        setState({
            position: newPosition
        });
    }
}

function getValidationError() {
    const $userInputs = $(state.searchItems[state.position]).find('input');
    const formItem = getFormItem($userInputs);

    if (formItem === 'dob') return validator.isValidDob($userInputs);
    if (formItem === 'forename') return validator.isValidName($userInputs);
    if (formItem === 'prisonNumber') return validator.isValidPrisonNumber($userInputs);

    return null
}

function getFormItem ($userInputs) {
    if ($($userInputs, 0).attr('id').toLowerCase().indexOf('dob') > -1) return 'dob';
    if ($($userInputs, 0).attr('id').toLowerCase().indexOf('forename') > -1) return 'forename';
    if ($($userInputs, 0).attr('id').toLowerCase().indexOf('prisonnumber') > -1) return 'prisonNumber';

    return null
}

function showError(errorObject) {
    removeError();
    $('.back-link-container').after(searchError(errorObject));
}

function removeError() {
    $('#errors').remove();
}
