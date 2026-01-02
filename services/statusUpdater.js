const db = require('../config/db');

const MAX_FAILURES = 3;

async function updateDeviceStatus(deviceId, isAlive, responseTime) {
  const now = new Date();

  const { rows } = await db.query(
    `SELECT * FROM device_status WHERE device_id = $1`,
    [deviceId]
  );

  const current = rows[0];

  if (isAlive) {
    await db.query(`
      UPDATE device_status
      SET status = 'ONLINE',
          last_checked_at = $1,
          last_online_at = $1,
          offline_since = NULL,
          failure_count = 0,
          response_time_ms = $2
      WHERE device_id = $3
    `, [now, responseTime, deviceId]);
  } else {
    const failureCount = (current.failure_count || 0) + 1;

    await db.query(`
      UPDATE device_status
      SET 
        status = CASE 
          WHEN $1 >= ${MAX_FAILURES} THEN 'OFFLINE'
          ELSE status
        END,
        last_checked_at = $2,
        offline_since = CASE
          WHEN failure_count = 0 THEN $2
          ELSE offline_since
        END,
        failure_count = $1
      WHERE device_id = $3
    `, [failureCount, now, deviceId]);
  }
}

module.exports = { updateDeviceStatus };
