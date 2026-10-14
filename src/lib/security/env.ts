/**
 * Environment Variables & Secrets Validation (Fail-Fast at Boot)
 *
 * Enforces strict separation between client-public variables and server-private secrets.
 * Ensures critical secrets are never leaked to the browser.
 */

import { z } from "zod";

const ServerEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  // Supabase private server config
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  // AI Keys (server-only)
  GEMINI_API_KEY: z.string().min(1).optional(),
  // Upstash Redis (optional)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
});

const ClientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default("https://placeholder-project.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).default("placeholder-anon-key"),
  NEXT_PUBLIC_ENABLE_CAPTCHA: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;
export type ClientEnv = z.infer<typeof ClientEnvSchema>;

export function validateServerEnv(): ServerEnv {
  const result = ServerEnvSchema.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.format();
    throw new Error(`Invalid server environment variables: ${JSON.stringify(formatted, null, 2)}`);
  }
  return result.data;
}

export function validateClientEnv(): ClientEnv {
  const result = ClientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_ENABLE_CAPTCHA: process.env.NEXT_PUBLIC_ENABLE_CAPTCHA,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!result.success) {
    const formatted = result.error.format();
    throw new Error(`Invalid public client environment variables: ${JSON.stringify(formatted, null, 2)}`);
  }
  return result.data;
}
