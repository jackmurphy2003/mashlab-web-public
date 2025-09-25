#!/usr/bin/env python3
"""
Database migration script for MurphMixes CrateMate v1.2
Updates the old schema to the new v1.2 schema
"""

import sqlite3
import os

def migrate_database():
    """Migrate the database from v1.1 to v1.2 schema"""
    
    db_path = "murphmixes.db"
    
    if not os.path.exists(db_path):
        print("No database file found. Creating new database with v1.2 schema...")
        return
    
    print("🔄 Migrating database from v1.1 to v1.2...")
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    
    try:
        # Check current schema
        cursor = conn.execute("PRAGMA table_info(mashups)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'mashup_id' in columns:
            print("✅ Database already has v1.2 schema")
            return
        
        print("📋 Current mashups table columns:", columns)
        
        # Backup old data
        print("💾 Backing up old mashup data...")
        old_mashups = conn.execute("SELECT * FROM mashups").fetchall()
        print(f"   Found {len(old_mashups)} existing mashups")
        
        # Drop old table
        print("🗑️  Dropping old mashups table...")
        conn.execute("DROP TABLE mashups")
        
        # Create new table with v1.2 schema
        print("🏗️  Creating new mashups table...")
        conn.execute("""
        CREATE TABLE IF NOT EXISTS mashups(
          mashup_id   INTEGER PRIMARY KEY AUTOINCREMENT,
          left_id     TEXT NOT NULL,
          right_id    TEXT NOT NULL,
          score       REAL,
          reason      TEXT,
          created_at  TEXT DEFAULT CURRENT_TIMESTAMP,
          tags        TEXT,
          notes       TEXT,
          UNIQUE(left_id, right_id)
        );
        """)
        
        # Migrate old data to new schema
        print("🔄 Migrating data...")
        for old_mashup in old_mashups:
            # old_mashup structure: (id, seed_track_id, partner_track_id, title, note, created_at)
            old_id, seed_id, partner_id, title, note, created_at = old_mashup
            
            # Convert to new schema
            # Use default score and reason since we don't have them
            score = 0.5  # Default score
            reason = "Migrated from v1.1"  # Default reason
            tags = ""  # No tags in old schema
            notes = note if note else ""  # Convert old note to new notes
            
            try:
                conn.execute("""
                INSERT INTO mashups (left_id, right_id, score, reason, created_at, tags, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (seed_id, partner_id, score, reason, created_at, tags, notes))
            except sqlite3.IntegrityError:
                print(f"   ⚠️  Skipped duplicate mashup: {seed_id} × {partner_id}")
        
        # Commit changes
        conn.commit()
        
        # Verify migration
        new_count = conn.execute("SELECT COUNT(*) FROM mashups").fetchone()[0]
        print(f"✅ Migration complete! {new_count} mashups migrated")
        
        # Show new schema
        cursor = conn.execute("PRAGMA table_info(mashups)")
        new_columns = [row[1] for row in cursor.fetchall()]
        print("📋 New mashups table columns:", new_columns)
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
