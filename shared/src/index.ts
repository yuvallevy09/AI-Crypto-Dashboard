import { z } from 'zod';

// Health check schema for API responses
export const HealthCheckSchema = z.object({
  ok: z.boolean(),
  ts: z.string().datetime(),
});

export type HealthCheck = z.infer<typeof HealthCheckSchema>;

// Export Zod for convenience
export { z };


