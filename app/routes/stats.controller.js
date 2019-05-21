const express = require('express');
const router = express.Router();
const statsService = require('../services/stats.service');
const authorize = require('../_helpers/authorize')
const Role = require('../_helpers/role');

router.get('/visit', authorize(), getStats);
router.get('/visit/in_period', authorize(), getStatsIn);
router.get('/manage', authorize([Role.MeetupManager, Role.Admin]), getManagerStats);
module.exports = router;

function getStats(req, res, next) {
    statsService
        .getStats(req.user.sub)
        .then(stats => res.json(stats))
        .catch(err => next(err));
}

function getStatsIn(req, res, next) {
    statsService
        .getStatsIn(req.user.sub, req.body.startDate, req.body.endDate)
        .then(stats => res.json(stats))
        .catch(err => next(err));
}

function getManagerStats(req, res, next) {
    statsService
        .getManagerStats(req.user.sub)
        .then(stats => res.json(stats))
        .catch(err => next(err));
}