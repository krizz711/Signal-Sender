// ESP32 polling example for Signal-Sender
// - Polls server for commands at GET /api/device/<deviceId>/command
// - Posts door alerts to /door-alert
// - Local buzzer logic: if door open > 10s -> local buzzer ON + POST alert

#include <WiFi.h>
#include <HTTPClient.h>

// === CONFIGURE ===
const char* ssid = "YOUR_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverBase = "http://192.168.1.100:5000"; // change to your PC/server address
const char* deviceId = "door-1";

const int reedPin = 18;    // input from reed switch
const int buzzerPin = 19;  // output to buzzer (active buzzer)

// timing
unsigned long doorOpenStart = 0;
bool doorPreviouslyOpen = false;

unsigned long lastPoll = 0;
const unsigned long pollInterval = 2000; // ms

void setup() {
  Serial.begin(115200);
  pinMode(reedPin, INPUT_PULLUP); // assuming reed to GND when closed
  pinMode(buzzerPin, OUTPUT);
  digitalWrite(buzzerPin, LOW);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print('.');
  }
  Serial.println("\nWiFi connected");
}

void loop() {
  int doorState = digitalRead(reedPin); // HIGH when open if using pullup
  bool isOpen = (doorState == HIGH);

  if (isOpen) {
    if (!doorPreviouslyOpen) {
      doorOpenStart = millis();
      doorPreviouslyOpen = true;
    }

    if (millis() - doorOpenStart >= 10000) {
      // local buzzer ON
      digitalWrite(buzzerPin, HIGH);
      // send alert to server (one-time when enters alert state)
      sendDoorAlert(true, (millis() - doorOpenStart) / 1000);
    }
  } else {
    // door closed
    if (doorPreviouslyOpen) {
      // send closed notification
      unsigned long duration = (millis() - doorOpenStart) / 1000;
      sendDoorAlert(false, duration);
    }
    digitalWrite(buzzerPin, LOW);
    doorPreviouslyOpen = false;
  }

  // Poll server for commands every pollInterval
  if (millis() - lastPoll >= pollInterval) {
    lastPoll = millis();
    pollServerCommand();
  }

  delay(50);
}

void sendDoorAlert(bool alert, unsigned long durationSeconds) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(serverBase) + "/door-alert";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  String payload = "{";
  payload += "\"door_status\": \"" + String(alert ? "open" : "closed") + "\",";
  payload += "\"alert\": " + String(alert ? "true" : "false") + ",";
  payload += "\"duration\": " + String(durationSeconds);
  payload += "}";

  int code = http.POST(payload);
  if (code > 0) {
    Serial.printf("POST %s -> %d\n", url.c_str(), code);
  } else {
    Serial.printf("POST failed: %s\n", http.errorToString(code).c_str());
  }
  http.end();
}

void pollServerCommand() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(serverBase) + "/api/device/" + deviceId + "/command";
  http.begin(url);
  int code = http.GET();
  if (code == 200) {
    String body = http.getString();
    Serial.println("Command response: " + body);
    // naive parsing: look for buzz_on / buzz_off
    if (body.indexOf("buzz_on") >= 0) {
      digitalWrite(buzzerPin, HIGH);
    } else if (body.indexOf("buzz_off") >= 0) {
      digitalWrite(buzzerPin, LOW);
    }
  } else {
    // ignore errors
  }
  http.end();
}
