const $ = require('jquery');

exports.searchError = function(errorObject) {
    const $outerDiv = $('<div>', {'id': 'errors',
                                 'class': 'error-summary',
                                 'role': 'group',
                                 'aria-labelledby': 'error-message',
                                 'tabindex': '-1'});

    const $header = $('<h1>', {'class': 'heading-medium error-summary-heading',
                              'id': 'error-message'});

    const $errorDescription = $('<p>', {'class': 'errorDesc'});

    let $errorHtml = $outerDiv.append($header.text(errorObject.title));
    if (errorObject.desc) $errorHtml.append($errorDescription.text(errorObject.desc));
    return $errorHtml.append(getErrorList(errorObject.items));
}

function getErrorList(items) {
    const $errorList = $('<ul>', {'class': 'error-summary-list'});

    Object.keys(items).forEach((itemKey) => {
        Object.keys(items[itemKey]).forEach((itemErrorKey) => {
            $errorList.append(`<li><a href=#${itemErrorKey}>${items[itemKey][itemErrorKey]}</a></li>`)
        });
    });

    return $errorList;
}
