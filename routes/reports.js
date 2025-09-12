const express = require('express');
const router = express.Router();
const { downloadUsersReport } = require('../controllers/reportController');
const authMiddleware = require('../middleware/auth'); // یا middleware پنل ادمین

router.get('/users/:status', authMiddleware, downloadUsersReport);

module.exports = router;