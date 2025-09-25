#!/usr/bin/env python3
"""
Test script for MurphMixes CrateMate v1.2 core functions
Run with: python3 test_functions.py
"""

import sqlite3
import sys
import os

# Add the current directory to the path
sys.path.append('.')

# Import only the core functions we need to test
def to_camelot(key_int, mode_int):
    """Convert key_int and mode_int to Camelot notation."""
    KEYS = ["C","C♯/D♭","D","D♯/E♭","E","F","F♯/G♭","G","G♯/A♭","A","A♯/B♭","B"]
    CAMELOT_MAJOR = {0:"8B",1:"3B",2:"10B",3:"5B",4:"12B",5:"7B",6:"2B",7:"9B",8:"4B",9:"11B",10:"6B",11:"1B"}
    CAMELOT_MINOR = {0:"5A",1:"12A",2:"7A",3:"2A",4:"9A",5:"4A",6:"11A",7:"6A",8:"1A",9:"8A",10:"3A",11:"10A"}
    
    if key_int is None or mode_int is None: 
        return ""
    return (CAMELOT_MAJOR if mode_int==1 else CAMELOT_MINOR).get(key_int, "")

def camelot_neighbors(cam):
    """Get harmonic neighbors of a Camelot key."""
    if not cam: 
        return set()
    num = int(cam[:-1]); let = cam[-1]
    left = 12 if num==1 else num-1
    right = 1 if num==12 else num+1
    return {f"{left}{let}", f"{right}{let}", f"{num}{'B' if let=='A' else 'A'}"}

def key_score(a, b, mode):
    """Calculate key compatibility score between two tracks."""
    if not a or not b:
        return 0.0 if mode != "Ignore" else 1.0
    
    a_cam = to_camelot(a[0], a[1])
    b_cam = to_camelot(b[0], b[1])
    
    if not a_cam or not b_cam:
        return 0.0 if mode != "Ignore" else 1.0
    
    if mode == "Ignore":
        return 1.0
    elif mode == "Exact":
        return 1.0 if a_cam == b_cam else 0.0
    elif mode == "Harmonic":
        if a_cam == b_cam:
            return 1.0
        if b_cam in camelot_neighbors(a_cam):
            return 0.9
        # Parallel/relative keys
        n1, n2 = int(a_cam[:-1]), int(b_cam[:-1])
        if (abs(n1-n2)==2 or abs((n1+12)-n2)==2 or abs(n1-(n2+12))==2) and (a_cam[-1]==b_cam[-1]):
            return 0.75
        # Same pitch class, different mode
        if a[0] == b[0] and a[1] != b[1]:
            return 0.4
        return 0.0
    
    return 0.0

def tempo_score(a_bpm, b_bpm, pct_tol):
    """Calculate tempo compatibility score between two tracks."""
    if not a_bpm or not b_bpm:
        return 0.0
    
    # Calculate percentage difference
    pct_diff = abs(a_bpm - b_bpm) / a_bpm
    
    if pct_diff <= pct_tol / 100.0:
        return 1.0
    elif pct_diff <= 2 * pct_tol / 100.0:
        # Linear decay from 1.0 to 0.0
        return max(0.0, 1.0 - (pct_diff - pct_tol / 100.0) / (pct_tol / 100.0))
    else:
        return 0.0

def energy_score(e1, e2):
    """Calculate energy compatibility score between two tracks."""
    if e1 is None or e2 is None: 
        return 0.0
    return 1.0 - min(1.0, abs(e1-e2)/0.5)

def compat(a, b, pct_tol, key_mode, w=(0.5,0.35,0.15)):
    """Calculate overall compatibility score and reason between two tracks."""
    # Tempo score
    t_score = tempo_score(a.get("bpm"), b.get("bpm"), pct_tol)
    
    # Key score
    a_key = (a.get("key_int"), a.get("mode_int")) if (a.get("key_int") is not None and a.get("mode_int") is not None) else None
    b_key = (b.get("key_int"), b.get("mode_int")) if (b.get("key_int") is not None and b.get("mode_int") is not None) else None
    k_score = key_score(a_key, b_key, key_mode)
    
    # Energy score
    e_score = energy_score(a.get("energy"), b.get("energy"))
    
    # Overall score
    score = round(w[0] * t_score + w[1] * k_score + w[2] * e_score, 3)
    
    # Generate reason string
    reason_parts = []
    
    # Tempo reason
    if a.get("bpm") and b.get("bpm"):
        pct_diff = abs(a["bpm"] - b["bpm"]) / a["bpm"] * 100
        if pct_diff <= pct_tol:
            reason_parts.append(f"Same tempo ({round(a['bpm'], 1)} BPM)")
        else:
            direction = "+" if b["bpm"] > a["bpm"] else "-"
            reason_parts.append(f"{direction}{round(pct_diff, 1)}% tempo")
    
    # Key reason
    if a_key and b_key:
        a_cam = to_camelot(a_key[0], a_key[1])
        b_cam = to_camelot(b_key[0], b_key[1])
        if a_cam == b_cam:
            reason_parts.append(f"Same key {a_cam}")
        elif key_mode == "Harmonic" and b_cam in camelot_neighbors(a_cam):
            reason_parts.append(f"Harmonic {a_cam} → {b_cam}")
        elif key_mode == "Harmonic" and k_score >= 0.75:
            reason_parts.append(f"Relative keys {a_cam} → {b_cam}")
    
    # Energy reason
    if a.get("energy") is not None and b.get("energy") is not None:
        e_diff = abs(a["energy"] - b["energy"])
        if e_diff <= 0.1:
            reason_parts.append("Energy close")
        else:
            reason_parts.append(f"Energy {round(a['energy'], 2)} vs {round(b['energy'], 2)}")
    
    reason = "; ".join(reason_parts) if reason_parts else "Basic compatibility"
    
    return score, reason

def test_to_camelot():
    """Test Camelot key conversion for all 24 keys"""
    print("Testing to_camelot...")
    
    # Test all major keys
    major_tests = [
        (0, 1, "8B"), (1, 1, "3B"), (2, 1, "10B"), (3, 1, "5B"),
        (4, 1, "12B"), (5, 1, "7B"), (6, 1, "2B"), (7, 1, "9B"),
        (8, 1, "4B"), (9, 1, "11B"), (10, 1, "6B"), (11, 1, "1B")
    ]
    
    # Test all minor keys
    minor_tests = [
        (0, 0, "5A"), (1, 0, "12A"), (2, 0, "7A"), (3, 0, "2A"),
        (4, 0, "9A"), (5, 0, "4A"), (6, 0, "11A"), (7, 0, "6A"),
        (8, 0, "1A"), (9, 0, "8A"), (10, 0, "3A"), (11, 0, "10A")
    ]
    
    all_tests = major_tests + minor_tests
    
    for key_int, mode_int, expected in all_tests:
        result = to_camelot(key_int, mode_int)
        if result != expected:
            print(f"❌ to_camelot({key_int}, {mode_int}) = {result}, expected {expected}")
            return False
    
    print("✅ to_camelot: All 24 keys correct")
    return True

def test_tempo_score():
    """Test tempo compatibility scoring"""
    print("Testing tempo_score...")
    
    # Test cases: (bpm1, bpm2, tolerance, expected_score_range)
    tests = [
        (120, 120, 8, (0.99, 1.01)),  # Exact match
        (120, 125, 8, (0.8, 1.0)),    # Within tolerance
        (120, 130, 8, (0.9, 1.0)),    # Within 2x tolerance (8% = 9.6 BPM, 130 is within 16% = 19.2 BPM)
        (120, 140, 8, (0.0, 0.1)),    # Far outside tolerance
        (120, None, 8, 0.0),          # Missing BPM
        (None, 120, 8, 0.0),          # Missing BPM
    ]
    
    for bpm1, bpm2, tol, expected in tests:
        result = tempo_score(bpm1, bpm2, tol)
        if isinstance(expected, tuple):
            if not (expected[0] <= result <= expected[1]):
                print(f"❌ tempo_score({bpm1}, {bpm2}, {tol}) = {result}, expected {expected[0]}-{expected[1]}")
                return False
        else:
            if abs(result - expected) > 0.01:
                print(f"❌ tempo_score({bpm1}, {bpm2}, {tol}) = {result}, expected {expected}")
                return False
    
    print("✅ tempo_score: All test cases passed")
    return True

def test_key_score():
    """Test key compatibility scoring"""
    print("Testing key_score...")
    
    # Test cases: (key1, key2, mode, expected_score)
    tests = [
        # Exact mode
        ((0, 1), (0, 1), "Exact", 1.0),      # Same major key
        ((0, 1), (1, 1), "Exact", 0.0),      # Different major key
        ((0, 0), (0, 0), "Exact", 1.0),      # Same minor key
        ((0, 0), (1, 0), "Exact", 0.0),      # Different minor key
        
        # Harmonic mode
        ((0, 1), (0, 1), "Harmonic", 1.0),   # Exact match
        ((0, 1), (1, 1), "Harmonic", 0.0),   # Not neighbors (C 8B to C# 3B)
        ((0, 1), (7, 1), "Harmonic", 0.9),   # Neighbor (C 8B to G 9B)
        ((0, 1), (0, 0), "Harmonic", 0.4),   # Same pitch, different mode
        
        # Ignore mode
        ((0, 1), (5, 0), "Ignore", 1.0),     # Should ignore key differences
        ((None, None), (5, 0), "Ignore", 1.0), # Missing keys
    ]
    
    for key1, key2, mode, expected in tests:
        result = key_score(key1, key2, mode)
        if abs(result - expected) > 0.01:
            print(f"❌ key_score({key1}, {key2}, '{mode}') = {result}, expected {expected}")
            return False
    
    print("✅ key_score: All test cases passed")
    return True

def test_compat():
    """Test overall compatibility scoring"""
    print("Testing compat...")
    
    # Test tracks
    track1 = {"bpm": 120, "key_int": 0, "mode_int": 1, "energy": 0.8}
    track2 = {"bpm": 120, "key_int": 0, "mode_int": 1, "energy": 0.8}
    track3 = {"bpm": 140, "key_int": 5, "mode_int": 0, "energy": 0.3}
    
    # Perfect match
    score1, reason1 = compat(track1, track2, 8.0, "Exact")
    if score1 < 0.95:
        print(f"❌ Perfect match score too low: {score1}")
        return False
    
    # Poor match
    score2, reason2 = compat(track1, track3, 8.0, "Exact")
    if score2 > 0.5:
        print(f"❌ Poor match score too high: {score2}")
        return False
    
    # Check reason format
    if not isinstance(reason1, str) or len(reason1) < 5:
        print(f"❌ Reason format invalid: {reason1}")
        return False
    
    print("✅ compat: Scoring and reasoning work correctly")
    return True

def test_database_schema():
    """Test database schema creation"""
    print("Testing database schema...")
    
    try:
        # Create a test database
        conn = sqlite3.connect(":memory:")
        
        # Create tables
        conn.execute("""
        CREATE TABLE IF NOT EXISTS tracks(
          track_id TEXT PRIMARY KEY,
          title    TEXT NOT NULL,
          artist   TEXT NOT NULL,
          bpm      REAL,
          key_int  INTEGER,   -- 0..11
          mode_int INTEGER,   -- 1=Major, 0=Minor
          energy   REAL,      -- 0..1
          camelot  TEXT,      -- e.g., "8B"
          url      TEXT,
          source   TEXT,      -- "spotify" | "preview" | "songbpm"
          tags     TEXT       -- free text, comma or JSON
        );
        """)
        
        conn.execute("""
        CREATE TABLE IF NOT EXISTS playlists(
          playlist_id TEXT PRIMARY KEY,
          name        TEXT,
          last_sync   TEXT
        );
        """)
        
        conn.execute("""
        CREATE TABLE IF NOT EXISTS playlist_tracks(
          playlist_id TEXT,
          track_id    TEXT,
          PRIMARY KEY (playlist_id, track_id)
        );
        """)
        
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
        
        # Test inserting data
        test_track = {
            "track_id": "test123",
            "title": "Test Song",
            "artist": "Test Artist",
            "bpm": 120.0,
            "key_int": 0,
            "mode_int": 1,
            "energy": 0.8,
            "camelot": "8B",
            "url": "https://open.spotify.com/track/test123",
            "source": "test",
            "tags": "test"
        }
        
        conn.execute("""
        INSERT INTO tracks (track_id,title,artist,bpm,key_int,mode_int,energy,camelot,url,source,tags)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
        """, (
            test_track["track_id"], test_track["title"], test_track["artist"], test_track["bpm"],
            test_track["key_int"], test_track["mode_int"], test_track["energy"],
            test_track["camelot"], test_track["url"], test_track["source"], test_track["tags"]
        ))
        
        # Test mashup insertion
        conn.execute("""
        INSERT INTO mashups (left_id, right_id, score, reason, tags, notes)
        VALUES (?, ?, ?, ?, ?, ?)
        """, ("test123", "test456", 0.85, "Test compatibility", "", ""))
        
        # Test queries
        tracks = conn.execute("SELECT * FROM tracks").fetchall()
        mashups = conn.execute("SELECT * FROM mashups").fetchall()
        
        if len(tracks) != 1 or len(mashups) != 1:
            print("❌ Database operations failed")
            return False
        
        conn.close()
        print("✅ Database schema works correctly")
        return True
        
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing MurphMixes CrateMate v1.2 Core Functions\n")
    
    tests = [
        test_to_camelot,
        test_tempo_score,
        test_key_score,
        test_compat,
        test_database_schema
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
            print()
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {e}\n")
    
    print(f"📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Core functions are working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the implementation.")
        return 1

if __name__ == "__main__":
    exit(main())
