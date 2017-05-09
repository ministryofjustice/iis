'use strict';

const birthCountryCodesJson = require('./codes/birthCountryCodes.json');
const ethnicityCodesJson = require('./codes/ethnicityCodes.json');
const maritalStatusCodesJson = require('./codes/maritalStatusCodes.json');
const nationalityCodesJson = require('./codes/nationalityCodes.json');
const movementDischargeCodesJson = require('./codes/movementDischargeCodes.json');
const movementReturnCodesJson = require('./codes/movementReturnCodes.json');
const hdcStageCodesJson = require('./codes/hdcStageCodes.json');
const hdcStatusCodesJson = require('./codes/hdcStatusCodes.json');

const codeSets = {
    BIRTH_COUNTRY: birthCountryCodesJson,
    ETHNIC_GROUP: ethnicityCodesJson,
    MARITAL_STATUS: maritalStatusCodesJson,
    NATIONALITY: nationalityCodesJson,
    MOVEMENT_DISCHARGE: movementDischargeCodesJson,
    MOVEMENT_RETURN: movementReturnCodesJson,
    HDC_STAGE: hdcStageCodesJson,
    HDC_STATUS: hdcStatusCodesJson
};

exports.describeCodes = function(codeType, codeValue) {

    const json = codeSets[codeType];

    if (!json || !codeValue) {
        return 'Unknown';
    }

    let desc = json[codeValue];

    return desc ? desc : 'Unknown';
};
