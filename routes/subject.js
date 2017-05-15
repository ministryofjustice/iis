const {getSubject} = require('../controllers/subjectController');
const express = require('express');

// eslint-disable-next-line
let router = express.Router();

router.get('/', (req, res) => res.redirect('/search'));
router.get('/:id/:page', getSubject);
router.get('/:id', (req, res) => res.redirect('/subject/' + req.params.id + '/summary'));

module.exports = router;
