// Feed and social media types for STAR platform

export interface FeedItem {
  id: string;
  type: 'user_post' | 'sigil' | 'tarot' | 'zodiac' | 'video' | 'prompt';
  content: string | Record<string, unknown>;
  user_id: string | number;
  author: string;
  created_at: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  metadata: {
    zodiac_sign: string;
    planetary_hour: string;
    is_featured: boolean;
  };
}

export interface CosmicProfile {
  profile: {
    username: string;
    zodiac_sign: string;
    chinese_zodiac?: string;
    vedic_zodiac?: string;
    join_date: string;
    archetype?: string;
    bio?: string;
    avatar_url?: string;
    theme: string;
  };
  stats: {
    posts: number;
    total_likes: number;
    total_comments: number;
    current_streak: number;
  };
  recent_posts: Record<string, unknown>[];
  badges: Badge[];
  planetary_context: {
    current_hour: string;
    dominant_energy: string;
    favorable_actions: string[];
  };
}

export interface Badge {
  id: string;
  user_id: string | number;
  badge_name: string;
  badge_description: string;
  badge_icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked_at: string;
}

export interface TrendingContent {
  trending_content: {
    id: string;
    type: string;
    content: {
      text?: string;
      engagement_score: number;
    };
    author: string;
    zodiac_sign: string;
    engagement: {
      likes: number;
      comments: number;
      shares: number;
    };
  }[];
  planetary_context: {
    current_hour: string;
    dominant_energy: string;
    favorable_actions: string[];
  };
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  zodiac_sign: string;
  likes: number;
  created_at: string;
}

export interface ZodiacActions {
  [sign: string]: {
    comment: string;
    like: string;
    follow: string;
    share: string;
  };
}

// API Response types
export interface FeedResponse {
  items: FeedItem[];
  has_more: boolean;
  page: number;
  planetary_context: {
    current_hour: string;
    dominant_energy: string;
    favorable_actions: string[];
  };
}

export interface CreatePostData {
  user_id: string | number;
  content: string;
  content_type?: string;
  media_url?: string;
}

export interface EngagementAction {
  user_id: string | number;
  post_id?: string;
  comment_id?: string;
  comment_text?: string;
}
