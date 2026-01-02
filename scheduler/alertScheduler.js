const cron = require('node-cron');
const { checkOfflineAlerts } = require('../services/alertService');

cron.schedule('*/30 * * * *', async () => {
  console.log('Running offline alert check...');
  await checkOfflineAlerts();
});
