const db = require('../config/db');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

async function archiveOldLogs() {
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  // 1. Fetch old logs
  const { rows } = await db.query(
    `
    SELECT * FROM device_ping_log
    WHERE ping_time < $1
    ORDER BY ping_time ASC
    `,
    [twoDaysAgo]
  );

  if (rows.length === 0) {
    console.log('No logs to archive.');
    return;
  }

  // 2. Create Excel workbook
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs');

  // 3. Ensure archive directory exists
  const archiveDir = path.join(__dirname, '../logs/archive');
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  const fileName = `device_logs_${new Date().toISOString().split('T')[0]}.xlsx`;
  const filePath = path.join(archiveDir, fileName);

  XLSX.writeFile(workbook, filePath);

  // 4. Delete archived logs
  await db.query(
    `DELETE FROM device_ping_log WHERE ping_time < $1`,
    [twoDaysAgo]
  );

  console.log(`Archived ${rows.length} logs to ${fileName}`);
}

module.exports = { archiveOldLogs };
