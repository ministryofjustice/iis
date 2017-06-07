const $ = require('jquery');

const revealableItems = $('.reveal');
let revealControl;

(() => {
    revealControl = ('#reveal');
    revealHide();
    $(revealControl).on('click', revealClickHandler);
})();

function revealClickHandler() {
    if ($(revealControl).text() === 'more') {
        $(revealControl).first().text('less');
        revealShow();
    } else {
        $(revealControl).text('more');
        revealHide();
    }
}

function revealHide() {
    $(revealableItems).each((index, item) => {
        $(item).addClass('js-hidden');
        $(item).attr('aria-hidden', 'true');
    });
}

function revealShow() {
    $(revealableItems).each((index, item) => {
        $(item).removeClass('js-hidden');
        $(item).attr('aria-hidden', 'false');
    });
}
