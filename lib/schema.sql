-- Resolver v2 Database Schema
-- Track metrics and key resolution

-- Canonical Key values used throughout the app
CREATE TABLE IF NOT EXISTS track_metrics (
  spotify_id TEXT PRIMARY KEY,
  key_num INTEGER,
  mode INTEGER,  -- 1=major, 0=minor
  key_str TEXT,
  confidence REAL,  -- 0..1
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Raw data from each source for audit/debugging
CREATE TABLE IF NOT EXISTS track_sources (
  spotify_id TEXT PRIMARY KEY,
  spotify_analysis TEXT,  -- JSON: {key,mode,tempo_conf... + sections[]}
  spotify_features TEXT,  -- JSON: {key,mode}
  acousticbrainz TEXT,  -- JSON: {key,mode,confidence}
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User manual overrides (always wins)
CREATE TABLE IF NOT EXISTS user_overrides (
  spotify_id TEXT PRIMARY KEY,
  key_num INTEGER,
  mode INTEGER,
  reason TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_track_metrics_updated_at ON track_metrics(updated_at);
CREATE INDEX IF NOT EXISTS idx_track_sources_updated_at ON track_sources(updated_at);
CREATE INDEX IF NOT EXISTS idx_user_overrides_updated_at ON user_overrides(updated_at);
