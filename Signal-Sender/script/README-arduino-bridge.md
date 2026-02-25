Arduino + Node serial-to-HTTP bridge

Overview:
- The Arduino sketch (`arduino_reed_alert.ino`) prints a single-line JSON payload to Serial when the reed switch is open for 10 seconds.
- The Node script (`serial-bridge.js`) reads lines from the serial port and POSTs them to the server endpoint(s): `/door-alert` and `/api/door-alert`.

Setup (PowerShell):
1. Install Node dependencies in the project root:

```powershell
npm install serialport @serialport/parser-readline axios dotenv
```

2. Upload `arduino_reed_alert.ino` to your Arduino using the Arduino IDE.

3. Find your COM port (Device Manager -> Ports). Then run the bridge:

```powershell
$env:SERIAL_PORT = "COM3"        # replace with your port
$env:SERVER_URL = "http://localhost:5000"  # replace with your server address
node script/serial-bridge.js
```

Or pass args directly:

```powershell
node script/serial-bridge.js COM3 http://localhost:5000
```

Notes & troubleshooting:
- If you use a different baud rate, set the `BAUD_RATE` environment variable before running.
- The Arduino prints JSON like: {"door_status":"open","alert":true,"duration":10}
- The bridge will try `/door-alert` and `/api/door-alert` (the server supports both).
- If using an ESP or networked board instead, you can POST directly from the device and skip this bridge.
