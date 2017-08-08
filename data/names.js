module.exports = {
    validateName
};

function validateName(string) {
    const error = {title: 'A name mustn\'t contain space, numbers or special characters'};

    return isString(string) ? null : error;
}

function isString(v) {
    return /^[\sA-Za-z%_'-]+$/.test(v);
}
