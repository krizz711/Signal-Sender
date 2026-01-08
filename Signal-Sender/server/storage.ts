import { db } from "./db";
import { recipients, alertLogs, type Recipient, type InsertRecipient, type AlertLog, type InsertAlertLog } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Recipient operations
  getActiveRecipient(): Promise<Recipient | undefined>;
  createOrUpdateRecipient(email: string): Promise<Recipient>;
  
  // Log operations
  logAlert(log: InsertAlertLog): Promise<AlertLog>;
  getLogs(): Promise<AlertLog[]>;
  updateLogEmailSent(id: number, sent: boolean): Promise<AlertLog>;
}

export class DatabaseStorage implements IStorage {
  async getActiveRecipient(): Promise<Recipient | undefined> {
    const [recipient] = await db
      .select()
      .from(recipients)
      .where(eq(recipients.isActive, true))
      .orderBy(desc(recipients.updatedAt)) // Get the most recently updated one
      .limit(1);
    return recipient;
  }

  async createOrUpdateRecipient(email: string): Promise<Recipient> {
    // Ideally we might just have one active recipient for this simple app, 
    // or we mark others as inactive. Let's just insert a new one and it becomes the latest.
    // Or we can update the existing one if we want to keep history simple.
    // Let's just insert to keep a history of who was registered when.
    const [recipient] = await db
      .insert(recipients)
      .values({ email, isActive: true })
      .returning();
    return recipient;
  }

  async logAlert(log: InsertAlertLog): Promise<AlertLog> {
    const [newLog] = await db
      .insert(alertLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getLogs(): Promise<AlertLog[]> {
    return await db
      .select()
      .from(alertLogs)
      .orderBy(desc(alertLogs.timestamp));
  }

  async updateLogEmailSent(id: number, sent: boolean): Promise<AlertLog> {
    const [updated] = await db
      .update(alertLogs)
      .set({ emailSent: sent })
      .where(eq(alertLogs.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
