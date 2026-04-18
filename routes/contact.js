const express = require('express');
const router = express.Router();
const { submitContact } = require('../controllers/contactController');
const { contactValidation } = require('../middleware/validators');

router.post('/', contactValidation, submitContact);

module.exports = router;
