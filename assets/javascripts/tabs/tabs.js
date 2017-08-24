const $ = require('jquery');

let tabs;
let panels;

exports.init = function(container) {
    $('.initiallyHidden').removeClass('initiallyHidden').addClass('js-hidden').attr('aria-hidden', 'true');

    tabs = $(container).find('.searchTab');
    panels = $(container).find('.tabPanel');

    $(tabs).each((index, value) => {
        $(value).on('click', selectTab)
    });
};

function selectTab(event) {
    const tabSelected = $(event.target).data('tab');
    updateTabSelected(tabSelected);
    updatePageVisible(tabSelected);
}

function updateTabSelected(tabSelected) {
    $(tabs).each((index, value) => {
        if($(value).data('tab') === tabSelected) {
            $(value).parent().addClass('active')
        } else {
            $(value).parent().removeClass('active')
        }
    });
}

function updatePageVisible(tabSelected) {
    $(panels).each((index, value) => {
        if($(value).data('panel') === tabSelected) {
            $(value).removeClass('js-hidden').attr('aria-hidden', 'false');
        } else {
            $(value).addClass('js-hidden').attr('aria-hidden', 'true');
        }
    });
}
