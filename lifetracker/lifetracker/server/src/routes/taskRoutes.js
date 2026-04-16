const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createTask,
  getTasks,
  getSummary,
  completeTask,
  exportLifeHistory,
} = require('../controllers/taskController');

router.use(auth);
router.post('/log', createTask);
router.patch('/:id/complete', completeTask);
router.get('/', getTasks);
router.get('/summary', getSummary);
router.get('/export', exportLifeHistory);

module.exports = router;