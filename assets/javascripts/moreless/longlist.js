const $ = require('jquery');

const NUMBER_EACH_END = 3;
let listItems;
let listLength;

(() => {
    listItems = $('.listItem');
    listLength = listItems.length;
    if(listLength > (NUMBER_EACH_END * 2)) {
        hideMiddleItems();
        addButton();
    }
})();

function hideMiddleItems() {
    const listLength = listItems.length;

    $(listItems).each((index, item) => {
        if (index >= NUMBER_EACH_END && index < (listLength - NUMBER_EACH_END)) {
            $(item).addClass('js-hidden');
            $(item).attr('aria-hidden', 'true');
        }
    });
}

function addButton() {
    $('<a id="showFullList" class="button marginBottom">• • •</a>').insertAfter(listItems[NUMBER_EACH_END])
    .on('click', showAllAndRemoveButton);
}

function showAllAndRemoveButton() {
    $(this).remove();
    $(listItems).each((index, item) => {
        $(item).removeClass('js-hidden');
        $(item).attr('aria-hidden', 'false');
    });
}
