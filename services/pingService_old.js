const ping = require('ping');

async function pingDevice(ip) {
  const result = await ping.promise.probe(ip, {
    timeout: 3,
    extra: ['-c', '1'],
  });

  return {
    alive: result.alive,
    time: result.time === 'unknown' ? null : parseFloat(result.time)
  };
}

module.exports = { pingDevice };
