import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import fs from 'fs';
import path from 'path';

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!db) {
    db = await open({
      filename: 'murphmixes.db',
      driver: sqlite3.Database
    });
    
    // Initialize schema
    await initSchema();
  }
  return db;
}

async function initSchema() {
  const schemaPath = path.join(process.cwd(), 'lib', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Split by semicolon and execute each statement
  const statements = schema.split(';').filter(stmt => stmt.trim());
  
  for (const statement of statements) {
    if (statement.trim()) {
      await db!.exec(statement);
    }
  }
}

// Track Metrics functions
export async function getTrackMetrics(spotifyId: string) {
  const database = await getDb();
  const result = await database.get(
    'SELECT * FROM track_metrics WHERE spotify_id = ?',
    [spotifyId]
  );
  return result;
}

export async function upsertTrackMetrics(
  spotifyId: string,
  bpm: number | null,
  keyNum: number | null,
  mode: number | null,
  keyStr: string | null,
  confidence: number,
  flags: Record<string, any>
) {
  const database = await getDb();
  await database.run(
    `INSERT OR REPLACE INTO track_metrics 
     (spotify_id, bpm, key_num, mode, key_str, confidence, flags, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [spotifyId, bpm, keyNum, mode, keyStr, confidence, JSON.stringify(flags)]
  );
}

// Track Sources functions
export async function getTrackSources(spotifyId: string) {
  const database = await getDb();
  const result = await database.get(
    'SELECT * FROM track_sources WHERE spotify_id = ?',
    [spotifyId]
  );
  return result;
}

export async function upsertTrackSources(
  spotifyId: string,
  spotifyAnalysis: any = null,
  spotifyFeatures: any = null,
  acousticbrainz: any = null,
  previewAnalysis: any = null
) {
  const database = await getDb();
  await database.run(
    `INSERT OR REPLACE INTO track_sources 
     (spotify_id, spotify_analysis, spotify_features, acousticbrainz, preview_analysis, updated_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      spotifyId,
      spotifyAnalysis ? JSON.stringify(spotifyAnalysis) : null,
      spotifyFeatures ? JSON.stringify(spotifyFeatures) : null,
      acousticbrainz ? JSON.stringify(acousticbrainz) : null,
      previewAnalysis ? JSON.stringify(previewAnalysis) : null
    ]
  );
}

// User Overrides functions
export async function getUserOverride(spotifyId: string) {
  const database = await getDb();
  const result = await database.get(
    'SELECT * FROM user_overrides WHERE spotify_id = ?',
    [spotifyId]
  );
  return result;
}

export async function upsertUserOverride(
  spotifyId: string,
  bpm: number | null = null,
  keyNum: number | null = null,
  mode: number | null = null,
  reason: string | null = null
) {
  const database = await getDb();
  await database.run(
    `INSERT OR REPLACE INTO user_overrides 
     (spotify_id, bpm, key_num, mode, reason, updated_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [spotifyId, bpm, keyNum, mode, reason]
  );
}

export async function deleteUserOverride(spotifyId: string) {
  const database = await getDb();
  await database.run(
    'DELETE FROM user_overrides WHERE spotify_id = ?',
    [spotifyId]
  );
}

// Check if metrics are fresh (less than 30 days old)
export async function isMetricsFresh(spotifyId: string): Promise<boolean> {
  const metrics = await getTrackMetrics(spotifyId);
  if (!metrics) return false;
  
  const updatedAt = new Date(metrics.updated_at);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return updatedAt > thirtyDaysAgo;
}
