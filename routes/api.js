var express = require('express');
var router = express.Router();

var data = {
    offenders: [
        {
            offender_id: 1,
            name: 'Billy',
            offence: 'Not updating the task board'
        },
        {
            offender_id: 2,
            name: 'Bobby',
            offence: 'Not updating Trello'
        }
    ]
}

router.get('/offenders', function(req, res) {
    res.json({data: data.offenders});
});

router.get('/offenders/:offender_id', function(req, res) {

    var offender_id = req.params.offender_id;

    for (i=0; i<data.offenders.length; i++) {
        if (data.offenders[i].offender_id === parseInt(offender_id)) {
            res.json({data: data.offenders[i]});
        }
    }
    res.json({data: "No such offender"});
});

module.exports = router;
