'use strict';

const birthCountryCodes = exports.birthCountryCodes = require('./codes/birthCountryCodes.json');
const ethnicityCodes = exports.ethnicityCodes = require('./codes/ethnicityCodes.json');
const maritalStatusCodes = exports.maritalStatusCodes = require('./codes/maritalStatusCodes.json');
const nationalityCodes = exports.nationalityCodes = require('./codes/nationalityCodes.json');
const movementDischargeCodes = exports.movementDischargeCodes = require('./codes/movementDischargeCodes.json');
const movementReturnCodes = exports.movementReturnCodes = require('./codes/movementReturnCodes.json');
const hdcStageCodes = exports.hdcStageCodes = require('./codes/hdcStageCodes.json');
const hdcStatusCodes = exports.hdcStatusCodes = require('./codes/hdcStatusCodes.json');

exports.describe = function(codeSet, codeValue) {

    if (!codeSet || !codeValue) {
        return 'Unknown';
    }

    let desc = codeSet[codeValue];

    return desc ? desc : 'Unknown';

};
