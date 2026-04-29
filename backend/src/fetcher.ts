import { config } from './config.js';

export interface FeedResult {
  text: string;
  sourceIndex: number;
  feedName: string;
  feedColor?: string;
}

const FETCH_ATTEMPTS = 3;
const FETCH_RETRY_BASE_DELAY_SECONDS = 10;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchRetryDelayMs(attempt: number): number {
  return FETCH_RETRY_BASE_DELAY_SECONDS * 1000 * attempt;
}

async function fetchICS(
  url: string,
  logLabel: string,
): Promise<string | null> {
  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.fetchTimeoutMs);
    let retryDelayMs: number | null = null;

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status} from ${logLabel}`);
      return await res.text();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Fetch ${logLabel} attempt ${attempt}/${FETCH_ATTEMPTS} failed: ${msg}`);
      if (attempt === FETCH_ATTEMPTS) return null;

      retryDelayMs = fetchRetryDelayMs(attempt);
      console.warn(`Retrying ${logLabel} in ${retryDelayMs}ms`);
    } finally {
      clearTimeout(timeout);
    }

    if (retryDelayMs !== null) {
      await sleep(retryDelayMs);
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
