const express = require('express');
const router = express.Router();
const statsService = require('../services/stats.service');
const authorize = require('../_helpers/authorize')
const Role = require('../_helpers/role');

router.get('/visit/in_period', authorize(), getStatsIn);
module.exports = router;

function getStatsIn(req, res, next) {
    statsService
        .getStatsIn(req.user.sub, req.body.startDate, req.body.endDate)
        .then(stats => res.json(stats))
        .catch(err => next(err));
}