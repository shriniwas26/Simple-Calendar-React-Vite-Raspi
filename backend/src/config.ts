import 'dotenv/config';

export const config = {
  outlookIcsUrl: process.env.OUTLOOK_ICS_URL ?? '',
  googleIcsUrl: process.env.GOOGLE_ICS_URL ?? '',
  port: parseInt(process.env.PORT ?? '4000', 10),
  timezone: process.env.TIMEZONE ?? 'Europe/Amsterdam',
  cacheTtlMs: parseInt(process.env.CACHE_TTL_MS ?? '300000', 10),
  fetchTimeoutMs: parseInt(process.env.FETCH_TIMEOUT_MS ?? '10000', 10),
} as const;
