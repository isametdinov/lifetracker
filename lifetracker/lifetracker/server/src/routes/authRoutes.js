/*
  Authentication routes for LifeTracker.
  - /register: create a new user
  - /login: issue JWT token
  - /me: retrieve logged-in user profile
  - PATCH /me: update profile information
*/
const express = require('express');
const router = express.Router();
const { register, login, me, updateProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, me);
router.patch('/me', auth, updateProfile);

module.exports = router;