const cron = require('node-cron');
// const pLimit = require('p-limit');
const pLimit = require('p-limit').default;
const { getActiveDevices } = require('../services/deviceService');
const { pingDevice } = require('../services/pingService');
const { updateDeviceStatus } = require('../services/statusUpdater');
const { insertPingLog } = require('../services/pingLogService');


const limit = pLimit(20); // max 20 parallel pings

cron.schedule('*/30 * * * * *', async () => {
  console.log('Running device health check...');
console.log('Running device health check at', new Date().toISOString());
  const devices = await getActiveDevices();

  const tasks = devices.map(device =>
    limit(async () => {
      try {
        
        const result = await pingDevice(device.ip_address);
        // await updateDeviceStatus(
        //   device.device_id,
        //   result.alive,
        //   result.time
        // );
        // Update device status
await updateDeviceStatus(
  device.device_id,
  result.alive,
  result.time
);

// Insert ping log
await insertPingLog(
  device.device_id,
  result.alive ? 'ONLINE' : 'OFFLINE',
  result.time
);
      } catch (err) {
        console.error(`Error checking ${device.device_id}`, err);
      }
    })
  );

  await Promise.all(tasks);
  console.log('Health check completed.');
});
