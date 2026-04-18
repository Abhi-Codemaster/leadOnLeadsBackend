const express = require('express');
const router = express.Router();
const { uploadExcel, getStats } = require('../controllers/adminController');
const { getLeads } = require('../controllers/leadController');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');

router.use(adminAuth);

router.post('/upload-excel', upload.single('file'), uploadExcel);
router.get('/stats', getStats);
router.get('/leads', getLeads);

module.exports = router;
