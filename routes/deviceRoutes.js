const express = require('express');
const router = express.Router();
const db = require('../config/db');

const fs = require('fs');
const path = require('path');

// GET all devices
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
    SELECT 
      d.device_id,
      d.device_name,
      d.location,
      d.ip_address,
      d.is_active,
      s.status,
      s.last_checked_at,
      s.offline_since
    FROM devices d
    LEFT JOIN device_status s ON d.device_id = s.device_id
    ORDER BY d.device_id
  `);

  res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// GET single device
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT d.device_id, d.device_name, d.location, d.ip_address,
             s.status, s.last_checked_at, s.last_online_at, s.offline_since
      FROM devices d
      LEFT JOIN device_status s ON d.device_id = s.device_id
      WHERE d.device_id = $1
    `, [id]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Device not found' });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch device' });
  }
});


// ADD device
router.post('/', async (req, res) => {
  const { device_id, device_name, location, ip_address, is_active } = req.body;

  try {
    await db.query(
      `INSERT INTO devices (device_id, device_name, location, ip_address, is_active)
       VALUES ($1, $2, $3, $4, $5)`,
      [device_id, device_name, location, ip_address, is_active]
    );

    await db.query(
      `INSERT INTO device_status (device_id) VALUES ($1)`,
      [device_id]
    );

    res.status(201).json({ message: 'Device added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add device' });
  }
});


// EDIT device
// UPDATE device
router.put('/:id', async (req, res) => {
  const { device_name, location, ip_address, is_active } = req.body;

  try {
    await db.query(
      `
      UPDATE devices
      SET 
        device_name = $1,
        location = $2,
        ip_address = $3,
        is_active = $4,
        updated_at = NOW()
      WHERE device_id = $5
      `,
      [device_name, location, ip_address, is_active, req.params.id]
    );

    res.json({ message: 'Device updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

// GET recent logs (last 2 days)
router.get('/logs/recent', async (req, res) => {
  const { deviceId, status } = req.query;

  let query = `
    SELECT device_id, ping_time, status, response_time_ms
    FROM device_ping_log
    WHERE ping_time >= NOW() - INTERVAL '2 days'
  `;
  const params = [];

  if (deviceId) {
    params.push(deviceId);
    query += ` AND device_id = $${params.length}`;
  }

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }

  query += ' ORDER BY ping_time DESC LIMIT 1000';

  const { rows } = await db.query(query, params);
  res.json(rows);
});


router.get('/logs/archive', (req, res) => {
  const archiveDir = path.join(__dirname, '../logs/archive');

  if (!fs.existsSync(archiveDir)) {
    return res.json([]);
  }

  const files = fs.readdirSync(archiveDir).filter(f => f.endsWith('.xlsx'));

  res.json(files);
});

router.get('/logs/archive/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../logs/archive', req.params.filename);
  res.download(filePath);
});


module.exports = router;
