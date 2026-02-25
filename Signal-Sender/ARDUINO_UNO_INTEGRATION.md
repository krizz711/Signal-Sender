# Arduino Uno Integration Guide

## ⚠️ Important Difference: Arduino Uno vs ESP8266

**ESP8266:**
- ✅ Has built-in WiFi
- ✅ Can send HTTP requests directly
- ✅ Works wirelessly

**Arduino Uno:**
- ❌ No built-in WiFi
- ❌ No Ethernet (without shield)
- ✅ Can connect via USB Serial

## 🔌 Option 1: Arduino Uno + WiFi Module (Recommended)

Use Arduino Uno with an **ESP8266 as WiFi module** or **WiFi Shield**.

### Setup: Arduino Uno + ESP8266 Module

```
Arduino Uno (USB) → ESP8266 Module (WiFi)
     ↓                      ↓
  Your Laptop          Your Server
```

**Arduino Code:**
```cpp
#include <SoftwareSerial.h>

// ESP8266 connected to pins 2 (RX) and 3 (TX)
SoftwareSerial esp8266(2, 3); // RX, TX

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverURL = "http://10.46.28.199:5000/api/door-alert";

// Door sensor pin
const int doorSensorPin = 2;

void setup() {
  Serial.begin(115200);
  esp8266.begin(115200);
  delay(1000);
  
  // Initialize ESP8266
  sendATCommand("AT", 2000);
  sendATCommand("AT+CWMODE=1", 2000); // Station mode
  sendATCommand("AT+CWJAP=\"" + String(ssid) + "\",\"" + String(password) + "\"", 10000);
  
  pinMode(doorSensorPin, INPUT_PULLUP);
}

void loop() {
  int doorState = digitalRead(doorSensorPin);
  bool isOpen = (doorState == LOW);
  
  if (isOpen) {
    sendAlert("open", true, 0);
    delay(5000);
  }
}

void sendAlert(String status, bool alert, int duration) {
  // Connect to server
  String cmd = "AT+CIPSTART=\"TCP\",\"10.46.28.199\",5000";
  sendATCommand(cmd, 3000);
  
  // Prepare HTTP POST
  String payload = "{\"door_status\":\"" + status + 
                   "\",\"alert\":" + (alert ? "true" : "false") + 
                   ",\"duration\":" + String(duration) + "}";
  
  String httpRequest = "POST /api/door-alert HTTP/1.1\r\n";
  httpRequest += "Host: 10.46.28.199:5000\r\n";
  httpRequest += "Content-Type: application/json\r\n";
  httpRequest += "Content-Length: " + String(payload.length()) + "\r\n\r\n";
  httpRequest += payload;
  
  // Send data
  sendATCommand("AT+CIPSEND=" + String(httpRequest.length()), 2000);
  esp8266.print(httpRequest);
  delay(2000);
  sendATCommand("AT+CIPCLOSE", 2000);
}

String sendATCommand(String command, int timeout) {
  esp8266.println(command);
  String response = "";
  long int time = millis();
  while ((time + timeout) > millis()) {
    while (esp8266.available()) {
      char c = esp8266.read();
      response += c;
    }
  }
  Serial.println(response);
  return response;
}
```

---

## 🔌 Option 2: Arduino Uno via USB Serial Bridge (Easiest)

Arduino sends data via USB Serial → Python/Node.js script forwards to server.

### Architecture:
```
Arduino Uno (USB Serial)
    ↓
Python/Node.js Bridge Script (on laptop)
    ↓
HTTP POST to Server
    ↓
Your Server (localhost:5000)
```

### Arduino Code (Simple Serial Output):
```cpp
const int doorSensorPin = 2;

void setup() {
  Serial.begin(115200);
  pinMode(doorSensorPin, INPUT_PULLUP);
}

void loop() {
  int doorState = digitalRead(doorSensorPin);
  bool isOpen = (doorState == LOW);
  
  if (isOpen) {
    // Send JSON via Serial
    Serial.println("{\"door_status\":\"open\",\"alert\":true,\"duration\":0}");
    delay(5000); // Wait 5 seconds
  } else {
    Serial.println("{\"door_status\":\"closed\",\"alert\":false,\"duration\":0}");
    delay(1000);
  }
}
```

### Python Bridge Script (arduino-bridge.py):
```python
import serial
import requests
import json
import time

# Arduino Serial Port (check Device Manager for COM port)
arduino = serial.Serial('COM3', 115200, timeout=1)
server_url = "http://127.0.0.1:5000/api/door-alert"

print("Arduino Bridge Started...")
print("Listening on", arduino.port)

while True:
    try:
        if arduino.in_waiting > 0:
            line = arduino.readline().decode('utf-8').strip()
            
            if line.startswith('{'):
                # Parse JSON from Arduino
                data = json.loads(line)
                print(f"Received: {data}")
                
                # Forward to server
                response = requests.post(server_url, json=data)
                print(f"Server response: {response.status_code}")
                
    except json.JSONDecodeError:
        print("Invalid JSON:", line)
    except Exception as e:
        print(f"Error: {e}")
    
    time.sleep(0.1)
```

### Node.js Bridge Script (arduino-bridge.js):
```javascript
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const axios = require('axios');

// Change COM3 to your Arduino's COM port
const port = new SerialPort('COM3', { baudRate: 115200 });
const parser = port.pipe(new Readline({ delimiter: '\n' }));

const serverURL = 'http://127.0.0.1:5000/api/door-alert';

console.log('Arduino Bridge Started...');

parser.on('data', async (data) => {
  try {
    const line = data.toString().trim();
    
    if (line.startsWith('{')) {
      const jsonData = JSON.parse(line);
      console.log('Received:', jsonData);
      
      // Forward to server
      const response = await axios.post(serverURL, jsonData);
      console.log('Server response:', response.status);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
});
```

**Install Node.js dependencies:**
```bash
npm install serialport @serialport/parser-readline axios
```

---

## 🔌 Option 3: Arduino Uno + Ethernet Shield

If you have an Ethernet Shield, Arduino can connect directly via Ethernet cable.

### Arduino Code (Ethernet):
```cpp
#include <Ethernet.h>
#include <ArduinoJson.h>

// MAC address (change to unique value)
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };

// Server IP (your laptop's IP)
IPAddress server(10, 46, 28, 199);
int serverPort = 5000;

EthernetClient client;
const int doorSensorPin = 2;

void setup() {
  Serial.begin(115200);
  
  // Start Ethernet connection
  if (Ethernet.begin(mac) == 0) {
    Serial.println("Failed to configure Ethernet");
    return;
  }
  
  Serial.print("IP Address: ");
  Serial.println(Ethernet.localIP());
  
  pinMode(doorSensorPin, INPUT_PULLUP);
}

void loop() {
  int doorState = digitalRead(doorSensorPin);
  bool isOpen = (doorState == LOW);
  
  if (isOpen) {
    sendAlert("open", true, 0);
    delay(5000);
  }
}

void sendAlert(String status, bool alert, int duration) {
  if (client.connect(server, serverPort)) {
    // Create JSON
    StaticJsonDocument<200> doc;
    doc["door_status"] = status;
    doc["alert"] = alert;
    doc["duration"] = duration;
    
    String payload;
    serializeJson(doc, payload);
    
    // Send HTTP POST
    client.println("POST /api/door-alert HTTP/1.1");
    client.println("Host: 10.46.28.199:5000");
    client.println("Content-Type: application/json");
    client.print("Content-Length: ");
    client.println(payload.length());
    client.println();
    client.println(payload);
    
    delay(1000);
    client.stop();
  }
}
```

---

## 📊 Comparison Table

| Method | Hardware Needed | Complexity | Wireless | Best For |
|--------|----------------|------------|----------|----------|
| **ESP8266 Module** | Arduino + ESP8266 | Medium | ✅ Yes | Production |
| **USB Serial Bridge** | Arduino Only | Easy | ❌ No | Testing/Development |
| **Ethernet Shield** | Arduino + Shield | Medium | ❌ No | Fixed Location |

---

## 🎯 Recommended: USB Serial Bridge (Easiest)

**For testing/development, use Option 2 (USB Serial Bridge):**

### Steps:

1. **Connect Arduino Uno via USB**
   - Plug USB cable into laptop
   - Note COM port (Device Manager)

2. **Upload Simple Arduino Code:**
   ```cpp
   void setup() {
     Serial.begin(115200);
     pinMode(2, INPUT_PULLUP);
   }
   
   void loop() {
     bool isOpen = digitalRead(2) == LOW;
     if (isOpen) {
       Serial.println("{\"door_status\":\"open\",\"alert\":true,\"duration\":0}");
       delay(5000);
     }
   }
   ```

3. **Run Python Bridge Script:**
   ```bash
   python arduino-bridge.py
   ```
   (Change COM port in script)

4. **Everything else stays the same!**
   - Server receives at `/api/door-alert`
   - Database saves logs
   - Email sends (if configured)
   - Dashboard updates

---

## 🔧 Complete Setup Example

### Step 1: Arduino Code
```cpp
const int doorSensorPin = 2;

void setup() {
  Serial.begin(115200);
  pinMode(doorSensorPin, INPUT_PULLUP);
}

void loop() {
  int doorState = digitalRead(doorSensorPin);
  
  if (doorState == LOW) { // Door open
    Serial.println("{\"door_status\":\"open\",\"alert\":true,\"duration\":0}");
    delay(5000);
  } else { // Door closed
    Serial.println("{\"door_status\":\"closed\",\"alert\":false,\"duration\":0}");
    delay(1000);
  }
}
```

### Step 2: Python Bridge (arduino-bridge.py)
```python
import serial
import requests
import json

arduino = serial.Serial('COM3', 115200)  # Change COM3 to your port
server = "http://127.0.0.1:5000/api/door-alert"

print("Bridge running...")

while True:
    line = arduino.readline().decode('utf-8').strip()
    if line.startswith('{'):
        data = json.loads(line)
        requests.post(server, json=data)
        print(f"Sent: {data}")
```

### Step 3: Run Everything
```powershell
# Terminal 1: Start server
npm run dev

# Terminal 2: Start bridge
python arduino-bridge.py
```

---

## ✅ Summary

**Yes, you can use Arduino Uno!**

**Simplest method:**
1. Arduino sends JSON via USB Serial
2. Python/Node.js bridge script reads Serial
3. Bridge forwards to your server via HTTP
4. **Everything else works exactly the same!**

The server doesn't care if data comes from:
- ESP8266 directly
- Arduino via bridge
- Manual POST request

As long as it receives the correct JSON format at `/api/door-alert`, it works!

See `ARDUINO_UNO_INTEGRATION.md` for complete code examples.
