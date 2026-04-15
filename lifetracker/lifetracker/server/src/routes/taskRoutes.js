const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createTask,
  getTasks,
  getSummary,
  exportLifeHistory,
} = require('../controllers/taskController');

router.use(auth);
router.post('/log', createTask);
router.get('/', getTasks);
router.get('/summary', getSummary);
router.get('/export', exportLifeHistory);

module.exports = router;