# Arduino Uno Setup - Quick Start

## 🎯 Simplest Method: USB Serial Bridge

This method uses Arduino Uno connected via USB, and a Python script bridges the data to your server.

## 📋 Requirements

1. **Arduino Uno** (or compatible)
2. **USB Cable** (Arduino to laptop)
3. **Python 3** (for bridge script)
4. **Door Sensor** (magnetic reed switch or similar)

## 🔧 Step-by-Step Setup

### Step 1: Install Python Dependencies

```powershell
pip install pyserial requests
```

### Step 2: Find Arduino COM Port

1. Connect Arduino to laptop via USB
2. Open **Device Manager** (Win+X → Device Manager)
3. Look under **"Ports (COM & LPT)"**
4. Note the COM port (e.g., COM3, COM4, COM5)

### Step 3: Upload Arduino Code

1. Open **Arduino IDE**
2. Open `arduino-simple.ino`
3. Select board: **Tools → Board → Arduino Uno**
4. Select port: **Tools → Port → COM3** (your port)
5. Click **Upload**

### Step 4: Update Bridge Script

Edit `arduino-bridge.py`:
```python
SERIAL_PORT = 'COM3'  # Change to your COM port
```

### Step 5: Run Everything

**Terminal 1 - Start Server:**
```powershell
cd Signal-Sender
npm run dev
```

**Terminal 2 - Start Bridge:**
```powershell
cd Signal-Sender
python arduino-bridge.py
```

**Terminal 3 - Open Dashboard:**
- Browser: http://127.0.0.1:5000

## ✅ How It Works

```
Arduino Uno (USB)
    ↓ Serial.println(JSON)
Python Bridge Script
    ↓ HTTP POST
Your Server (localhost:5000)
    ↓
Database + Email
    ↓
Dashboard Updates
```

## 🔍 Testing

1. **Test Serial Communication:**
   - Open Arduino Serial Monitor (115200 baud)
   - You should see JSON output when door opens/closes

2. **Test Bridge:**
   - Run `python arduino-bridge.py`
   - Should show "Connected to Arduino"
   - Should show "Received from Arduino" when sensor triggers

3. **Test Server:**
   - Check server terminal for "Received Alert Signal"
   - Check dashboard for new log entries

## 🛠️ Troubleshooting

### "Failed to open serial port"
- Check COM port in Device Manager
- Close Arduino IDE Serial Monitor
- Close other programs using the port
- Try different USB cable/port

### "No data received"
- Check Arduino code uploaded correctly
- Verify sensor wiring
- Check Serial Monitor for output
- Verify baud rate matches (115200)

### "Server not receiving"
- Verify server is running (`npm run dev`)
- Check bridge shows "Sent to server: ..."
- Check server terminal for errors

## 📝 Customization

### Change Sensor Pin:
```cpp
const int doorSensorPin = 5;  // Change from 2 to 5
```

### Change Alert Duration:
```cpp
sendAlert("open", true, 30);  // 30 seconds duration
```

### Change Server URL (if not localhost):
```python
SERVER_URL = "http://192.168.1.100:5000/api/door-alert"
```

## 🎉 That's It!

Once running:
- Arduino sends JSON via USB Serial
- Bridge forwards to server
- Server processes and sends email
- Dashboard shows real-time updates

**Everything else works exactly the same as ESP8266!**
