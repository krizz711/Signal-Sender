/*
 * Signal-Sender Arduino Uno Code
 * Sends door status via Serial (USB) to bridge script
 * 
 * Hardware:
 * - Door sensor connected to pin 2 (with pull-up)
 * - LOW = door open, HIGH = door closed
 */

const int doorSensorPin = 2;  // Change to your sensor pin

void setup() {
  // Initialize Serial communication
  Serial.begin(115200);
  
  // Wait for serial port to connect (optional, for debugging)
  // while (!Serial) {
  //   ; // Wait for serial port to connect
  // }
  
  // Configure door sensor pin
  pinMode(doorSensorPin, INPUT_PULLUP);
  
  Serial.println("Arduino Signal-Sender Started");
  Serial.println("Waiting for door events...");
}

void loop() {
  // Read door sensor
  int doorState = digitalRead(doorSensorPin);
  bool isOpen = (doorState == LOW);  // LOW = open (sensor triggered)
  
  if (isOpen) {
    // Door is open - send alert
    sendAlert("open", true, 0);
    delay(5000);  // Wait 5 seconds before checking again
  } else {
    // Door is closed - log normal event
    sendAlert("closed", false, 0);
    delay(1000);  // Check every second when closed
  }
}

void sendAlert(String status, bool alert, int duration) {
  // Create JSON payload
  Serial.print("{");
  Serial.print("\"door_status\":\"");
  Serial.print(status);
  Serial.print("\",\"alert\":");
  Serial.print(alert ? "true" : "false");
  Serial.print(",\"duration\":");
  Serial.print(duration);
  Serial.println("}");
  
  // Optional: Also print to Serial Monitor for debugging
  // Serial.println("Sent: " + status + " alert=" + (alert ? "true" : "false"));
}
