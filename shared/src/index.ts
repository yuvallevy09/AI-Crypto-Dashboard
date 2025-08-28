import { z } from 'zod';

// Health check schema for API responses
export const HealthCheckSchema = z.object({
  ok: z.boolean(),
  ts: z.string().datetime(),
});

export type HealthCheck = z.infer<typeof HealthCheckSchema>;

// Authentication schemas
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginRequest = z.infer<typeof LoginSchema>;
export type RegisterRequest = z.infer<typeof RegisterSchema>;

// User type
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  createdAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

// API response schemas
export const AuthResponseSchema = z.object({
  success: z.boolean(),
  user: UserSchema.optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// Export Zod for convenience
export { z };


