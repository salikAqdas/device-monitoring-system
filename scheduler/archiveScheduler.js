const cron = require('node-cron');
const { archiveOldLogs } = require('../services/logArchiveService');

cron.schedule('0 1 * * *', async () => {
  console.log('Running daily log archive job...');
  await archiveOldLogs();
});
