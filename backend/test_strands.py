#!/usr/bin/env python3
"""
Test version of Strands SDK to debug startup issues
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import uuid
import json
from datetime import datetime

print("[Test] Starting test Strands SDK...")

app = Flask(__name__)
CORS(app)

print("[Test] Flask app created")

@app.route('/api/health', methods=['GET'])
def health_check():
    print("[Test] Health check called")
    return jsonify({
        "sdk_available": True,
        "sdk_type": "test-strands",
        "service": "strands-sdk-api",
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    })

print("[Test] Routes defined")

if __name__ == '__main__':
    print("[Test] Starting test server on port 5006...")
    try:
        app.run(
            host='0.0.0.0',
            port=5006,
            debug=False  # Disable debug to avoid issues
        )
    except Exception as e:
        print(f"[Test] Error starting server: {e}")
        import traceback
        traceback.print_exc()






