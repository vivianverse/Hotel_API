const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Login route
router.post('/login', login);

// Register new user
router.post('/register', register);

module.exports = router;
