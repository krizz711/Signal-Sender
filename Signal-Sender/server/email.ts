import nodemailer from "nodemailer";

// Interface for email configuration
interface EmailConfig {
  user: string;
  pass: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    // In a real app, these would come from process.env
    // The user will need to set these env vars: GMAIL_USER, GMAIL_PASS
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_PASS;

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user,
          pass,
        },
      });
      console.log("Email service initialized with Gmail SMTP");
    } else {
      console.log("Email service credentials not found. Emails will be logged but not sent.");
    }
  }

  async sendAlertEmail(to: string, alertData: { doorStatus: string; duration?: number; time: string }): Promise<boolean> {
    if (!this.transporter) {
      console.log("Mock Email Sent to:", to);
      console.log("Content:", alertData);
      // Return true in dev mode to simulate success if no creds
      return true; 
    }

    const subject = `🚨 DOOR ALERT: Status is ${alertData.doorStatus}`;
    const text = `
      Alert System Notification
      =========================
      
      Status: ${alertData.doorStatus}
      Time: ${alertData.time}
      Duration: ${alertData.duration ? alertData.duration + ' seconds' : 'N/A'}
      
      Please check the door immediately.
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.GMAIL_USER,
        to,
        subject,
        text,
      });
      console.log(`Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      console.error("Failed to send email:", error);
      return false;
    }
  }
}

export const emailService = new EmailService();
