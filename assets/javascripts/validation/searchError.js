const $ = require('jquery');

exports.searchError = function(errorObject) {
    const $outerDiv = $('<div>', {'id': 'errors',
        'class': 'error-summary',
        'role': 'group',
        'aria-labelledby': 'error-message',
        'tabindex': '-1'});

    const $header = $('<p>', {'class': 'heading-small error-summary-heading',
        'id': 'error-message'});

    const $errorDescription = $('<p>', {'class': 'errorDesc'});

    let $errorHtml = $outerDiv.append($header.text(errorObject.title));
    if (errorObject.desc) $errorHtml.append($errorDescription.text(errorObject.desc));
    return $errorHtml
};
