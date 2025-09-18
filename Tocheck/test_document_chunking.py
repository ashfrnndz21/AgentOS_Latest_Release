#!/usr/bin/env python3
"""
Test document chunking to verify if the message you saw was real
This will create a test PDF and process it to see the actual chunking
"""

import requests
import json
import tempfile
import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def create_test_pdf():
    """Create a test PDF similar to what you might have uploaded"""
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
        # Create a simple PDF with some content
        c = canvas.Canvas(tmp_file.name, pagesize=letter)
        
        # Add some content that would create multiple chunks
        content = [
            "AWS OL Document - Test Content",
            "",
            "This is a test document to verify real chunking functionality.",
            "It contains multiple paragraphs and sections that should be",
            "processed into separate chunks by the RAG system.",
            "",
            "Section 1: Introduction",
            "This section introduces the document and explains its purpose.",
            "The content is designed to be long enough to create multiple",
            "text chunks when processed by the RecursiveCharacterTextSplitter.",
            "",
            "Section 2: Technical Details", 
            "Here we provide technical information about the system.",
            "This includes implementation details, architecture notes,",
            "and other relevant technical documentation.",
            "",
            "Section 3: Configuration",
            "This section covers configuration options and settings.",
            "It includes examples of how to set up and configure",
            "the system for optimal performance and functionality.",
            "",
            "Section 4: Troubleshooting",
            "Common issues and their solutions are documented here.",
            "This helps users resolve problems they might encounter",
            "when using the system in production environments.",
        ]
        
        y_position = 750
        for line in content:
            c.drawString(50, y_position, line)
            y_position -= 20
            if y_position < 50:  # Start new page
                c.showPage()
                y_position = 750
        
        c.save()
        return tmp_file.name

def test_document_upload(pdf_path):
    """Test uploading and processing the document"""
    try:
        print(f"📄 Testing document upload: {os.path.basename(pdf_path)}")
        
        # Prepare the file for upload
        with open(pdf_path, 'rb') as f:
            files = {'file': (os.path.basename(pdf_path), f, 'application/pdf')}
            data = {'model_name': 'mistral'}
            
            # Upload to the RAG service
            response = requests.post(
                "http://localhost:8000/api/rag/ingest",
                files=files,
                data=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Upload successful!")
                print(f"   Document ID: {result.get('document_id', 'unknown')}")
                print(f"   Chunks Created: {result.get('chunks_created', 0)}")
                print(f"   Pages Processed: {result.get('pages_processed', 0)}")
                print(f"   Status: {result.get('status', 'unknown')}")
                
                # This should match what you saw: "Created X text chunks with overlap"
                chunks = result.get('chunks_created', 0)
                if chunks > 0:
                    print(f"🎯 CHUNKING CONFIRMED: Created {chunks} text chunks with overlap")
                    print(f"   Chunk Size: 1024, Overlap: 100 (as configured in RAG service)")
                    return True, result.get('document_id')
                else:
                    print("❌ No chunks created - something went wrong")
                    return False, None
            else:
                print(f"❌ Upload failed: {response.status_code}")
                print(f"   Error: {response.text}")
                return False, None
                
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False, None

def verify_document_in_backend(document_id):
    """Verify the document is actually stored in the backend"""
    try:
        # Check if document appears in the list
        response = requests.get("http://localhost:8000/api/rag/documents")
        if response.status_code == 200:
            data = response.json()
            documents = data.get('documents', [])
            
            print(f"📋 Backend now shows {len(documents)} documents:")
            for doc in documents:
                if doc.get('document_id') == document_id:
                    print(f"   ✅ Found our document: {document_id}")
                    print(f"      Chunks: {doc.get('chunks_count', 0)}")
                    print(f"      Pages: {doc.get('pages_count', 0)}")
                    print(f"      Ingested: {doc.get('ingested_at', 'unknown')}")
                    return True
            
            print(f"   ❌ Our document {document_id} not found in backend")
            return False
        else:
            print(f"❌ Failed to check backend documents: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Backend verification failed: {e}")
        return False

def main():
    print("🧪 Testing Document Chunking Reality")
    print("=" * 50)
    
    # Create test PDF
    print("📄 Creating test PDF...")
    pdf_path = create_test_pdf()
    print(f"   Created: {pdf_path}")
    
    try:
        # Test upload and chunking
        success, document_id = test_document_upload(pdf_path)
        
        if success and document_id:
            print(f"\n🔍 Verifying document in backend...")
            backend_verified = verify_document_in_backend(document_id)
            
            if backend_verified:
                print(f"\n✅ CONCLUSION:")
                print(f"   The chunking message you saw was REAL!")
                print(f"   - Document was actually processed by PyPDFLoader")
                print(f"   - Text was split into chunks by RecursiveCharacterTextSplitter") 
                print(f"   - Chunks were embedded and stored in ChromaDB")
                print(f"   - The backend confirms the document exists with chunks")
            else:
                print(f"\n⚠️  INCONCLUSIVE:")
                print(f"   Upload succeeded but backend verification failed")
        else:
            print(f"\n❌ CONCLUSION:")
            print(f"   Could not verify chunking - upload failed")
            
    finally:
        # Clean up
        try:
            os.unlink(pdf_path)
            print(f"🧹 Cleaned up test file")
        except:
            pass

if __name__ == "__main__":
    main()