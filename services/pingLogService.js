const db = require('../config/db');

async function insertPingLog(deviceId, status, responseTime) {
  try {
    await db.query(
      `
      INSERT INTO device_ping_log 
        (device_id, ping_time, status, response_time_ms)
      VALUES ($1, NOW(), $2, $3)
      `,
      [deviceId, status, responseTime]
    );
  } catch (err) {
    console.error('Failed to insert ping log:', err.message);
  }
}

module.exports = { insertPingLog };
