const net = require('net');

function tcpPing(host, port = 80, timeout = 3000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      const time = Date.now() - start;
      socket.destroy();
      resolve({ alive: true, time });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ alive: false, time: null });
    });

    socket.on('error', () => {
      resolve({ alive: false, time: null });
    });

    socket.connect(port, host);
  });
}

module.exports = { pingDevice: tcpPing };
