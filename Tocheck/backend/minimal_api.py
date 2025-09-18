#!/usr/bin/env python3
"""
Minimal Backend for Emergency Fix
Provides basic endpoints for Agentic RAG and Agent Creation
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
import os
import sqlite3
from datetime import datetime
import uuid

app = FastAPI(title="Emergency Backend", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
def init_db():
    conn = sqlite3.connect('agents.db')
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            role TEXT,
            model TEXT,
            temperature REAL,
            max_tokens INTEGER,
            personality TEXT,
            capabilities TEXT,
            guardrails TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "Emergency backend is running",
        "timestamp": datetime.utcnow().isoformat(),
        "port": 5052
    }

@app.get("/status")
async def get_status():
    return {
        "status": "success",
        "message": "Backend is running smoothly",
        "port": 5052,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/agents")
async def create_agent(agent_data: dict):
    try:
        agent_id = str(uuid.uuid4())
        
        conn = sqlite3.connect('agents.db')
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO agents (id, name, role, model, temperature, max_tokens, personality, capabilities, guardrails)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            agent_id,
            agent_data.get('name', 'Unnamed Agent'),
            agent_data.get('role', 'Assistant'),
            agent_data.get('model', 'llama3.2:latest'),
            agent_data.get('temperature', 0.7),
            agent_data.get('maxTokens', 1000),
            agent_data.get('personality', ''),
            json.dumps(agent_data.get('capabilities', [])),
            json.dumps(agent_data.get('guardrails', []))
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "status": "success",
            "message": "Agent created successfully",
            "agent": {
                "id": agent_id,
                "name": agent_data.get('name'),
                "role": agent_data.get('role'),
                "model": agent_data.get('model')
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create agent: {str(e)}")

@app.get("/agents")
async def get_agents():
    try:
        conn = sqlite3.connect('agents.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM agents ORDER BY created_at DESC')
        rows = cursor.fetchall()
        conn.close()
        
        agents = []
        for row in rows:
            agents.append({
                "id": row[0],
                "name": row[1],
                "role": row[2],
                "model": row[3],
                "temperature": row[4],
                "max_tokens": row[5],
                "personality": row[6],
                "capabilities": json.loads(row[7]) if row[7] else [],
                "guardrails": json.loads(row[8]) if row[8] else [],
                "created_at": row[9]
            })
        
        return {
            "status": "success",
            "agents": agents,
            "count": len(agents)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get agents: {str(e)}")

@app.post("/rag/ingest")
async def ingest_document(file: UploadFile = File(...)):
    return {
        "status": "success",
        "message": "Document ingested successfully (mock)",
        "filename": file.filename,
        "chunks": 10,
        "document_id": str(uuid.uuid4())
    }

@app.post("/rag/query")
async def query_documents(query_data: dict):
    return {
        "status": "success",
        "response": "This is a mock response for RAG query: " + query_data.get('query', ''),
        "sources": [],
        "confidence": 0.8
    }

@app.get("/rag/documents")
async def list_documents():
    return {
        "status": "success",
        "documents": [],
        "count": 0
    }

@app.get("/ollama/models")
async def get_ollama_models():
    return {
        "status": "success",
        "models": [
            "llama3.2:latest",
            "llama3.2:1b", 
            "phi3:latest",
            "mistral:latest",
            "qwen2.5:latest"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5052, log_level="info")
