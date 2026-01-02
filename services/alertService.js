const db = require('../config/db');
const { sendOfflineAlert } = require('./emailService');

const ALERT_INTERVAL = parseInt(process.env.ALERT_INTERVAL_MINUTES || '120');

async function checkOfflineAlerts() {
  const { rows } = await db.query(`
    SELECT 
      d.device_id,
      d.location,
      d.ip_address,
      s.offline_since,
      s.alert_sent_at
    FROM device_status s
    JOIN devices d ON d.device_id = s.device_id
    WHERE 
      s.status = 'OFFLINE'
      AND (
        s.alert_sent_at IS NULL
        OR s.alert_sent_at <= NOW() - ($1 * INTERVAL '1 minute')
      )
  `, [ALERT_INTERVAL]);

  for (const device of rows) {
    await sendOfflineAlert(device);

    await db.query(`
      UPDATE device_status
      SET alert_sent = true,
          alert_sent_at = NOW()
      WHERE device_id = $1
    `, [device.device_id]);
  }
}

module.exports = { checkOfflineAlerts };
