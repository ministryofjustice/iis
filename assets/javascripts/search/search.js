require('core-js');
const $ = require('jquery');
const validator = require('./searchValidators');
const {searchError} = require('./searchError');
const content = require('../../../data/content');

const state = exports.state = {
    position: 0,
    totalPositions: {},
    searchItems: {},
    form: {},
    hints: {},
    title: {},
    currentUserInputs: {},
    currentFormItem: {}
};

(() => {
    const searchItems = $('.searchPrisonerItem');
    setState({
        totalPositions: searchItems.length - 1,
        searchItems: searchItems,
        form: $('form[name="search-prisoner-form"]'),
        hints: $('.hint'),
        title: $('#formTitle')
    });

    $('.initiallyHidden').removeClass('initiallyHidden');
    $('#continue').on('click', continueBtnHandler);
    $('.back-link-container a').on('click', backBtnHandler);
})();

function setState(newState) {
    Object.keys(newState).forEach((key) => {
        state[key] = newState[key];
    });
    state.currentUserInputs = $(state.searchItems[state.position]).find('input');
    state.currentFormItem = getFormItem(state.currentUserInputs);
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
    updateTitle();
    showHideHints();
}

function showHideHints() {
    $(state.hints).each((index, hint) => {
        if($(hint).hasClass(`${state.currentFormItem}Hint`)) {
            revealItem(hint);
        } else {
            hideItem(hint);
        }
    })
}

function updateTitle() {
    const currentTitleText = getFormTitle(state.currentFormItem);
    $(state.title).html(currentTitleText)
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
    const {currentUserInputs} = state;
    const formItem = getFormItem(currentUserInputs);

    if (formItem === 'dob') return validator.isValidDob(currentUserInputs);
    if (formItem === 'names') return validator.isValidName(currentUserInputs);
    if (formItem === 'identifier') return validator.isValidPrisonNumber(currentUserInputs);

    return null
}

function getFormItem ($userInputs) {
    if ($($userInputs, 0).attr('id').toLowerCase().indexOf('dob') > -1) return 'dob';
    if ($($userInputs, 0).attr('id').toLowerCase().indexOf('forename') > -1) return 'names';
    if ($($userInputs, 0).attr('id').toLowerCase().indexOf('prisonnumber') > -1) return 'identifier';

    return null
}

function getFormTitle(formItem) {
    return content.view[formItem] ? content.view[formItem].title : content.view.search.title;
}

function showError(errorObject) {
    removeError();
    $('.back-link-container').after(searchError(errorObject));
}

function removeError() {
    $('#errors').remove();
}
