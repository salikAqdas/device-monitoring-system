const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendOfflineAlert(device) {
  const mail = {
    from: `"Device Monitor" <${process.env.SMTP_USER}>`,
    to: process.env.ALERT_EMAIL,
    subject: `🚨 Device Offline: ${device.device_id}`,
    html: `
      <h3>Device Offline Alert</h3>
      <p><b>Device:</b> ${device.device_id}</p>
      <p><b>Location:</b> ${device.location}</p>
      <p><b>Offline Since:</b> ${device.offline_since}</p>
      <p><b>IP:</b> ${device.ip_address}</p>
    `
  };

  await transporter.sendMail(mail);
}

module.exports = { sendOfflineAlert };
