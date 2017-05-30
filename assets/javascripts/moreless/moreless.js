const $ = require('jquery');

const moreLessMarkup = '<li id="moreless" class="font-xsmall"><a>more</a></li>';
const hideableItems = $('#prisonerInfoSummary').children().filter($('.initiallyHidden'));
let moreless;

(() => {
    $('.initiallyHidden').removeClass('initiallyHidden');
    if(hideableItems.length > 0) {
        $('#prisonerInfoSummary').append(moreLessMarkup);
    }
    moreless = ('#moreless a');
    hide();
    $(moreless).on('click', morelessClickHandler);
})();

function morelessClickHandler() {
    if($(moreless).text() === 'more') {
        $(moreless).first().text('less');
        reveal();
        return;
    }
    $(moreless).text('more');
    hide();
}

function hide() {
    $(hideableItems).each((index, item) => {
        $(item).addClass('js-hidden');
        $(item).attr('aria-hidden', 'true');
    });
}

function reveal() {
    $(hideableItems).each((index, item) => {
        $(item).removeClass('js-hidden');
        $(item).attr('aria-hidden', 'false');
    });
}

