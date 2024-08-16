//forgotPasswordRoute.js

const express = require('express');
const router = express.Router();
const forgotPasswordController = require('../controllers/forgotPasswordController');

// Route to handle forgot password request
router.post('/forgotPassword', forgotPasswordController.forgotPassword);

// Route to handle resetting password
router.post('/resetPassword', forgotPasswordController.resetPassword);

module.exports = router;
