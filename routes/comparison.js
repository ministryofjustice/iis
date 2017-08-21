const {getComparison} = require('../controllers/comparisonController');

const express = require('express');

// eslint-disable-next-line
let router = express.Router();

router.get('/:prisonNumbers', getComparison);

module.exports = router;
