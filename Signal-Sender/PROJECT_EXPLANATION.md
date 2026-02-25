# Signal-Sender Project - Detailed Explanation

## 📋 Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Complete Data Flow](#complete-data-flow)
4. [Component Breakdown](#component-breakdown)
5. [Database Structure](#database-structure)
6. [API Endpoints](#api-endpoints)
7. [Frontend-Backend Interaction](#frontend-backend-interaction)
8. [Email Notification System](#email-notification-system)
9. [Real-World Workflow Examples](#real-world-workflow-examples)

---

## 🎯 Overview

**Signal-Sender** is an IoT door monitoring system that:
- Receives door status signals from ESP8266 hardware
- Logs all events to a PostgreSQL database
- Sends email alerts when door opens (if configured)
- Provides a real-time dashboard to monitor activity

**Tech Stack:**
- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + TypeScript + Vite
- **Database**: PostgreSQL (Supabase)
- **Email**: Nodemailer (Gmail SMTP)
- **ORM**: Drizzle ORM

---

## 🏗️ System Architecture

```
┌─────────────────┐
│   ESP8266       │
│  (Hardware)     │
│                 │
│  Door Sensor    │
└────────┬────────┘
         │
         │ HTTP POST
         │ JSON Payload
         ▼
┌─────────────────────────────────────┐
│         Express Server              │
│  (Node.js + TypeScript)             │
│                                     │
│  ┌─────────────┐  ┌──────────────┐ │
│  │   Routes    │  │   Storage    │ │
│  │  Handler    │──│   Layer      │ │
│  └─────────────┘  └──────┬───────┘ │
│                          │         │
│  ┌─────────────┐         │         │
│  │   Email     │         │         │
│  │  Service    │         │         │
│  └─────────────┘         │         │
└─────────────────────────┼─────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │  PostgreSQL   │
                  │   Database     │
                  │  (Supabase)    │
                  └───────────────┘
                          │
                          │
         ┌────────────────┼────────────────┐
         │                │                │
         ▼                ▼                ▼
    ┌─────────┐    ┌──────────┐    ┌──────────┐
    │recipients│    │alert_logs│    │  Email   │
    │  Table   │    │  Table   │    │  Sent    │
    └─────────┘    └──────────┘    └──────────┘
         │                │
         │                │
         └────────┬───────┘
                  │
                  ▼
         ┌─────────────────┐
         │  React Frontend │
         │   (Dashboard)   │
         │                 │
         │  - View Logs    │
         │  - Configure    │
         │  - Statistics   │
         └─────────────────┘
```

---

## 🔄 Complete Data Flow

### Scenario 1: ESP8266 Sends Door Alert

```
1. ESP8266 detects door opens
   └─> Reads sensor (digitalRead)
   └─> Creates JSON payload:
       {
         "door_status": "open",
         "alert": true,
         "duration": 0
       }

2. ESP8266 sends HTTP POST request
   └─> URL: http://SERVER_IP:5000/api/door-alert
   └─> Headers: Content-Type: application/json
   └─> Body: JSON payload

3. Express Server receives request
   └─> routes.ts: handleAlert() function
   └─> Validates JSON with Zod schema
   └─> Logs: "Received Alert Signal: {...}"

4. Server saves to database
   └─> storage.logAlert()
   └─> Inserts into alert_logs table:
       - door_status: "open"
       - is_alert: true
       - duration: 0
       - raw_payload: full JSON
       - email_sent: false
       - timestamp: now()

5. Server checks if alert = true
   └─> If true:
       ├─> Get active recipient from database
       ├─> If recipient exists:
       │   ├─> emailService.sendAlertEmail()
       │   ├─> Connects to Gmail SMTP
       │   ├─> Sends email with alert details
       │   └─> Updates log: email_sent = true
       └─> If no recipient:
           └─> Logs: "Alert received but no recipient registered"

6. Server responds to ESP8266
   └─> Status: 200 OK
   └─> Body: {"success": true, "message": "Signal processed"}

7. Frontend auto-refreshes (every 5 seconds)
   └─> useAlertLogs() hook fetches /api/logs
   └─> Dashboard updates with new log entry
   └─> Statistics recalculate
   └─> Logs table shows new row
```

### Scenario 2: User Registers Email

```
1. User enters email in dashboard
   └─> EmailConfigForm component
   └─> Clicks "Register Email"

2. Frontend sends POST request
   └─> URL: /api/register-email
   └─> Body: {"email": "user@example.com"}

3. Server validates and saves
   └─> Validates email format (Zod)
   └─> storage.createOrUpdateRecipient()
   └─> Inserts into recipients table:
       - email: "user@example.com"
       - is_active: true
       - updated_at: now()

4. Server responds
   └─> Returns recipient object with ID

5. Frontend updates
   └─> Shows success toast
   └─> Displays "Currently active: user@example.com"
   └─> Form shows checkmark
```

---

## 🧩 Component Breakdown

### Backend Components

#### 1. **server/index.ts** - Main Server Entry
```typescript
Responsibilities:
- Creates Express app and HTTP server
- Sets up middleware (JSON parsing, logging)
- Registers all API routes
- Sets up Vite dev server (development) or static files (production)
- Starts listening on port 5000
```

#### 2. **server/routes.ts** - API Route Handlers
```typescript
Endpoints:
- POST /api/register-email     → Register recipient email
- GET  /api/email              → Get current recipient
- GET  /api/logs               → Get all alert logs
- POST /api/door-alert         → Receive hardware signal
- POST /door-alert             → Alternative endpoint (same handler)

Each endpoint:
1. Validates input (Zod schema)
2. Calls storage layer
3. Handles errors gracefully
4. Returns JSON response
```

#### 3. **server/storage.ts** - Database Operations
```typescript
DatabaseStorage class:
- getActiveRecipient()        → Get latest registered email
- createOrUpdateRecipient()   → Save new recipient
- logAlert()                  → Save door alert event
- getLogs()                   → Retrieve all logs (newest first)
- updateLogEmailSent()        → Mark email as sent

Uses Drizzle ORM for type-safe database queries
```

#### 4. **server/email.ts** - Email Service
```typescript
EmailService class:
- initTransporter()           → Sets up Gmail SMTP connection
- sendAlertEmail()            → Sends alert email

Flow:
1. Checks if GMAIL_USER and GMAIL_PASS are set
2. Creates Nodemailer transporter
3. Composes email with alert details
4. Sends via Gmail SMTP
5. Returns success/failure
```

#### 5. **server/db.ts** - Database Connection
```typescript
- Creates PostgreSQL connection pool
- Uses DATABASE_URL from environment
- Exports db instance for Drizzle ORM
```

### Frontend Components

#### 1. **client/src/pages/Home.tsx** - Main Dashboard
```typescript
Features:
- Statistics cards (Total Alerts, System Events, Last Activity)
- Email configuration form
- Hardware simulator
- Logs table

Data fetching:
- useAlertLogs() → Auto-refreshes every 5 seconds
- Calculates statistics from logs data
```

#### 2. **client/src/components/EmailConfigForm.tsx**
```typescript
Functionality:
- Displays current recipient email
- Form to register/update email
- Shows active status indicator
- Uses useRegisterEmail() hook
```

#### 3. **client/src/components/SimulationForm.tsx**
```typescript
Functionality:
- Simulates ESP8266 signals
- Dropdown for door status (open/closed)
- Toggle for alert flag
- Input for duration
- Sends POST to /api/door-alert
```

#### 4. **client/src/components/LogsTable.tsx**
```typescript
Functionality:
- Displays all alert logs in table
- Shows: timestamp, status, type, duration, email sent
- Auto-refreshes every 5 seconds
- Manual refresh button
- Color-coded badges for status
```

#### 5. **client/src/hooks/use-alerts.ts**
```typescript
React Query hooks:
- useAlertLogs()      → Fetches logs, auto-refresh 5s
- useSimulateAlert()  → Sends test signal
```

#### 6. **client/src/hooks/use-email.ts**
```typescript
React Query hooks:
- useRecipient()      → Gets current recipient
- useRegisterEmail()  → Registers new email
```

---

## 💾 Database Structure

### Table 1: `recipients`
```sql
Columns:
- id (serial, primary key)
- email (text, not null)        → Email address
- is_active (boolean, default true)
- updated_at (timestamp, default now())

Purpose:
Stores email addresses that should receive alerts.
Only the most recent active recipient receives emails.
```

### Table 2: `alert_logs`
```sql
Columns:
- id (serial, primary key)
- door_status (text, not null)  → "open" or "closed"
- is_alert (boolean, not null)  → true if alert event
- duration (integer, nullable)  → Seconds door was open
- raw_payload (jsonb)           → Full original JSON
- email_sent (boolean, default false)
- timestamp (timestamp, default now())

Purpose:
Stores every signal received from ESP8266.
Tracks whether emails were sent.
Full payload stored for debugging.
```

---

## 🔌 API Endpoints

### 1. Register Email
```http
POST /api/register-email
Content-Type: application/json

Request:
{
  "email": "user@example.com"
}

Response (200):
{
  "id": 1,
  "email": "user@example.com",
  "isActive": true,
  "updatedAt": "2025-12-21T10:30:00Z"
}

Error (400):
{
  "message": "Invalid email format",
  "field": "email"
}
```

### 2. Get Current Email
```http
GET /api/email

Response (200):
{
  "id": 1,
  "email": "user@example.com",
  "isActive": true,
  "updatedAt": "2025-12-21T10:30:00Z"
}

Response (404):
{
  "message": "No email registered"
}
```

### 3. Get Logs
```http
GET /api/logs

Response (200):
[
  {
    "id": 1,
    "doorStatus": "open",
    "isAlert": true,
    "duration": 5,
    "rawPayload": {...},
    "emailSent": true,
    "timestamp": "2025-12-21T10:30:00Z"
  },
  ...
]
```

### 4. Receive Door Alert (Hardware)
```http
POST /api/door-alert
Content-Type: application/json

Request:
{
  "door_status": "open",
  "alert": true,
  "duration": 5
}

Response (200):
{
  "success": true,
  "message": "Signal processed"
}

Error (400):
{
  "message": "Invalid door_status",
  "field": "door_status"
}
```

---

## 🎨 Frontend-Backend Interaction

### Real-Time Updates

```typescript
// Frontend automatically refreshes every 5 seconds
useAlertLogs() hook:
- queryKey: ['/api/logs']
- refetchInterval: 5000ms
- Fetches: GET /api/logs
- Updates: Dashboard statistics and logs table
```

### Data Flow Pattern

```
1. User Action (e.g., register email)
   └─> React component calls hook
   └─> Hook sends HTTP request
   └─> Server processes request
   └─> Server returns response
   └─> Hook updates React Query cache
   └─> Component re-renders with new data
```

### State Management

- **React Query**: Manages server state, caching, auto-refresh
- **React State**: Local UI state (form inputs, toggles)
- **No Redux/Context**: Simple hook-based architecture

---

## 📧 Email Notification System

### Email Service Flow

```typescript
1. Server receives alert with alert: true
   └─> Checks if recipient exists
   └─> If yes: emailService.sendAlertEmail()

2. Email Service:
   └─> Checks if Gmail credentials configured
   └─> If yes: Uses Nodemailer with Gmail SMTP
   └─> If no: Logs to console (mock mode)

3. Email Composition:
   Subject: "🚨 DOOR ALERT: Status is open"
   Body:
     Alert System Notification
     =========================
     Status: open
     Time: 12/21/2025, 10:30:00 AM
     Duration: 5 seconds
     Please check the door immediately.

4. Email Sending:
   └─> Connects to smtp.gmail.com:587
   └─> Authenticates with App Password
   └─> Sends email
   └─> Returns success/failure

5. Database Update:
   └─> If email sent successfully
   └─> Updates alert_logs.email_sent = true
```

### Gmail Configuration

```env
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-16-char-app-password
```

**Why App Password?**
- Google requires 2FA for security
- App Passwords are safer than regular passwords
- Allows programmatic email sending

---

## 🔍 Real-World Workflow Examples

### Example 1: Complete Alert Flow

```
1. ESP8266 detects door opens
   └─> Sensor reads LOW (door open)
   └─> ESP8266 creates JSON:
       {
         "door_status": "open",
         "alert": true,
         "duration": 0
       }

2. ESP8266 sends HTTP POST
   └─> POST http://192.168.1.100:5000/api/door-alert
   └─> Server receives at routes.ts:handleAlert()

3. Server processing:
   ├─> Validates JSON (Zod schema)
   ├─> Logs to console: "Received Alert Signal"
   ├─> Saves to database: alert_logs table
   │   └─> id: 1, door_status: "open", is_alert: true
   ├─> Checks: alert === true? YES
   ├─> Gets recipient: "user@example.com"
   ├─> Sends email via Gmail SMTP
   │   └─> Email delivered to user@example.com
   ├─> Updates database: email_sent = true
   └─> Responds: {"success": true}

4. Frontend updates (within 5 seconds):
   ├─> useAlertLogs() fetches /api/logs
   ├─> New log appears in table
   ├─> Statistics update:
   │   ├─> Total Alerts: +1
   │   ├─> System Events: +1
   │   └─> Last Activity: "10:30 AM"
   └─> Log shows: "OPEN" badge, "ALERT" type, "Sent" status
```

### Example 2: Normal Door Close (No Alert)

```
1. ESP8266 detects door closes
   └─> Sensor reads HIGH (door closed)
   └─> ESP8266 sends:
       {
         "door_status": "closed",
         "alert": false,
         "duration": 30
       }

2. Server processing:
   ├─> Validates and saves to database
   ├─> Checks: alert === true? NO
   ├─> Skips email sending
   └─> Responds: {"success": true}

3. Frontend:
   └─> Log appears with "CLOSED" badge
   └─> Type shows "Info" (not ALERT)
   └─> Email status: "Not sent"
```

### Example 3: User Configuration

```
1. User opens dashboard: http://127.0.0.1:5000

2. User registers email:
   ├─> Enters: "admin@example.com"
   ├─> Clicks "Register Email"
   ├─> Frontend: POST /api/register-email
   ├─> Server: Saves to recipients table
   └─> Frontend: Shows "Currently active: admin@example.com"

3. User tests with simulator:
   ├─> Selects: Door Status = "open"
   ├─> Enables: Trigger Alert
   ├─> Clicks: "Transmit Signal"
   ├─> Frontend: POST /api/door-alert
   ├─> Server: Processes and sends email
   └─> User receives email in inbox
```

---

## 🔐 Security & Error Handling

### Input Validation
- **Zod schemas** validate all API inputs
- Prevents invalid data from reaching database
- Returns clear error messages

### Error Handling
- Try-catch blocks in all route handlers
- Database errors caught and logged
- Email failures don't crash server
- Graceful error responses to client

### Environment Variables
- Sensitive data (passwords, DB URLs) in `.env`
- Never committed to git
- Loaded via `dotenv/config`

---

## 📊 Performance Features

### Frontend Optimizations
- **React Query caching**: Reduces API calls
- **Auto-refresh**: 5-second intervals (configurable)
- **Optimistic updates**: UI updates immediately
- **Lazy loading**: Components load on demand

### Backend Optimizations
- **Connection pooling**: Database connections reused
- **Async/await**: Non-blocking operations
- **Error boundaries**: Prevents cascading failures

---

## 🚀 Deployment Considerations

### Development
- Vite dev server with HMR (Hot Module Replacement)
- Auto-reload on code changes
- Detailed error messages

### Production
- Static file serving for frontend
- Minified and optimized builds
- Environment-based configuration

---

## 📝 Summary

**Signal-Sender** is a complete IoT monitoring system that:

1. **Receives** hardware signals via HTTP POST
2. **Validates** input data with Zod schemas
3. **Stores** events in PostgreSQL database
4. **Sends** email alerts when configured
5. **Displays** real-time dashboard with statistics
6. **Provides** simulation tools for testing

The architecture is:
- **Modular**: Clear separation of concerns
- **Type-safe**: TypeScript throughout
- **Scalable**: Can handle multiple devices
- **Maintainable**: Well-organized code structure

This system can be extended to:
- Multiple door sensors
- Different alert types
- SMS notifications
- Mobile app integration
- Historical analytics

---

## 🛠️ Arduino Sketch — Reed Switch + Buzzer (Initial Threshold Time)

Note: `ALERT_SECONDS` below is the initial threshold time (in seconds) the Arduino uses
to decide when to trigger an alert. Adjust this value on the device if you need a
shorter or longer threshold.

```arduino
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
```
