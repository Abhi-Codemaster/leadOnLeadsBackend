const express = require('express');
const router = express.Router();
const { getPlans, getPlanBySlug } = require('../controllers/planController');

router.get('/', getPlans);
router.get('/:slug', getPlanBySlug);

module.exports = router;
