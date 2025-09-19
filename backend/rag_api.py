"""
Real RAG Service Backend for Document Processing and Chat
"""
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import asyncio
import aiohttp
from typing import Dict, Any, List, Optional
import logging
from pydantic import BaseModel
import hashlib
import time
from datetime import datetime
import sqlite3
import uuid
import tempfile
import shutil
import io
from PyPDF2 import PdfReader

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Real RAG API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DB_PATH = "rag_documents.db"

def init_database():
    """Initialize the RAG documents database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            content_hash TEXT NOT NULL,
            upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            processing_status TEXT DEFAULT 'pending',
            chunks_created INTEGER DEFAULT 0,
            pages_processed INTEGER DEFAULT 0,
            processing_time_ms INTEGER DEFAULT 0,
            error_message TEXT,
            model_used TEXT,
            content_preview TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS document_chunks (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL,
            chunk_index INTEGER NOT NULL,
            content TEXT NOT NULL,
            chunk_size INTEGER NOT NULL,
            embedding_model TEXT,
            FOREIGN KEY (document_id) REFERENCES documents (id)
        )
    """)
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_database()

class QueryRequest(BaseModel):
    query: str
    document_ids: Optional[List[str]] = None
    model_name: Optional[str] = "llama3.2"
    max_chunks: Optional[int] = 5

class ProcessingResult(BaseModel):
    success: bool
    document_id: str
    filename: str
    chunks_created: int
    pages_processed: int
    processing_time_ms: int
    file_size: int
    content_preview: str
    error: Optional[str] = None

OLLAMA_HOST = "http://localhost:11434"

@app.get("/")
async def root():
    return {"message": "Real RAG API", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "rag-api",
        "ollama_host": OLLAMA_HOST,
        "database": "connected"
    }

@app.get("/api/rag/status")
async def get_rag_status():
    """Get RAG system status and statistics"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Get document statistics
        cursor.execute("SELECT COUNT(*) FROM documents WHERE processing_status = 'completed'")
        total_documents = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM document_chunks")
        total_chunks = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM documents WHERE processing_status = 'processing'")
        processing_documents = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM documents WHERE processing_status = 'error'")
        error_documents = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(file_size) FROM documents WHERE processing_status = 'completed'")
        total_size = cursor.fetchone()[0] or 0
        
        conn.close()
        
        # Check Ollama status
        ollama_status = "unknown"
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{OLLAMA_HOST}/api/tags", timeout=5) as response:
                    if response.status == 200:
                        ollama_status = "running"
                    else:
                        ollama_status = "error"
        except:
            ollama_status = "not_running"
        
        return {
            "status": "running",
            "stats": {
                "total_documents": total_documents,
                "total_chunks": total_chunks,
                "processing_documents": processing_documents,
                "error_documents": error_documents,
                "total_size_bytes": total_size
            },
            "ollama_status": ollama_status,
            "database_path": DB_PATH
        }
    except Exception as e:
        logger.error(f"Error getting RAG status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get RAG status: {str(e)}")

@app.get("/api/rag/documents")
async def get_documents():
    """Get list of all processed documents"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, filename, file_type, file_size, upload_time, 
                   processing_status, chunks_created, pages_processed, 
                   processing_time_ms, error_message, model_used, content_preview
            FROM documents 
            ORDER BY upload_time DESC
        """)
        
        documents = []
        for row in cursor.fetchall():
            documents.append({
                "id": row[0],
                "filename": row[1],
                "file_type": row[2],
                "file_size": row[3],
                "upload_time": row[4],
                "processing_status": row[5],
                "chunks_created": row[6],
                "pages_processed": row[7],
                "processing_time_ms": row[8],
                "error_message": row[9],
                "model_used": row[10],
                "content_preview": row[11]
            })
        
        conn.close()
        return {"documents": documents}
    except Exception as e:
        logger.error(f"Error getting documents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get documents: {str(e)}")

@app.post("/api/rag/ingest")
async def ingest_document(
    file: UploadFile = File(...),
    model: Optional[str] = Form("llama3.2")
):
    """Process and ingest a document into the RAG system"""
    start_time = time.time()
    document_id = str(uuid.uuid4())
    
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        # Read file content
        content = await file.read()
        file_size = len(content)
        content_hash = hashlib.md5(content).hexdigest()
        
        # Create database entry
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO documents (id, filename, file_type, file_size, content_hash, 
                                 processing_status, model_used)
            VALUES (?, ?, ?, ?, ?, 'processing', ?)
        """, (document_id, file.filename, file.content_type or 'unknown', 
              file_size, content_hash, model))
        conn.commit()
        conn.close()
        
        # Process document based on type
        processing_result = await process_document_content(
            document_id, file.filename, content, file.content_type or '', model
        )
        
        processing_time = int((time.time() - start_time) * 1000)
        
        # Update database with results
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        if processing_result["success"]:
            cursor.execute("""
                UPDATE documents 
                SET processing_status = 'completed', 
                    chunks_created = ?, 
                    pages_processed = ?,
                    processing_time_ms = ?,
                    content_preview = ?
                WHERE id = ?
            """, (processing_result["chunks_created"], 
                  processing_result["pages_processed"],
                  processing_time,
                  processing_result["content_preview"],
                  document_id))
        else:
            cursor.execute("""
                UPDATE documents 
                SET processing_status = 'error', 
                    error_message = ?,
                    processing_time_ms = ?
                WHERE id = ?
            """, (processing_result["error"], processing_time, document_id))
        
        conn.commit()
        conn.close()
        
        return {
            "success": processing_result["success"],
            "document_id": document_id,
            "filename": file.filename,
            "chunks_created": processing_result["chunks_created"],
            "pages_processed": processing_result["pages_processed"],
            "processing_time_ms": processing_time,
            "file_size": file_size,
            "content_preview": processing_result["content_preview"],
            "error": processing_result.get("error")
        }
        
    except Exception as e:
        logger.error(f"Error ingesting document: {str(e)}")
        # Update database with error
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE documents 
                SET processing_status = 'error', 
                    error_message = ?,
                    processing_time_ms = ?
                WHERE id = ?
            """, (str(e), int((time.time() - start_time) * 1000), document_id))
            conn.commit()
            conn.close()
        except:
            pass
        
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

async def process_document_content(document_id: str, filename: str, content: bytes, content_type: str, model: str):
    """Process document content and create chunks"""
    try:
        # Extract text based on file type
        if content_type == "application/pdf" or filename.lower().endswith('.pdf'):
            text_content, pages_processed = await extract_pdf_text(content)
        elif content_type.startswith("text/") or filename.lower().endswith(('.txt', '.md')):
            text_content = content.decode('utf-8')
            pages_processed = 1
        else:
            # Try to decode as text
            try:
                text_content = content.decode('utf-8')
                pages_processed = 1
            except:
                raise Exception(f"Unsupported file type: {content_type}")
        
        # Create chunks
        chunks = create_text_chunks(text_content)
        
        # Store chunks in database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        for i, chunk in enumerate(chunks):
            chunk_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO document_chunks (id, document_id, chunk_index, content, chunk_size, embedding_model)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (chunk_id, document_id, i, chunk, len(chunk), model))
        
        conn.commit()
        conn.close()
        
        # Create content preview
        content_preview = text_content[:200] + "..." if len(text_content) > 200 else text_content
        
        return {
            "success": True,
            "chunks_created": len(chunks),
            "pages_processed": pages_processed,
            "content_preview": content_preview
        }
        
    except Exception as e:
        logger.error(f"Error processing document content: {str(e)}")
        return {
            "success": False,
            "chunks_created": 0,
            "pages_processed": 0,
            "content_preview": "",
            "error": str(e)
        }

async def extract_pdf_text(content: bytes):
    """Extract text from PDF content using PyPDF2"""
    try:
        # Create a BytesIO object from the PDF content
        pdf_buffer = io.BytesIO(content)
        
        # Read the PDF
        pdf_reader = PdfReader(pdf_buffer)
        
        # Extract text from all pages
        text_parts = []
        pages_processed = len(pdf_reader.pages)
        
        for page_num, page in enumerate(pdf_reader.pages):
            try:
                page_text = page.extract_text()
                if page_text.strip():  # Only add non-empty pages
                    text_parts.append(f"--- Page {page_num + 1} ---\n{page_text.strip()}")
            except Exception as e:
                logger.warning(f"Failed to extract text from page {page_num + 1}: {str(e)}")
                continue
        
        # Combine all text
        full_text = "\n\n".join(text_parts)
        
        if not full_text.strip():
            raise Exception("No text content could be extracted from the PDF")
        
        logger.info(f"Successfully extracted text from PDF: {pages_processed} pages, {len(full_text)} characters")
        
        return full_text, pages_processed
        
    except Exception as e:
        logger.error(f"Failed to extract PDF text: {str(e)}")
        raise Exception(f"Failed to extract PDF text: {str(e)}")

def create_text_chunks(text: str, chunk_size: int = 2000, overlap: int = 400):
    """Create overlapping text chunks"""
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        
        # Try to break at sentence boundaries
        if end < len(text):
            last_period = chunk.rfind('.')
            last_newline = chunk.rfind('\n')
            break_point = max(last_period, last_newline)
            
            if break_point > start + chunk_size // 2:
                chunk = text[start:start + break_point + 1]
                end = start + break_point + 1
        
        chunks.append(chunk.strip())
        start = end - overlap
        
        if start >= len(text):
            break
    
    return [chunk for chunk in chunks if chunk.strip()]

@app.post("/api/rag/query")
async def query_documents(request: QueryRequest):
    """Query documents using RAG"""
    try:
        # Get relevant chunks
        chunks = await retrieve_relevant_chunks(
            request.query, 
            request.document_ids, 
            request.max_chunks
        )
        
        if not chunks:
            return {
                "success": True,
                "response": "I couldn't find relevant information in your documents to answer this question.",
                "sources": [],
                "chunks_retrieved": 0,
                "chunks_available": 0,
                "context_length": 0
            }
        
        # Generate response using Ollama
        context = "\n\n".join([chunk["content"] for chunk in chunks])
        prompt = f"""Based on the following document excerpts, please answer the question: "{request.query}"

Document excerpts:
{context}

Please provide a comprehensive answer based on the information provided. If the information is insufficient, please say so."""
        
        response = await generate_ollama_response(request.model_name, prompt)
        
        # Get sources
        sources = list(set([chunk["filename"] for chunk in chunks]))
        
        # Get total available chunks
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM document_chunks")
        total_chunks = cursor.fetchone()[0]
        conn.close()
        
        return {
            "success": True,
            "response": response,
            "sources": sources,
            "chunks_retrieved": len(chunks),
            "chunks_available": total_chunks,
            "context_length": len(context)
        }
        
    except Exception as e:
        logger.error(f"Error querying documents: {str(e)}")
        return {
            "success": False,
            "response": f"Error processing query: {str(e)}",
            "sources": [],
            "chunks_retrieved": 0,
            "chunks_available": 0,
            "context_length": 0
        }

async def retrieve_relevant_chunks(query: str, document_ids: Optional[List[str]], max_chunks: int):
    """Retrieve relevant chunks for the query"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Build query
        if document_ids:
            placeholders = ','.join(['?' for _ in document_ids])
            sql = f"""
                SELECT dc.content, d.filename, dc.chunk_index
                FROM document_chunks dc
                JOIN documents d ON dc.document_id = d.id
                WHERE d.id IN ({placeholders}) AND d.processing_status = 'completed'
            """
            cursor.execute(sql, document_ids)
        else:
            cursor.execute("""
                SELECT dc.content, d.filename, dc.chunk_index
                FROM document_chunks dc
                JOIN documents d ON dc.document_id = d.id
                WHERE d.processing_status = 'completed'
            """)
        
        all_chunks = cursor.fetchall()
        conn.close()
        
        # Simple keyword-based relevance scoring
        query_words = query.lower().split()
        scored_chunks = []
        
        for content, filename, chunk_index in all_chunks:
            content_lower = content.lower()
            score = 0
            
            for word in query_words:
                if len(word) > 2:  # Skip very short words
                    score += content_lower.count(word)
            
            if score > 0:
                scored_chunks.append({
                    "content": content,
                    "filename": filename,
                    "chunk_index": chunk_index,
                    "score": score
                })
        
        # Sort by relevance and return top chunks
        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        return scored_chunks[:max_chunks]
        
    except Exception as e:
        logger.error(f"Error retrieving chunks: {str(e)}")
        return []

async def generate_ollama_response(model: str, prompt: str):
    """Generate response using Ollama"""
    try:
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{OLLAMA_HOST}/api/generate", json=payload, timeout=60) as response:
                if response.status == 200:
                    result = await response.json()
                    return result.get("response", "No response generated")
                else:
                    error_text = await response.text()
                    raise Exception(f"Ollama API error: {error_text}")
                    
    except asyncio.TimeoutError:
        return "Response generation timed out. Please try again."
    except Exception as e:
        logger.error(f"Error generating Ollama response: {str(e)}")
        return f"Error generating response: {str(e)}"

@app.delete("/api/rag/documents/{document_id}")
async def delete_document(document_id: str):
    """Delete a document and its chunks"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Delete chunks first
        cursor.execute("DELETE FROM document_chunks WHERE document_id = ?", (document_id,))
        
        # Delete document
        cursor.execute("DELETE FROM documents WHERE id = ?", (document_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Document not found")
        
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "Document deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")

@app.post("/api/rag/clear")
async def clear_all_documents():
    """Clear all documents and chunks"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM document_chunks")
        cursor.execute("DELETE FROM documents")
        
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "All documents cleared"}
        
    except Exception as e:
        logger.error(f"Error clearing documents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to clear documents: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5003)