const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { chatCompletion } = require('../controllers/assistantController');

// All assistant routes require the user to be authenticated
router.use(auth);
// POST /api/assistant/chat -> Trinity chat response
router.post('/chat', chatCompletion);

module.exports = router;
