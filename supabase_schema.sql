-- Schema for Supabase (PostgreSQL) to match SQLAlchemy models in backend

-- Note: "user" can be used as a table name in Postgres, but to avoid ambiguity we quote it.
create table if not exists "user" (
  id serial primary key,
  username varchar(50) unique not null,
  password_hash varchar(128) not null,
  zodiac_sign varchar(20) not null,
  birth_date date null,
  birth_time time null,
  birth_city varchar(100) null,
  chinese_zodiac varchar(20) null,
  chinese_element varchar(20) null,
  vedic_zodiac varchar(20) null,
  vedic_nakshatra varchar(30) null,
  bio varchar(200) null,
  profile_picture varchar(255) null,
  created_at timestamp with time zone default now(),
  last_seen timestamp with time zone default now(),
  is_online boolean default false
);

create table if not exists post (
  id serial primary key,
  content text not null,
  user_id integer not null references "user"(id) on delete cascade,
  zodiac_sign varchar(20) not null,
  is_trend_hijack boolean default false,
  trend_category varchar(50) null,
  image_url varchar(255) null,
  spark_count integer default 0,
  echo_count integer default 0,
  created_at timestamp with time zone default now()
);

create index if not exists idx_post_user_id on post(user_id);
create index if not exists idx_post_created_at on post(created_at desc);

create table if not exists trend (
  id serial primary key,
  name varchar(100) not null,
  hashtag varchar(50) not null,
  trend_type varchar(20) not null,
  participant_count integer default 0,
  zodiac_sign varchar(20) null,
  created_at timestamp with time zone default now()
);

-- Optional: follows table for social graph
create table if not exists follow (
  id serial primary key,
  follower_id integer not null references "user"(id) on delete cascade,
  followed_id integer not null references "user"(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique (follower_id, followed_id)
);

create index if not exists idx_follow_follower on follow(follower_id);
create index if not exists idx_follow_followed on follow(followed_id);
