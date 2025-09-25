import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime

app = Flask(__name__)

# Environment variables
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "*")
PREVIEW_SHARED_SECRET = os.getenv("PREVIEW_SHARED_SECRET")

# CORS configuration
CORS(app, resources={r"/api/*": {"origins": [FRONTEND_ORIGIN]}})

# Middleware to verify shared secret
@app.before_request
def verify_secret():
    if request.path.startswith("/api/"):
        secret = request.headers.get("x-ml-preview-secret")
        if not secret or secret != PREVIEW_SHARED_SECRET:
            return jsonify({"error": "unauthorized"}), 401

# Health check endpoint
@app.route("/healthz")
def healthz():
    return {"ok": True}

# Database connection helper
def get_db_connection():
    conn = sqlite3.connect('murphmixes.db')
    conn.row_factory = sqlite3.Row
    return conn

# Deezer search endpoint
@app.route("/api/deezer/search", methods=["POST"])
def deezer_search():
    try:
        data = request.get_json()
        query = data.get("query", "")
        
        # Mock Deezer search response for now
        # In production, this would call the actual Deezer API
        results = [
            {
                "id": f"deezer_{i}",
                "title": f"Track {i}",
                "artist": f"Artist {i}",
                "album": f"Album {i}",
                "cover_url": "https://via.placeholder.com/300x300/8A7CFF/FFFFFF",
                "preview_url": f"https://example.com/preview/{i}",
                "duration": 180
            }
            for i in range(1, 6)
        ]
        
        return jsonify({"results": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Track enrichment endpoint
@app.route("/api/meta/enrich/<track_id>", methods=["GET"])
def enrich_track(track_id):
    try:
        # Mock enrichment response
        return jsonify({
            "bpm": 128,
            "key": "C major",
            "confidence": 0.85,
            "source": "analysis_preview"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Genre enrichment endpoint
@app.route("/api/meta/genre/<track_id>", methods=["GET"])
def enrich_genre(track_id):
    try:
        # Mock genre response
        return jsonify({
            "genres": ["pop", "electronic"],
            "confidence": 0.75
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Mashups search endpoint
@app.route("/api/mashups/search", methods=["POST"])
def mashups_search():
    try:
        data = request.get_json()
        seed = data.get("seed")
        criteria = data.get("criteria", {})
        
        # Mock mashup results
        results = [
            {
                "id": f"mashup_{i}",
                "title": f"Mashup Track {i}",
                "artist": f"Mashup Artist {i}",
                "bpm": 130 + i,
                "key": "D major",
                "cover_url": "https://via.placeholder.com/300x300/8A7CFF/FFFFFF",
                "audio": {
                    "bpm": 130 + i,
                    "key": "D major"
                }
            }
            for i in range(1, 6)
        ]
        
        return jsonify({
            "results": results,
            "total": len(results)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# AI Co-Pilot endpoints
@app.route("/api/ai/plan", methods=["POST"])
def ai_plan():
    try:
        data = request.get_json()
        prompt = data.get("prompt", "")
        
        # Mock AI planning response
        brief = {
            "duration_min": 60,
            "audience": ["college"],
            "genres": ["hip-hop", "pop"],
            "eras": ["2020s"],
            "energy_curve": ["building"],
            "familiarity_bias": "medium",
            "explicit_ok": True,
            "must_include": [],
            "must_exclude": []
        }
        
        missing = ["audience", "genres", "energy_curve"]
        
        return jsonify({"brief": brief, "missing": missing})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/ai/clarify", methods=["POST"])
def ai_clarify():
    try:
        data = request.get_json()
        brief = data.get("brief", {})
        answer = data.get("answer", {})
        
        # Update brief with new answer
        updated_brief = { **brief, **answer }
        
        # Remove answered questions from missing
        missing = Object.keys(answer).filter(key => 
            not answer[key] or (isinstance(answer[key], list) and len(answer[key]) == 0)
        )
        
        return jsonify({"brief": updated_brief, "missing": missing})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/ai/setlist", methods=["POST"])
def ai_setlist():
    try:
        data = request.get_json()
        brief = data.get("brief", {})
        
        # Mock setlist generation
        items = [
            {
                "pos": 1,
                "id": "setlist-1",
                "title": "Blinding Lights",
                "artist": "The Weeknd",
                "bpm": 171,
                "keyCamelot": "8B",
                "duration_sec": 200,
                "source": "deezer",
                "transition": "Hard cut"
            },
            {
                "pos": 2,
                "id": "setlist-2",
                "title": "Levitating",
                "artist": "Dua Lipa",
                "bpm": 103,
                "keyCamelot": "5A",
                "duration_sec": 203,
                "source": "getsongbpm",
                "transition": "Beatmatch"
            },
            {
                "pos": 3,
                "id": "setlist-3",
                "title": "Good 4 U",
                "artist": "Olivia Rodrigo",
                "bpm": 166,
                "keyCamelot": "7A",
                "duration_sec": 178,
                "source": "analysis_preview",
                "transition": "Quick mix"
            }
        ]
        
        return jsonify({"items": items})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
