import { FeedItem, FeedResponse } from '../types/feed';

export function normalizeFeedItem(item: FeedItem): FeedItem {
  const normalized: FeedItem = { ...item };

  // Coerce user_id to number when possible
  if (typeof normalized.user_id === 'string') {
    const n = parseInt(normalized.user_id, 10);
    if (!Number.isNaN(n)) {
      normalized.user_id = n;
    }
  }

  return normalized;
}

export function normalizeFeedResponse(res: FeedResponse): FeedResponse {
  return {
    ...res,
    items: res.items.map(normalizeFeedItem)
  };
}

export default { normalizeFeedItem, normalizeFeedResponse };
