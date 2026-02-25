// Arduino sketch: reed switch + buzzer + serial alert
// Wiring assumptions:
// - Reed switch connected between digital pin 2 and GND. Use INPUT_PULLUP.
//   When magnet is present the pin reads LOW (closed). When magnet removed it reads HIGH (open).
// - Buzzer connected to pin 8 (active HIGH). Use a suitable resistor or driver as needed.
// Behavior:
// - When reed switch becomes "open" and stays open for `ALERT_SECONDS`, the buzzer will be activated
//   for `BUZZ_DURATION_MS` and an alert JSON line will be printed over Serial.

const int REED_PIN = 2;
const int BUZZER_PIN = 8;
const unsigned long ALERT_SECONDS = 10UL; // seconds the switch must be open before alert
const unsigned long BUZZ_DURATION_MS = 1000UL; // buzzer duration

unsigned long openedAt = 0;
bool alertSent = false;

void setup() {
  pinMode(REED_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  Serial.begin(9600);
}

void loop() {
  int val = digitalRead(REED_PIN);
  // val == LOW -> magnet present -> "closed"
  // val == HIGH -> magnet removed -> "open"
  bool isOpen = (val == HIGH);

  if (isOpen) {
    if (openedAt == 0) {
      openedAt = millis();
      alertSent = false;
    } else {
      unsigned long elapsed = (millis() - openedAt) / 1000UL;
      if (!alertSent && elapsed >= ALERT_SECONDS) {
        // Trigger buzzer and send serial alert
        tone(BUZZER_PIN, 1000); // 1kHz tone
        delay(BUZZ_DURATION_MS);
        noTone(BUZZER_PIN);

        // Compose JSON payload
        // door_status: "open" because the switch is open (magnet removed)
        // alert: true
        // duration: elapsed seconds the switch was open
        Serial.print('{');
        Serial.print("\"door_status\":\"open\",");
        Serial.print("\"alert\":true,");
        Serial.print("\"duration\":" );
        Serial.print(elapsed);
        Serial.println('}');

        alertSent = true;
      }
    }
  } else {
    // closed (magnet present) -> reset
    openedAt = 0;
    alertSent = false;
  }

  delay(100); // small debounce / loop delay
}
