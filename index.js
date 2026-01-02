const express = require('express');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// API routes
const deviceRoutes = require('./routes/deviceRoutes');
app.use('/api/devices', deviceRoutes);

// Scheduler
require('./scheduler/healthCheckScheduler');
require('./scheduler/archiveScheduler');
require('./scheduler/alertScheduler');


// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});
