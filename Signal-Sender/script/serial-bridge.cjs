// Node serial-to-HTTP bridge
// Usage:
//   node serial-bridge.cjs <SERIAL_PORT> <SERVER_URL>
// Example:
//   node serial-bridge.cjs COM3 http://localhost:5000
//
// If args are omitted the script will read from environment variables:
// SERIAL_PORT and SERVER_URL.

const axios = require('axios');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const serialPortArg = process.argv[2] || process.env.SERIAL_PORT;
const serverUrlArg =
  process.argv[3] || process.env.SERVER_URL || 'http://localhost:5000';

if (!serialPortArg) {
  console.error(
    'Missing serial port. Provide as first arg or set SERIAL_PORT env var.'
  );
  process.exit(1);
}

const SERIAL_PORT = serialPortArg;
const SERVER_URL = serverUrlArg.replace(/\/$/, ''); // strip trailing slash
const ENDPOINTS = [
  `${SERVER_URL}/door-alert`,
  `${SERVER_URL}/api/door-alert`,
];
const BAUD_RATE = parseInt(process.env.BAUD_RATE || '9600', 10);

console.log(`Listening on serial ${SERIAL_PORT} @ ${BAUD_RATE} baud`);
console.log(`Posting alerts to ${ENDPOINTS.join(' and ')}`);

// ✅ Updated constructor style for latest serialport
const port = new SerialPort({
  path: SERIAL_PORT,
  baudRate: BAUD_RATE,
});

const parser = port.pipe(
  new ReadlineParser({ delimiter: '\n' })
);

parser.on('data', async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  console.log('Serial:', trimmed);

  let payload = null;

  // Try JSON first
  try {
    payload = JSON.parse(trimmed);
  } catch (err) {
    // Fallback: parse colon-separated values e.g. "open:true:10"
    const parts = trimmed.split(':');
    if (parts.length >= 2) {
      payload = {
        door_status: parts[0],
        alert: parts[1] === 'true' || parts[1] === '1',
      };
      if (parts[2]) payload.duration = Number(parts[2]);
    } else {
      console.warn('Unrecognized serial format. Skipping.');
      return;
    }
  }

  // Post to both endpoints until one succeeds
  for (const ep of ENDPOINTS) {
    try {
      const res = await axios.post(ep, payload, { timeout: 5000 });
      console.log(`Posted to ${ep}:`, res.status, res.data);
      break; // stop after first success
    } catch (err) {
      console.warn(`Failed to post to ${ep}:`, err.message || err);
    }
  }
});

port.on('error', (err) => {
  console.error('Serial port error:', err.message || err);
});
