const db = require('../config/db');

async function getActiveDevices() {
  const result = await db.query(`
    SELECT d.device_id, d.ip_address
    FROM devices d
    WHERE d.is_active = true
  `);
  return result.rows;
}

module.exports = { getActiveDevices };
