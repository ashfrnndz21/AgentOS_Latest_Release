#!/usr/bin/env python3
"""
Complete RAG Document Isolation Fix
Clears all documents and ensures proper document isolation
"""

import requests
import json
import time
import os
from pathlib import Path

BASE_URL = "http://localhost:8000"

def test_backend_connection():
    """Test if backend is running"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def clear_all_documents():
    """Clear all documents from the RAG system"""
    print("🗑️ Clearing all documents from RAG system...")
    try:
        response = requests.delete(f"{BASE_URL}/api/rag/documents", timeout=30)
        if response.status_code == 200:
            print("✅ Successfully cleared all documents")
            return True
        else:
            print(f"❌ Failed to clear documents: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error clearing documents: {e}")
        return False

def check_document_count():
    """Check how many documents are in the system"""
    try:
        response = requests.get(f"{BASE_URL}/api/rag/documents", timeout=10)
        if response.status_code == 200:
            data = response.json()
            count = len(data.get('documents', []))
            print(f"📊 Current document count: {count}")
            if count > 0:
                print("📋 Documents in system:")
                for i, doc in enumerate(data.get('documents', []), 1):
                    print(f"  {i}. {doc.get('filename', 'Unknown')} (ID: {doc.get('id', 'Unknown')})")
            return count
        else:
            print(f"❌ Failed to get document count: {response.status_code}")
            return -1
    except Exception as e:
        print(f"❌ Error checking documents: {e}")
        return -1

def upload_fresh_document(file_path):
    """Upload a fresh document to the RAG system"""
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    print(f"📤 Uploading fresh document: {file_path}")
    try:
        with open(file_path, 'rb') as f:
            files = {'file': (os.path.basename(file_path), f, 'application/pdf')}
            response = requests.post(f"{BASE_URL}/api/rag/ingest", files=files, timeout=60)
        
        if response.status_code == 200:
            print("✅ Document uploaded successfully")
            return True
        else:
            print(f"❌ Upload failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error uploading document: {e}")
        return False

def test_query(query="What is this document about?"):
    """Test a query to see what document content is returned"""
    print(f"🔍 Testing query: '{query}'")
    
    # First get the document IDs
    try:
        doc_response = requests.get(f"{BASE_URL}/api/rag/documents", timeout=10)
        if doc_response.status_code == 200:
            docs = doc_response.json().get('documents', [])
            if not docs:
                print("❌ No documents found to query")
                return False
            
            # Use all document IDs for the query
            doc_ids = [doc.get('id') for doc in docs if doc.get('id')]
            if not doc_ids:
                print("❌ No valid document IDs found")
                return False
            
            print(f"📋 Querying {len(doc_ids)} documents")
        else:
            print("❌ Failed to get document list")
            return False
    except Exception as e:
        print(f"❌ Error getting documents: {e}")
        return False
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/rag/query",
            json={"query": query, "document_ids": doc_ids},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            answer = data.get('answer', 'No answer')
            print(f"📝 Response: {answer[:200]}...")
            
            # Check if response mentions Ashley (wrong document)
            if 'ashley' in answer.lower() or 'resume' in answer.lower():
                print("⚠️  WARNING: Response contains Ashley/resume content - wrong document!")
                return False
            else:
                print("✅ Response seems to be from correct document")
                return True
        else:
            print(f"❌ Query failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing query: {e}")
        return False

def main():
    print("🔧 Complete RAG Document Isolation Fix")
    print("=" * 50)
    
    # Step 1: Check backend connection
    if not test_backend_connection():
        print("❌ Backend is not running. Please start it first.")
        return
    
    print("✅ Backend is running")
    
    # Step 2: Check current document count
    initial_count = check_document_count()
    
    # Step 3: Clear all documents if any exist
    if initial_count > 0:
        if clear_all_documents():
            time.sleep(2)  # Wait for clearing to complete
            final_count = check_document_count()
            if final_count == 0:
                print("✅ All documents successfully cleared")
            else:
                print(f"⚠️  Warning: {final_count} documents still remain")
        else:
            print("❌ Failed to clear documents. Manual intervention needed.")
            return
    else:
        print("✅ No documents to clear")
    
    # Step 4: Look for PDF files to upload
    # Prioritize landlord_consent.pdf if it exists
    preferred_pdf = "landlord_consent.pdf"
    if os.path.exists(preferred_pdf):
        pdf_to_upload = preferred_pdf
        print(f"📁 Found preferred PDF: {preferred_pdf}")
    else:
        pdf_files = list(Path('.').glob('*.pdf'))
        if pdf_files:
            pdf_to_upload = str(pdf_files[0])
            print(f"📁 Found {len(pdf_files)} PDF files, using: {pdf_to_upload}")
        else:
            pdf_to_upload = None
    
    if pdf_to_upload:
        # Upload the selected PDF
        if upload_fresh_document(pdf_to_upload):
            time.sleep(3)  # Wait for processing
            
            # Step 5: Verify upload
            new_count = check_document_count()
            if new_count == 1:
                print("✅ Document successfully uploaded and isolated")
                
                # Step 6: Test query
                test_query("What is this document about?")
            else:
                print(f"⚠️  Expected 1 document, found {new_count}")
        else:
            print("❌ Failed to upload document")
    else:
        print("📁 No PDF files found in current directory")
        print("💡 Please place a PDF file in the current directory and run again")
    
    print("\n🎯 Fix complete!")

if __name__ == "__main__":
    main()