/*
  Task controller contains business rules for task creation, retrieval,
  completion, and summary calculation for the current user.
*/
const pool = require('../config/db');

const productivityZones = ['University', 'IT Park', 'Office'];
const leisureZones = ['Home', 'Mall'];

const calculateFocusScore = (durationMinutes = 0, zone = '') => {
  const baseScore = Math.min(100, Math.round(durationMinutes * 1.2));
  const zoneFactor = productivityZones.includes(zone) ? 1.15 : leisureZones.includes(zone) ? 0.85 : 1.0;
  const score = Math.round(baseScore * zoneFactor);
  return Math.max(1, Math.min(100, score));
};

const createTask = async (req, res) => {
  const { title, description, latitude, longitude, zone, durationMinutes } = req.body;
  const userId = req.user.id;

  if (!title || !zone || typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ message: 'Task title, zone, latitude, and longitude are required.' });
  }

  try {
    const focusScore = calculateFocusScore(durationMinutes || 0, zone);
    const result = await pool.query(
      `INSERT INTO tasks
        (user_id, title, description, latitude, longitude, zone, duration_minutes, focus_score, completed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE)
       RETURNING id, title, description, latitude, longitude, zone, duration_minutes AS "durationMinutes", focus_score AS "focusScore", completed, created_at`,
      [userId, title, description || '', latitude, longitude, zone, durationMinutes || 0, focusScore]
    );

    return res.status(201).json({ task: result.rows[0] });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ message: 'Unable to log task.' });
  }
};

const getTasks = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT id, title, description, latitude, longitude, zone, duration_minutes AS "durationMinutes", focus_score AS "focusScore", completed, created_at
       FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    return res.json({ tasks: result.rows });
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ message: 'Unable to retrieve tasks.' });
  }
};

const completeTask = async (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;

  try {
    const result = await pool.query(
      `UPDATE tasks
       SET completed = TRUE
       WHERE id = $1 AND user_id = $2
       RETURNING id, title, description, latitude, longitude, zone, duration_minutes AS "durationMinutes", focus_score AS "focusScore", completed, created_at`,
      [taskId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    return res.json({ task: result.rows[0] });
  } catch (error) {
    console.error('Complete task error:', error);
    return res.status(500).json({ message: 'Unable to complete task.' });
  }
};

const getSummary = async (req, res) => {
  const userId = req.user.id;

  try {
    const stats = await pool.query(
      `SELECT
         COUNT(*) AS total_tasks,
         COALESCE(SUM(duration_minutes), 0) AS total_minutes,
         COALESCE(ROUND(AVG(focus_score), 2), 0) AS average_focus,
         COALESCE(SUM(CASE WHEN completed THEN 1 ELSE 0 END), 0) AS completed_tasks
       FROM tasks
       WHERE user_id = $1`,
      [userId]
    );

    const zones = await pool.query(
      `SELECT zone, COUNT(*) AS count, COALESCE(ROUND(AVG(focus_score), 2), 0) AS average_focus
       FROM tasks
       WHERE user_id = $1
       GROUP BY zone
       ORDER BY count DESC`,
      [userId]
    );

    return res.json({
      summary: {
        totalTasks: Number(stats.rows[0].total_tasks),
        totalMinutes: Number(stats.rows[0].total_minutes),
        averageFocus: Number(stats.rows[0].average_focus),
        completedTasks: Number(stats.rows[0].completed_tasks),
        zoneBreakdown: zones.rows,
      },
    });
  } catch (error) {
    console.error('Summary error:', error);
    return res.status(500).json({ message: 'Unable to build analytics summary.' });
  }
};

const exportLifeHistory = async (req, res) => {
  const userId = req.user.id;
  const format = String(req.query.format || 'json').toLowerCase();

  try {
    const result = await pool.query(
      `SELECT id, title, description, latitude, longitude, zone, duration_minutes AS "durationMinutes", focus_score AS "focusScore", created_at
       FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    if (format === 'csv') {
      const header = 'id,title,description,latitude,longitude,zone,durationMinutes,focusScore,createdAt';
      const rows = result.rows.map(task =>
        [
          task.id,
          `"${String(task.title).replace(/"/g, '""')}"`,
          `"${String(task.description).replace(/"/g, '""')}"`,
          task.latitude,
          task.longitude,
          task.zone,
          task.durationMinutes,
          task.focusScore,
          task.created_at.toISOString(),
        ].join(',')
      );

      res.header('Content-Type', 'text/csv');
      res.attachment('life-history.csv');
      return res.send(`${header}\n${rows.join('\n')}`);
    }

    return res.json({ history: result.rows });
  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ message: 'Unable to export life history.' });
  }
};

module.exports = {
  createTask,
  getTasks,
  getSummary,
  completeTask,
  exportLifeHistory,
};
