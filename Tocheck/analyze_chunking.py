#!/usr/bin/env python3
"""
Analyze Document Chunking Process
Shows why a document creates a specific number of chunks
"""

import requests
import json

def analyze_chunking():
    print("🔍 Analyzing Document Chunking Process")
    print("=" * 60)
    
    # Get current document details
    print("1. Current Document Analysis:")
    try:
        response = requests.get("http://localhost:8000/api/rag/documents")
        if response.status_code == 200:
            docs = response.json()
            if docs.get('documents'):
                doc = docs['documents'][0]  # Get first document
                print(f"   📄 Filename: {doc.get('filename', 'N/A')}")
                print(f"   📊 Pages: {doc.get('pages_processed', 'N/A')}")
                print(f"   ✂️ Chunks: {doc.get('chunks_created', 'N/A')}")
                print(f"   📏 Chunk Size: {doc.get('chunk_size', 1024)} characters")
                print(f"   🔄 Chunk Overlap: {doc.get('chunk_overlap', 100)} characters")
                
                doc_id = doc.get('document_id')
            else:
                print("   ❌ No documents found")
                return
        else:
            print(f"   ❌ Error getting documents: {response.status_code}")
            return
    except Exception as e:
        print(f"   ❌ Exception: {e}")
        return
    
    print("\n2. Chunking Configuration:")
    print("   📏 Current Settings:")
    print("      - Chunk Size: 1024 characters")
    print("      - Chunk Overlap: 100 characters")
    print("      - Splitter: RecursiveCharacterTextSplitter")
    print("      - Strategy: Sentences → Words → Characters")
    
    print("\n3. Why Only 1 Chunk?")
    print("   Possible reasons:")
    print("   📄 Small Document: Content < 1024 characters")
    print("   📝 Single Page: Only 1 page with limited text")
    print("   🔤 Short Text: PDF has minimal extractable text")
    print("   📊 Resume Format: Compact layout fits in one chunk")
    
    print("\n4. Testing with Larger Document:")
    print("   Let me create a larger test document...")
    
    # Create a larger test document
    try:
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        
        # Create a multi-page PDF with more content
        c = canvas.Canvas("large_test_document.pdf", pagesize=letter)
        
        # Page 1
        c.drawString(100, 750, "LARGE TEST DOCUMENT FOR CHUNKING ANALYSIS")
        c.drawString(100, 720, "=" * 50)
        
        content_lines = [
            "This is a comprehensive test document designed to demonstrate",
            "the chunking process in our RAG (Retrieval-Augmented Generation) system.",
            "The document contains multiple sections with substantial content",
            "to ensure that the text splitter creates multiple chunks.",
            "",
            "SECTION 1: INTRODUCTION TO RAG SYSTEMS",
            "Retrieval-Augmented Generation (RAG) is a powerful technique that",
            "combines the strengths of pre-trained language models with external",
            "knowledge retrieval. This approach allows AI systems to access",
            "up-to-date information and domain-specific knowledge that may not",
            "have been present in their training data.",
            "",
            "The RAG process typically involves several key steps:",
            "1. Document ingestion and preprocessing",
            "2. Text chunking and segmentation", 
            "3. Vector embedding generation",
            "4. Storage in a vector database",
            "5. Similarity search during query time",
            "6. Context retrieval and response generation",
            "",
            "SECTION 2: TEXT CHUNKING STRATEGIES",
            "Text chunking is a critical component of RAG systems. The goal",
            "is to break down large documents into smaller, manageable pieces",
            "that can be effectively processed and retrieved. Common chunking",
            "strategies include:",
            "",
            "- Fixed-size chunking: Splits text into equal-sized segments",
            "- Sentence-based chunking: Preserves sentence boundaries",
            "- Paragraph-based chunking: Maintains paragraph structure",
            "- Semantic chunking: Uses meaning to determine boundaries",
            "- Recursive chunking: Hierarchical splitting approach"
        ]
        
        y_position = 680
        for line in content_lines:
            if y_position < 50:  # Start new page
                c.showPage()
                y_position = 750
            c.drawString(100, y_position, line)
            y_position -= 20
        
        # Page 2
        c.showPage()
        c.drawString(100, 750, "SECTION 3: VECTOR EMBEDDINGS AND SIMILARITY SEARCH")
        
        more_content = [
            "Vector embeddings are numerical representations of text that capture",
            "semantic meaning in high-dimensional space. These embeddings enable",
            "similarity search by measuring distances between vectors.",
            "",
            "Popular embedding models include:",
            "- OpenAI text-embedding-ada-002",
            "- Sentence Transformers",
            "- FastEmbed (used in our system)",
            "- Cohere embeddings",
            "- Google Universal Sentence Encoder",
            "",
            "The similarity search process involves:",
            "1. Converting the user query into an embedding vector",
            "2. Computing similarity scores with stored document chunks",
            "3. Ranking chunks by relevance score",
            "4. Selecting top-k most similar chunks",
            "5. Providing context to the language model",
            "",
            "SECTION 4: PERFORMANCE OPTIMIZATION",
            "To optimize RAG system performance, consider:",
            "- Chunk size optimization (typically 512-2048 characters)",
            "- Overlap configuration (10-20% of chunk size)",
            "- Embedding model selection",
            "- Vector database indexing",
            "- Retrieval parameter tuning",
            "",
            "This document should generate multiple chunks due to its length",
            "and comprehensive content covering various aspects of RAG systems.",
            "Each section provides detailed information that exceeds the",
            "standard chunk size limit of 1024 characters."
        ]
        
        y_position = 720
        for line in more_content:
            if y_position < 50:
                c.showPage()
                y_position = 750
            c.drawString(100, y_position, line)
            y_position -= 20
        
        c.save()
        print("   ✅ Created large_test_document.pdf")
        
        # Upload the larger document
        with open("large_test_document.pdf", "rb") as f:
            files = {'file': ('large_test_document.pdf', f, 'application/pdf')}
            data = {'model_name': 'phi3'}
            
            response = requests.post(
                "http://localhost:8000/api/rag/ingest",
                files=files,
                data=data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"   📤 Upload Status: {result.get('status', 'N/A')}")
                print(f"   📊 Pages Processed: {result.get('pages_processed', 'N/A')}")
                print(f"   ✂️ Chunks Created: {result.get('chunks_created', 'N/A')}")
                print(f"   🤖 Model Used: {result.get('model_name', 'N/A')}")
                
                if result.get('chunks_created', 0) > 1:
                    print(f"   🎉 SUCCESS: Created {result.get('chunks_created')} chunks!")
                    print("   📝 This demonstrates how larger documents create more chunks")
                else:
                    print("   🤔 Still only 1 chunk - document might need more content")
            else:
                print(f"   ❌ Upload failed: {response.status_code}")
                
    except ImportError:
        print("   ⚠️ reportlab not available, cannot create test document")
    except Exception as e:
        print(f"   ❌ Error creating test document: {e}")
    
    print("\n5. Current RAG System Status:")
    try:
        response = requests.get("http://localhost:8000/api/rag/status")
        if response.status_code == 200:
            status = response.json()
            stats = status.get('stats', {})
            print(f"   📊 Total Documents: {stats.get('total_documents', 0)}")
            print(f"   📊 Total Chunks: {stats.get('total_chunks', 0)}")
            print(f"   📊 Vector Stores: {stats.get('vector_stores', 0)}")
            print(f"   📊 Active Chains: {stats.get('active_chains', 0)}")
    except Exception as e:
        print(f"   ❌ Status check error: {e}")
    
    print("\n6. Chunk Size Recommendations:")
    print("   📏 For different document types:")
    print("      - Short documents (resumes): 512-1024 chars → 1-2 chunks")
    print("      - Medium documents (articles): 1024 chars → 3-10 chunks") 
    print("      - Long documents (reports): 1024 chars → 10+ chunks")
    print("      - Technical docs: 2048 chars → Fewer, larger chunks")
    
    print("\n7. How to Get More Chunks:")
    print("   📈 Strategies:")
    print("      - Use larger documents (multi-page PDFs)")
    print("      - Reduce chunk size (512 instead of 1024)")
    print("      - Upload technical documents with more text")
    print("      - Use documents with detailed content")

if __name__ == "__main__":
    analyze_chunking()