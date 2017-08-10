

exports.translateResult = function(results) {
    return results.map(result => {
        return translate(result);
    });
};

const translations = {
    dateOfBirth: dobTerm,
    middleNames: middleNamesTerm,
    nationalities: nationalitiesTerm
};

function translate(result){
    return Object.keys(result).reduce(convert(result), {});
}

const convert = result => (translatedResult, key) => {

    const value = result[key];
    if (!translations[key]) {
        return Object.assign({}, translatedResult, unchangedTerm(key, result));
    }

    const translation = translations[key](key, result);
    if (!translation) {
        return translatedResult;
    }

    return Object.assign({}, translatedResult, translation);
};

function dobTerm(key, result) {
    return {dob: result[key]};
}

function middleNamesTerm(key, result) {
    return {middleName: result[key]};
}

function nationalitiesTerm(key, result) {
    return {nationality: result[key][0]};
}

function unchangedTerm(key, result) {
    return {[key]: result[key]};
}
