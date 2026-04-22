import { config } from './config.js';

export interface FeedResult {
  text: string;
  sourceIndex: number;
  feedName: string;
  feedColor?: string;
}

async function fetchICS(
  url: string,
  logLabel: string,
): Promise<string | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.fetchTimeoutMs);

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status} from ${logLabel}`);
      return await res.text();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Fetch ${logLabel} attempt ${attempt + 1} failed: ${msg}`);
      if (attempt === 1) return null;
    } finally {
      clearTimeout(timeout);
    }
  }
  return null;
}

export async function fetchAllFeeds(): Promise<FeedResult[]> {
  const feeds = config.feeds.map((f, sourceIndex) => ({ ...f, sourceIndex }));

  const results = await Promise.allSettled(
    feeds.map(({ url, name, sourceIndex }) =>
      fetchICS(url, `"${name}" (#${sourceIndex})`).then(
        (text): FeedResult | null => {
          if (!text) return null;
          const r: FeedResult = { text, sourceIndex, feedName: name };
          if (feeds[sourceIndex].color) {
            r.feedColor = feeds[sourceIndex].color;
          }
          return r;
        },
      ),
    ),
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
