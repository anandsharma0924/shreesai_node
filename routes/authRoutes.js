const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register user
router.post('/register', authController.register); // /api/auth/register

// Login user (handles both email/password and Google login)
router.post('/login', authController.login); // /api/auth/login

module.exports = router;