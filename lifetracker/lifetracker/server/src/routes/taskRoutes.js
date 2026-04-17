/*
  Task routes are protected by authentication.
  - /log: add a task with location, zone, and focus scoring
  - /: retrieve user tasks
  - /summary: retrieve task summary and analytics
  - /export: export life history data
*/
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