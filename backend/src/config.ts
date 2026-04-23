import 'dotenv/config';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, isAbsolute } from 'node:path';

export interface IcsFeed {
  name: string;
  url: string;
  /** CSS hex, e.g. #rrggbb; optional, controls event border. */
  color?: string;
}

/** #rgb, #rrggbb, #rrggbb with alpha, #rgba shorthand */
const FEED_COLOR_HEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

const DEFAULT_FEEDS_FILE = 'ics.json';
const DEFAULT_PORT = 4000;
const DEFAULT_TIMEZONE = 'Europe/Amsterdam';
const DEFAULT_CACHE_TTL_MS = 1_800_000;
const DEFAULT_FETCH_TIMEOUT_MS = 10_000;

function resolveFeedsPath(): string {
  const override = process.env.FEEDS_FILE ?? process.env.ICS_JSON_PATH;
  if (override) {
    return isAbsolute(override) ? override : resolve(process.cwd(), override);
  }
  return resolve(process.cwd(), DEFAULT_FEEDS_FILE);
}

function loadFeedsFromFile(): IcsFeed[] {
  const path = resolveFeedsPath();
  if (!existsSync(path)) {
    throw new Error(
      `ICS feeds file not found: ${path}\n` +
        `Copy backend/ics.json.example to ics.json (or set FEEDS_FILE / ICS_JSON_PATH) and add your calendar feeds.`,
    );
  }

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(path, 'utf8')) as unknown;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Invalid JSON in feeds file ${path}: ${msg}`);
  }

  if (typeof raw !== 'object' || raw === null || !('feeds' in raw)) {
    throw new Error(`Invalid feeds file ${path}: expected a top-level "feeds" array`);
  }

  const { feeds } = raw as { feeds: unknown };
  if (!Array.isArray(feeds)) {
    throw new Error(`Invalid feeds file ${path}: "feeds" must be an array`);
  }

  const out: IcsFeed[] = [];
  for (let i = 0; i < feeds.length; i++) {
    const item = feeds[i];
    if (typeof item !== 'object' || item === null) {
      throw new Error(`Invalid feeds file ${path}: feeds[${i}] must be an object with "name" and "url"`);
    }
    const { name, url } = item as { name?: unknown; url?: unknown };
    if (typeof name !== 'string' || typeof url !== 'string') {
      throw new Error(
        `Invalid feeds file ${path}: feeds[${i}] must have string "name" and "url" properties`,
      );
    }
    const n = name.trim();
    const u = url.trim();
    if (!n || !u) {
      throw new Error(
        `Invalid feeds file ${path}: feeds[${i}] "name" and "url" must be non-empty after trimming`,
      );
    }

    const entry: IcsFeed = { name: n, url: u };
    if ('color' in item && item && typeof item === 'object' && (item as { color?: unknown }).color !== undefined) {
      const rawColor = (item as { color?: unknown }).color;
      if (rawColor === null) {
        throw new Error(
          `Invalid feeds file ${path}: feeds[${i}] "color" must be a hex string (e.g. #4a8fff), not null`,
        );
      }
      if (typeof rawColor !== 'string') {
        throw new Error(
          `Invalid feeds file ${path}: feeds[${i}] "color" must be a string (CSS hex, e.g. #4a8fff)`,
        );
      }
      const c = rawColor.trim();
      if (!FEED_COLOR_HEX.test(c)) {
        throw new Error(
          `Invalid feeds file ${path}: feeds[${i}] "color" must match #rrggbb, #rgb, or # with alpha (3–8 hex digits after #)`,
        );
      }
      entry.color = c;
    }
    out.push(entry);
  }

  if (out.length === 0) {
    console.warn(`Warning: no feeds in ${path} (feeds array is empty). The calendar will show no events.`);
  }

  return out;
}

function parseIntInRange(name: string, raw: string | undefined, fallback: number, min: number, max: number): number {
  const input = raw?.trim();
  if (!input) return fallback;
  const value = Number.parseInt(input, 10);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer in range [${min}, ${max}], got "${raw}"`);
  }
  return value;
}

function parsePositiveMs(name: string, raw: string | undefined, fallback: number): number {
  return parseIntInRange(name, raw, fallback, 1, Number.MAX_SAFE_INTEGER);
}

function parseTimezone(raw: string | undefined, fallback: string): string {
  const tz = raw?.trim() || fallback;
  try {
    Intl.DateTimeFormat('en-US', { timeZone: tz }).format(new Date());
    return tz;
  } catch {
    throw new Error(`TIMEZONE must be a valid IANA timezone, got "${raw}"`);
  }
}

const feeds = loadFeedsFromFile();

export const config = {
  feeds,
  port: parseIntInRange('PORT', process.env.PORT, DEFAULT_PORT, 1, 65535),
  timezone: parseTimezone(process.env.TIMEZONE, DEFAULT_TIMEZONE),
  cacheTtlMs: parsePositiveMs('CACHE_TTL_MS', process.env.CACHE_TTL_MS, DEFAULT_CACHE_TTL_MS),
  fetchTimeoutMs: parsePositiveMs(
    'FETCH_TIMEOUT_MS',
    process.env.FETCH_TIMEOUT_MS,
    DEFAULT_FETCH_TIMEOUT_MS,
  ),
  staticDir: process.env.STATIC_DIR ?? resolve(import.meta.dirname, '../../frontend/dist'),
} as const;
