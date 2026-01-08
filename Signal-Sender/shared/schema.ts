import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// Store the recipient email(s)
export const recipients = pgTable("recipients", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Log incoming hardware signals
export const alertLogs = pgTable("alert_logs", {
  id: serial("id").primaryKey(),
  doorStatus: text("door_status").notNull(), // "open", "closed"
  isAlert: boolean("is_alert").notNull(),
  duration: integer("duration"), // How long the door was open, etc.
  rawPayload: jsonb("raw_payload"), // Store full original JSON for debugging
  emailSent: boolean("email_sent").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertRecipientSchema = createInsertSchema(recipients).omit({ 
  id: true, 
  updatedAt: true 
});

export const insertAlertLogSchema = createInsertSchema(alertLogs).omit({ 
  id: true, 
  timestamp: true,
  emailSent: true
});

// === EXPLICIT API CONTRACT TYPES ===

// Base types
export type Recipient = typeof recipients.$inferSelect;
export type AlertLog = typeof alertLogs.$inferSelect;

// Request types
export type RegisterEmailRequest = z.infer<typeof insertRecipientSchema>;
export type HardwareAlertRequest = {
  door_status: string;
  alert: boolean;
  duration?: number;
}; // Matches the hardware JSON format: { "door_status": "open", "alert": true, "duration": 5 }

// Response types
export type RecipientResponse = Recipient;
export type AlertLogResponse = AlertLog;
export type LogsListResponse = AlertLog[];
