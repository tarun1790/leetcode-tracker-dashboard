const express = require('express');
const router = express.Router();
const controller = require('../controllers/trackerController');

// Problems routes
router.get('/problems', controller.getProblemsList);
router.post('/problems', controller.addOrUpdateProblem);
router.delete('/problems/:id', controller.removeProblem);

// Contests routes
router.get('/contests', controller.getContestsList);
router.post('/contests', controller.addOrUpdateContest);
router.delete('/contests/:id', controller.removeContest);

// Stats / Analytics routes
router.get('/dashboard/stats', controller.getDashboardStats);
router.get('/analytics/stats', controller.getAnalyticsStats);

module.exports = router;
