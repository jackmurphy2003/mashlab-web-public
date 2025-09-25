#!/usr/bin/env python3
"""
Test script for MurphMixes CrateMate v1.2 core functions
Run with: python test_core.py
"""

import sys
import os
sys.path.append('.')

from app import (
    to_camelot, tempo_score, key_score, compat,
    db_add_track, db_list_tracks, db_add_mashup, db_list_mashups
)

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
        (120, 130, 8, (0.0, 0.5)),    # Outside tolerance
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
        ((0, 1), (1, 1), "Harmonic", 0.9),   # Neighbor (C to C#)
        ((0, 1), (7, 1), "Harmonic", 0.75),  # Relative (C to G)
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

def test_database():
    """Test database operations"""
    print("Testing database operations...")
    
    try:
        # Test track operations
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
        
        # Add track
        db_add_track(test_track)
        
        # List tracks
        tracks = db_list_tracks()
        found = any(t["track_id"] == "test123" for t in tracks)
        if not found:
            print("❌ Track not found after adding")
            return False
        
        # Test mashup operations
        test_track2 = {
            "track_id": "test456",
            "title": "Test Song 2",
            "artist": "Test Artist 2",
            "bpm": 125.0,
            "key_int": 1,
            "mode_int": 1,
            "energy": 0.7,
            "camelot": "3B",
            "url": "https://open.spotify.com/track/test456",
            "source": "test",
            "tags": "test"
        }
        db_add_track(test_track2)
        
        # Add mashup
        db_add_mashup("test123", "test456", 0.85, "Test compatibility")
        
        # List mashups
        mashups = db_list_mashups()
        found_mashup = any(m["left_id"] == "test123" and m["right_id"] == "test456" for m in mashups)
        if not found_mashup:
            print("❌ Mashup not found after adding")
            return False
        
        print("✅ Database operations work correctly")
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
        test_database
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
