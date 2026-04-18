const express = require('express');
const router = express.Router();
const { createLead, getLeads } = require('../controllers/leadController');
const { leadValidation } = require('../middleware/validators');
const adminAuth = require('../middleware/adminAuth');

// Public
router.post('/', leadValidation, createLead);

// Admin
router.get('/', adminAuth, getLeads);

module.exports = router;
