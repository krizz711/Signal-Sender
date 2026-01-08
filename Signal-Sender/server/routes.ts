import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { emailService } from "./email";
import { insertRecipientSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // API: Register Email
  app.post(api.email.register.path, async (req, res) => {
    try {
      const input = api.email.register.input.parse(req.body);
      const recipient = await storage.createOrUpdateRecipient(input.email);
      res.status(200).json(recipient);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Error registering email:", err);
      res.status(500).json({ message: "Failed to register email. Check database connection." });
    }
  });

  // API: Get Current Email
  app.get(api.email.get.path, async (req, res) => {
    try {
      const recipient = await storage.getActiveRecipient();
      if (!recipient) {
        return res.status(404).json({ message: "No email registered" });
      }
      res.json(recipient);
    } catch (err) {
      console.error("Error fetching recipient:", err);
      res.status(500).json({ message: "Failed to fetch recipient. Check database connection." });
    }
  });

  // API: Get Logs
  app.get(api.alerts.list.path, async (req, res) => {
    try {
      const logs = await storage.getLogs();
      res.json(logs);
    } catch (err) {
      console.error("Error fetching logs:", err);
      res.status(500).json({ message: "Failed to fetch logs. Check database connection." });
    }
  });

  // API: Receive Door Alert
  // Handles both /api/door-alert and /door-alert (for hardware convenience)
  const handleAlert = async (req: any, res: any) => {
    try {
      const input = api.alerts.receive.input.parse(req.body);
      
      console.log("Received Alert Signal:", input);

      // 1. Log the alert
      const log = await storage.logAlert({
        doorStatus: input.door_status,
        isAlert: input.alert,
        duration: input.duration,
        rawPayload: input,
        emailSent: false
      });

      // 2. If it's an alert, try to send email
      if (input.alert) {
        const recipient = await storage.getActiveRecipient();
        if (recipient) {
          const sent = await emailService.sendAlertEmail(recipient.email, {
            doorStatus: input.door_status,
            duration: input.duration,
            time: new Date().toLocaleString()
          });
          
          if (sent) {
            await storage.updateLogEmailSent(log.id, true);
          }
        } else {
          console.log("Alert received but no recipient registered.");
        }
      }

      res.status(200).json({ success: true, message: "Signal processed" });

    } catch (err) {
      console.error("Error processing alert:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  };

  app.post(api.alerts.receive.path, handleAlert);
  
  // Hardware-friendly endpoint (no /api prefix if needed)
  app.post('/door-alert', handleAlert);

  return httpServer;
}
