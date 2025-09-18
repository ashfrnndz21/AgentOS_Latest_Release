# 🔍 Complete RAG Pipeline Monitoring Guide

## 📋 How to See Document Processing Details

When you upload a PDF to the frontend, here are **5 ways** to monitor the chunking, embedding, and metadata processing:

### 🖥️ **1. Frontend Real-Time Monitoring**

**In the Browser:**
1. Go to **Document Chat** page
2. Click **"Metadata & Chunks"** tab (new!)
3. Upload a document
4. Watch real-time processing logs
5. See detailed chunk breakdown

**What you'll see:**
- ✅ Document processing progress
- 📊 Number of chunks created
- 📄 Pages processed
- 🤖 Model used for processing
- ⏱️ Processing timestamps
- 🔍 Individual chunk content and metadata

### 📊 **2. Metadata Panel (New Feature)**

**Location:** Document Chat → Metadata & Chunks tab

**Shows:**
- **Overview Tab**: Total documents, chunks, vector stores
- **Documents Tab**: List of all processed documents with metadata
- **Chunks Tab**: Individual chunks with content preview

**Document Metadata Includes:**
```
📄 Filename: document.pdf
🔢 Chunks: 45 chunks created
📖 Pages: 12 pages processed  
🤖 Model: mistral
⏰ Processed: 2025-01-09 16:45:23
💾 Storage: ChromaDB + FastEmbed
📏 Size: 2.3 MB
```

**Chunk Details Include:**
```
✂️  Chunk 1 of 45
📍 Position: chars 0-1000
📄 Page: 1
📝 Content: "This document discusses..."
🧮 Vector: 384 dimensions
```

### 🖥️ **3. Backend Real-Time Monitor**

**Run this script while uploading:**
```bash
python watch_rag_processing.py
```

**Shows live processing:**
```
[16:45:23] 📄 NEW DOCUMENT DETECTED!
   Documents: 0 → 1
[16:45:24] ✂️  NEW CHUNKS CREATED: +45
   Total chunks: 0 → 45
   📋 Latest Document Details:
      - Filename: sample.pdf
      - Chunks: 45
      - Pages: 12
      - Model: mistral
      - Embeddings: fastembed
      - Vector DB: chroma
```

### 📊 **4. API Endpoints for Direct Inspection**

**Check RAG Status:**
```bash
curl http://localhost:8000/api/rag/status
```

**List All Documents:**
```bash
curl http://localhost:8000/api/rag/documents
```

**Get Document Chunks:**
```bash
curl http://localhost:8000/api/rag/documents/{document_id}/chunks
```

**Example Response:**
```json
{
  "status": "success",
  "document_id": "doc_abc123",
  "chunks": [
    {
      "chunk_id": "doc_abc123_chunk_0",
      "content": "This is the first chunk of text...",
      "metadata": {
        "document_id": "doc_abc123",
        "chunk_index": 0,
        "char_start": 0,
        "char_end": 1000,
        "page_number": 1
      }
    }
  ],
  "total_chunks": 45
}
```

### 🔍 **5. Backend Logs (Terminal)**

**Watch backend terminal for detailed logs:**
```
INFO:__main__:[INFO] 📄 Processing document: sample.pdf
INFO:__main__:[INFO] 📖 Extracted text from 12 pages
INFO:__main__:[INFO] ✂️  Created 45 chunks with 200 char overlap
INFO:__main__:[INFO] 🧮 Generated embeddings using FastEmbed
INFO:__main__:[INFO] 💾 Stored in ChromaDB vector database
INFO:__main__:[INFO] ✅ Document processing complete
```

## 🔬 **Detailed Processing Pipeline**

### **Step 1: Document Upload**
```
PDF File → Backend → Content Extraction
```
- File validation (type, size)
- PDF text extraction using PyPDF
- Content cleaning and preprocessing

### **Step 2: Text Chunking**
```
Raw Text → LangChain Splitter → Semantic Chunks
```
- **Chunk Size**: ~1000 characters
- **Overlap**: 200 characters between chunks
- **Smart Splitting**: Respects sentence boundaries
- **Metadata**: Position, page numbers, source info

### **Step 3: Embedding Generation**
```
Text Chunks → FastEmbed → 384D Vectors
```
- **Model**: BAAI/bge-small-en-v1.5
- **Dimensions**: 384 per chunk
- **Context**: 512 token limit
- **Speed**: ~100 chunks/second

### **Step 4: Vector Storage**
```
Embeddings → ChromaDB → Indexed Storage
```
- **Database**: ChromaDB (persistent)
- **Index**: Optimized for cosine similarity
- **Metadata**: Linked to original chunks
- **Search**: Sub-second retrieval

### **Step 5: Query Processing**
```
User Query → Embedding → Similarity Search → Top-K Chunks
```
- **Query Embedding**: Same 384D space
- **Search**: Cosine similarity ranking
- **Retrieval**: Top 3-5 most relevant chunks
- **Context**: Assembled for AI generation

## 🎯 **What to Look For**

### **Successful Processing Indicators:**
- ✅ Chunks created > 0
- ✅ Pages processed matches PDF pages
- ✅ Processing time < 30 seconds for typical docs
- ✅ No error messages in logs
- ✅ Vector store shows active

### **Chunking Quality Indicators:**
- 📏 Chunk sizes between 500-1500 characters
- 🔗 Meaningful overlap between chunks
- 📄 Page numbers correctly tracked
- 📝 Content preserves sentence structure

### **Performance Metrics:**
- ⚡ Processing: ~2-5 seconds per page
- 🧮 Embedding: ~100 chunks per second
- 💾 Storage: Immediate indexing
- 🔍 Retrieval: <100ms query response

## 🚀 **Try It Now!**

1. **Start monitoring:** `python watch_rag_processing.py`
2. **Open browser:** Go to Document Chat → Metadata & Chunks
3. **Upload PDF:** Drag and drop a document
4. **Watch processing:** See real-time chunking details
5. **Explore chunks:** Click on documents to see individual chunks
6. **Test queries:** Ask questions and see which chunks are retrieved

The system provides complete visibility into every step of the RAG pipeline! 🎉