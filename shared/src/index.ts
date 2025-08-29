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
  onboardingCompleted: z.boolean(),
  interestedAssets: z.array(z.string()),
  investorType: z.string().nullable(),
  contentPreferences: z.array(z.string()),
});

export type User = z.infer<typeof UserSchema>;

// Onboarding schemas
export const OnboardingSchema = z.object({
  interestedAssets: z.array(z.string()).min(1, 'Please select at least one crypto asset'),
  investorType: z.enum(['HODLer', 'Day Trader', 'NFT Collector', 'DeFi User', 'Long-term Investor']),
  contentPreferences: z.array(z.enum(['Market News', 'Charts', 'Social', 'Fun'])).min(1, 'Please select at least one content type'),
});

export type OnboardingRequest = z.infer<typeof OnboardingSchema>;

// API response schemas
export const AuthResponseSchema = z.object({
  success: z.boolean(),
  user: UserSchema.optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const OnboardingResponseSchema = z.object({
  success: z.boolean(),
  user: UserSchema.optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export type OnboardingResponse = z.infer<typeof OnboardingResponseSchema>;

// Export Zod for convenience
export { z };


