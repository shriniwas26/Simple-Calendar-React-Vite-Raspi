import { config } from './config.js';

export interface FeedResult {
  text: string;
  label: 'outlook' | 'google';
}

async function fetchICS(url: string, label: string): Promise<string | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.fetchTimeoutMs);

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status} from ${label}`);
      return await res.text();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Fetch ${label} attempt ${attempt + 1} failed: ${msg}`);
      if (attempt === 1) return null;
    } finally {
      clearTimeout(timeout);
    }
  }
  return null;
}

export async function fetchAllFeeds(): Promise<FeedResult[]> {
  const feeds: { url: string; label: 'outlook' | 'google' }[] = [];
  if (config.outlookIcsUrl) feeds.push({ url: config.outlookIcsUrl, label: 'outlook' });
  if (config.googleIcsUrl) feeds.push({ url: config.googleIcsUrl, label: 'google' });

  const results = await Promise.allSettled(
    feeds.map(({ url, label }) =>
      fetchICS(url, label).then((text): FeedResult | null =>
        text ? { text, label } : null
      )
    )
  );

  const successful: FeedResult[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      successful.push(result.value);
    }
  }

  if (successful.length === 0 && feeds.length > 0) {
    console.warn('All ICS feeds failed');
  }

  return successful;
}
