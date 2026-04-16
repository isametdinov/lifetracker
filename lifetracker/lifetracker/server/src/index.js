const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Read environment variables from the server .env file before starting the app
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const initDb = require('./config/initDb');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const assistantRoutes = require('./routes/assistantRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'LifeTracker API is running' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'LifeTracker API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/assistant', assistantRoutes);

// Return a user-friendly 404 for requests to unknown API paths
app.use((req, res) => {
  res.status(404).json({ message: 'API route not found.' });
});

// Central error handler for unexpected exceptions in route handlers
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'An internal server error occurred.' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();