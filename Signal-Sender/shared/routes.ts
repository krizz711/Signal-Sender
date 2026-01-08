import { z } from 'zod';
import { insertRecipientSchema, recipients, alertLogs } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  email: {
    get: {
      method: 'GET' as const,
      path: '/api/email',
      responses: {
        200: z.custom<typeof recipients.$inferSelect>(), // Returns the active recipient
        404: errorSchemas.notFound, // If no email registered
      },
    },
    register: {
      method: 'POST' as const,
      path: '/api/register-email',
      input: insertRecipientSchema,
      responses: {
        200: z.custom<typeof recipients.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  alerts: {
    receive: {
      method: 'POST' as const,
      path: '/api/door-alert', // Defined by user: /door-alert (prefixed with /api for consistency, or we can handle direct /door-alert if needed, but standard is /api)
      // Note: User asked for /door-alert. We can map /door-alert to this in server, or just use /api/door-alert. 
      // I'll stick to /api/door-alert for the frontend, but I can add a special route in server/index.ts or routes.ts for the hardware if it's hardcoded.
      // But user said "Endpoint: /door-alert", so I should probably support that.
      // For now, let's define the standard API here.
      input: z.object({
        door_status: z.string(),
        alert: z.boolean(),
        duration: z.number().optional(),
      }),
      responses: {
        200: z.object({ success: z.boolean(), message: z.string() }),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/logs',
      responses: {
        200: z.array(z.custom<typeof alertLogs.$inferSelect>()),
      },
    },
  },
};

// ============================================
// TYPE HELPERS
// ============================================
export type RegisterEmailInput = z.infer<typeof api.email.register.input>;
export type HardwareAlertInput = z.infer<typeof api.alerts.receive.input>;
