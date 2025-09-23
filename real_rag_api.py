"""
Real RAG API using LangChain + ChromaDB + FastEmbed
Based on the proper RAG service implementation
"""
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import asyncio
import tempfile
import shutil
from typing import Dict, Any, List, Optional
import logging
from pydantic import BaseModel
import uuid
import time
from datetime import datetime

# Import the real RAG service
from rag_service import RealRAGService

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Real RAG API with LangChain", version="1.0.0")

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

# Initialize the real RAG service
try:
    rag_service = RealRAGService()
    logger.info("✅ Real RAG Service initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize Real RAG Service: {str(e)}")
    rag_service = None

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

@app.get("/")
async def root():
    return {"message": "Real RAG API with LangChain", "status": "running"}

@app.get("/health")
async def health_check():
    dependencies = rag_service.check_dependencies() if rag_service else {"langchain_available": False}
    
    return {
        "status": "healthy" if rag_service else "degraded",
        "service": "real-rag-api",
        "langchain_available": dependencies.get("langchain_available", False),
        "required_packages": dependencies.get("required_packages", []),
        "import_error": dependencies.get("import_error")
    }

@app.get("/api/rag/status")
async def get_rag_status():
    """Get RAG system status and statistics"""
    try:
        if not rag_service:
            return {
                "status": "error",
                "error": "RAG service not initialized",
                "message": "Please install required dependencies"
            }
        
        stats = rag_service.get_system_stats()
        dependencies = rag_service.check_dependencies()
        
        return {
            "status": "running",
            "stats": {
                "total_documents": stats["documents_count"],
                "total_chunks": stats["total_chunks"],
                "processing_documents": 0,  # Real-time processing not tracked in this implementation
                "error_documents": 0,
                "total_size_bytes": 0  # Not tracked in this implementation
            },
            "langchain_status": "available" if dependencies["langchain_available"] else "unavailable",
            "vector_database": "chromadb",
            "embeddings": "fastembed"
        }
    except Exception as e:
        logger.error(f"Error getting RAG status: {str(e)}")
        return {
            "status": "error",
            "error": str(e),
            "message": "Failed to get RAG status"
        }

@app.get("/api/rag/documents")
async def get_documents():
    """Get list of all processed documents"""
    try:
        if not rag_service:
            return {"documents": []}
        
        documents = rag_service.list_ingested_documents()
        
        # Convert to expected format
        formatted_docs = []
        for doc in documents:
            formatted_docs.append({
                "id": doc["document_id"],
                "filename": doc.get("file_path", "").split("/")[-1] if doc.get("file_path") else "unknown",
                "file_type": "application/pdf",  # Assuming PDF for now
                "file_size": 0,  # Not tracked in current implementation
                "upload_time": doc.get("ingested_at", datetime.utcnow().isoformat()),
                "processing_status": "completed",  # All documents in the service are completed
                "chunks_created": doc.get("chunks_count", 0),
                "pages_processed": doc.get("pages_count", 0),
                "processing_time_ms": 0,  # Not tracked in current implementation
                "error_message": None,
                "model_used": doc.get("model_name", "unknown"),
                "content_preview": f"Document with {doc.get('chunks_count', 0)} chunks"
            })
        
        return {"documents": formatted_docs}
    except Exception as e:
        logger.error(f"Error getting documents: {str(e)}")
        return {"documents": []}

@app.post("/api/rag/ingest")
async def ingest_document(
    file: UploadFile = File(...),
    model: Optional[str] = Form("llama3.2")
):
    """Process and ingest a document into the RAG system"""
    start_time = time.time()
    document_id = str(uuid.uuid4())
    
    try:
        if not rag_service:
            raise HTTPException(status_code=500, detail="RAG service not available. Please install required dependencies.")
        
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Read file content
        content = await file.read()
        file_size = len(content)
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Process with real RAG service
            def log_callback(level, stage, message, doc_id, filename, metadata=None):
                logger.info(f"[{level.upper()}] {stage}: {message}")
            
            result = await rag_service.ingest_document(
                file_path=temp_file_path,
                document_id=document_id,
                model_name=model,
                log_callback=log_callback
            )
            
            processing_time = int((time.time() - start_time) * 1000)
            
            if result["status"] == "success":
                return {
                    "success": True,
                    "document_id": document_id,
                    "filename": file.filename,
                    "chunks_created": result["chunks_created"],
                    "pages_processed": result["pages_processed"],
                    "processing_time_ms": processing_time,
                    "file_size": file_size,
                    "content_preview": f"PDF document with {result['chunks_created']} chunks processed using {result['vector_store']} and {result['embeddings']}",
                    "error": None
                }
            else:
                return {
                    "success": False,
                    "document_id": document_id,
                    "filename": file.filename,
                    "chunks_created": 0,
                    "pages_processed": 0,
                    "processing_time_ms": processing_time,
                    "file_size": file_size,
                    "content_preview": "",
                    "error": result["error"]
                }
                
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_file_path)
            except:
                pass
        
    except Exception as e:
        logger.error(f"Error ingesting document: {str(e)}")
        processing_time = int((time.time() - start_time) * 1000)
        
        return {
            "success": False,
            "document_id": document_id,
            "filename": file.filename if file.filename else "unknown",
            "chunks_created": 0,
            "pages_processed": 0,
            "processing_time_ms": processing_time,
            "file_size": len(content) if 'content' in locals() else 0,
            "content_preview": "",
            "error": str(e)
        }

@app.post("/api/rag/query")
async def query_documents(request: QueryRequest):
    """Query documents using RAG"""
    try:
        if not rag_service:
            return {
                "success": False,
                "response": "RAG service not available. Please install required dependencies.",
                "sources": [],
                "chunks_retrieved": 0,
                "chunks_available": 0,
                "context_length": 0
            }
        
        # Query using real RAG service
        result = await rag_service.query_documents(
            query=request.query,
            document_ids=request.document_ids or [],
            model_name=request.model_name
        )
        
        if result["status"] == "success":
            return {
                "success": True,
                "response": result["response"],
                "sources": result.get("sources", []),
                "chunks_retrieved": result.get("chunks_retrieved", 0),
                "chunks_available": result.get("chunks_available", 0),
                "context_length": result.get("context_length", 0)
            }
        else:
            return {
                "success": False,
                "response": result.get("message", "Query failed"),
                "sources": [],
                "chunks_retrieved": 0,
                "chunks_available": 0,
                "context_length": 0,
                "error": result.get("error")
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

@app.delete("/api/rag/documents/{document_id}")
async def delete_document(document_id: str):
    """Delete a document and its chunks"""
    try:
        if not rag_service:
            raise HTTPException(status_code=500, detail="RAG service not available")
        
        success = rag_service.clear_document(document_id)
        
        if success:
            return {"success": True, "message": "Document deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Document not found")
            
    except Exception as e:
        logger.error(f"Error deleting document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")

@app.post("/api/rag/clear")
async def clear_all_documents():
    """Clear all documents and chunks"""
    try:
        if not rag_service:
            raise HTTPException(status_code=500, detail="RAG service not available")
        
        count = rag_service.clear_all_documents()
        return {"success": True, "message": f"Cleared {count} documents"}
        
    except Exception as e:
        logger.error(f"Error clearing documents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to clear documents: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5003)