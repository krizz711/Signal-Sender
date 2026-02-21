# ESP8266 Integration Guide

## API Endpoints

Your ESP8266 can send signals to either of these endpoints:

1. **`/api/door-alert`** (Recommended - standard API endpoint)
2. **`/door-alert`** (Alternative - for hardware convenience)

## Data Format

Send a **POST request** with JSON payload:

```json
{
  "door_status": "open",
  "alert": true,
  "duration": 5
}
```

### Field Descriptions:

- **`door_status`** (string, required): Door state - `"open"` or `"closed"`
- **`alert`** (boolean, required): Whether this is an alert event - `true` or `false`
- **`duration`** (number, optional): How long the door was open in seconds

## ESP8266 Code Example

### Using Arduino IDE with ESP8266:

```cpp
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server details
const char* serverURL = "http://YOUR_SERVER_IP:5000/api/door-alert";
// OR use: "http://YOUR_SERVER_IP:5000/door-alert"

// Door sensor pin (example)
const int doorSensorPin = D1; // GPIO5

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
  Serial.print("Connected! IP address: ");
  Serial.println(WiFi.localIP());
  
  // Setup door sensor
  pinMode(doorSensorPin, INPUT_PULLUP);
}

void loop() {
  // Read door sensor (example: LOW = open, HIGH = closed)
  int doorState = digitalRead(doorSensorPin);
  bool isOpen = (doorState == LOW);
  
  // Only send alert when door opens
  if (isOpen) {
    sendDoorAlert("open", true, 0);
    delay(5000); // Wait 5 seconds before checking again
  } else {
    sendDoorAlert("closed", false, 0);
    delay(1000);
  }
}

void sendDoorAlert(String status, bool isAlert, int duration) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    WiFiClient client;
    
    http.begin(client, serverURL);
    http.addHeader("Content-Type", "application/json");
    
    // Create JSON payload
    StaticJsonDocument<200> doc;
    doc["door_status"] = status;
    doc["alert"] = isAlert;
    doc["duration"] = duration;
    
    String jsonPayload;
    serializeJson(doc, jsonPayload);
    
    // Send POST request
    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      String response = http.getString();
      Serial.println(response);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
}
```

## Alternative: Simple HTTP POST (Without JSON Library)

```cpp
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverURL = "http://YOUR_SERVER_IP:5000/api/door-alert";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
}

void loop() {
  // Your sensor reading logic here
  bool doorOpen = digitalRead(D1) == LOW;
  
  if (doorOpen) {
    sendAlert("open", true, 0);
    delay(5000);
  }
}

void sendAlert(String status, bool alert, int duration) {
  HTTPClient http;
  WiFiClient client;
  
  http.begin(client, serverURL);
  http.addHeader("Content-Type", "application/json");
  
  // Manual JSON string
  String payload = "{\"door_status\":\"" + status + 
                   "\",\"alert\":" + (alert ? "true" : "false") + 
                   ",\"duration\":" + String(duration) + "}";
  
  int httpCode = http.POST(payload);
  Serial.printf("Response: %d\n", httpCode);
  http.end();
}
```

## Server Configuration

### For Local Development:

If your ESP8266 and computer are on the same network:

1. **Find your computer's IP address:**
   ```powershell
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   ```

2. **Update ESP8266 code:**
   ```cpp
   const char* serverURL = "http://192.168.1.100:5000/api/door-alert";
   ```

3. **Make sure Windows Firewall allows port 5000:**
   - Windows Security → Firewall → Allow an app
   - Add Node.js or allow port 5000

### For Production/Remote Access:

1. **Deploy your server** (Replit, Heroku, VPS, etc.)
2. **Use the public URL:**
   ```cpp
   const char* serverURL = "https://your-server.com/api/door-alert";
   ```

## Testing with Browser/Postman

Before connecting ESP8266, test the endpoint:

```bash
# Using curl
curl -X POST http://127.0.0.1:5000/api/door-alert \
  -H "Content-Type: application/json" \
  -d '{"door_status":"open","alert":true,"duration":5}'
```

## Response Format

Successful response:
```json
{
  "success": true,
  "message": "Signal processed"
}
```

Error response:
```json
{
  "message": "Error message here"
}
```

## Example Scenarios

### Scenario 1: Door Opens (Alert)
```json
{
  "door_status": "open",
  "alert": true,
  "duration": 0
}
```
→ This will trigger an email notification (if recipient is registered)

### Scenario 2: Door Closes (Normal)
```json
{
  "door_status": "closed",
  "alert": false,
  "duration": 30
}
```
→ This will be logged but won't send email

### Scenario 3: Door Open Too Long
```json
{
  "door_status": "open",
  "alert": true,
  "duration": 300
}
```
→ Alert after 5 minutes, email will be sent

## Hardware Setup Tips

1. **Use a magnetic door sensor** (reed switch)
2. **Add debouncing** to avoid multiple triggers
3. **Use deep sleep** to save battery (if battery-powered)
4. **Add status LED** to show connection status
5. **Monitor serial output** for debugging

## Troubleshooting

### ESP8266 can't connect to server:
- Check WiFi credentials
- Verify server IP address is correct
- Ensure server is running (`npm run dev`)
- Check firewall settings

### Server not receiving signals:
- Check serial monitor for HTTP response codes
- Verify JSON format is correct
- Check server logs for errors
- Test endpoint with Postman/curl first

### Email not sending:
- Verify Gmail credentials in `.env` file
- Check if recipient email is registered in dashboard
- Ensure `alert: true` is set in the payload
