# ESP8266 USB Connection Guide

## Yes, You Can Connect ESP8266 via USB!

You can connect your ESP8266 directly to your laptop using a **USB cable**. This is the standard way to:
- ✅ Program the ESP8266
- ✅ Power the device
- ✅ Monitor serial output
- ✅ Debug your code

## How It Works

### USB Connection Setup:

1. **Connect ESP8266 to Laptop:**
   - Use a **USB cable** (USB-A to Micro-USB or USB-C, depending on your ESP8266)
   - Plug into any USB port on your laptop

2. **Install USB Drivers:**
   - Most ESP8266 boards use **CH340** or **CP2102** USB-to-Serial chips
   - Windows usually installs drivers automatically
   - If not, download from:
     - CH340: https://www.wch.cn/downloads/CH341SER_EXE.html
     - CP2102: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers

3. **Check COM Port:**
   - Open Device Manager (Win+X → Device Manager)
   - Look under "Ports (COM & LPT)"
   - You'll see something like: "USB-SERIAL CH340 (COM3)" or "Silicon Labs CP210x (COM4)"
   - **Note the COM port number** (e.g., COM3, COM4)

## Important: WiFi Still Required!

⚠️ **Even with USB connection, your ESP8266 still needs WiFi to communicate with your server!**

The USB cable is for:
- ✅ Programming/uploading code
- ✅ Powering the device
- ✅ Serial monitoring

The **WiFi connection** is for:
- ✅ Sending HTTP requests to your server
- ✅ Receiving data from the network

## Setup Steps

### Step 1: Program ESP8266 via USB

1. **Open Arduino IDE**
2. **Select Board:**
   - Tools → Board → ESP8266 Boards → NodeMCU 1.0 (or your specific board)
3. **Select COM Port:**
   - Tools → Port → Select your COM port (e.g., COM3)
4. **Upload Code:**
   - Use the ESP8266 code from `ESP8266_INTEGRATION.md`
   - Click Upload button

### Step 2: Configure WiFi in Code

```cpp
const char* ssid = "YOUR_WIFI_SSID";        // Your WiFi name
const char* password = "YOUR_WIFI_PASSWORD"; // Your WiFi password
```

### Step 3: Configure Server URL

**Option A: Same Network (Recommended for Testing)**
```cpp
// Find your laptop's IP address first
// Run: ipconfig in PowerShell
// Look for IPv4 Address (e.g., 192.168.1.100)

const char* serverURL = "http://192.168.1.100:5000/api/door-alert";
```

**Option B: Localhost (Won't Work!)**
```cpp
// ❌ This WON'T work:
const char* serverURL = "http://localhost:5000/api/door-alert";
// ❌ This also WON'T work:
const char* serverURL = "http://127.0.0.1:5000/api/door-alert";
```

**Why?** `localhost` and `127.0.0.1` refer to the ESP8266 itself, not your laptop!

### Step 4: Monitor Serial Output

After uploading, open Serial Monitor:
- Tools → Serial Monitor
- Set baud rate to **115200**
- You'll see:
  - WiFi connection status
  - HTTP response codes
  - Any errors

## Complete Example Code

```cpp
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// IMPORTANT: Use your laptop's IP address, not localhost!
// Find it with: ipconfig
const char* serverURL = "http://192.168.1.100:5000/api/door-alert";

// Door sensor pin
const int doorSensorPin = D1;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected! IP: ");
  Serial.println(WiFi.localIP());
  
  pinMode(doorSensorPin, INPUT_PULLUP);
}

void loop() {
  int doorState = digitalRead(doorSensorPin);
  bool isOpen = (doorState == LOW);
  
  if (isOpen) {
    sendAlert("open", true, 0);
    delay(5000); // Wait 5 seconds
  } else {
    sendAlert("closed", false, 0);
    delay(1000);
  }
}

void sendAlert(String status, bool alert, int duration) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    WiFiClient client;
    
    http.begin(client, serverURL);
    http.addHeader("Content-Type", "application/json");
    
    String payload = "{\"door_status\":\"" + status + 
                     "\",\"alert\":" + (alert ? "true" : "false") + 
                     ",\"duration\":" + String(duration) + "}";
    
    int httpCode = http.POST(payload);
    Serial.print("HTTP Response: ");
    Serial.println(httpCode);
    
    if (httpCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);
    }
    
    http.end();
  } else {
    Serial.println("WiFi Disconnected!");
  }
}
```

## Finding Your Laptop's IP Address

**Windows PowerShell:**
```powershell
ipconfig
```

Look for:
```
IPv4 Address. . . . . . . . . . . : 192.168.1.100
```

Use this IP in your ESP8266 code!

## Testing Setup

1. **Start your server:**
   ```powershell
   npm run dev
   ```

2. **Upload code to ESP8266** (via USB)

3. **Open Serial Monitor** to see:
   - WiFi connection status
   - HTTP requests being sent
   - Response codes

4. **Check server terminal** for:
   - "Received Alert Signal: ..."
   - API request logs

5. **Check dashboard:**
   - Open http://127.0.0.1:5000
   - View logs table for incoming signals

## Troubleshooting

### ESP8266 can't connect to WiFi:
- Check SSID and password are correct
- Ensure WiFi is 2.4GHz (ESP8266 doesn't support 5GHz)
- Check Serial Monitor for error messages

### Can't reach server:
- Verify server is running (`npm run dev`)
- Check laptop IP address is correct
- Ensure ESP8266 and laptop are on same WiFi network
- Check Windows Firewall allows port 5000

### COM port not found:
- Install USB drivers (CH340 or CP2102)
- Try different USB cable
- Check Device Manager for COM port

### "Connection refused" error:
- Server might not be running
- Wrong IP address
- Firewall blocking connection

## Summary

✅ **USB Connection:** For programming and power  
✅ **WiFi Connection:** For sending data to server  
✅ **Both Required:** USB for setup, WiFi for operation  

The ESP8266 will work perfectly connected via USB to your laptop, as long as it can also connect to your WiFi network!
