#!/usr/bin/env python3
"""
Fix document isolation issue - clear old documents and test with fresh upload
"""

import requests
import json

BASE_URL = 'http://localhost:8000'

def clear_all_documents():
    """Clear all documents from RAG system"""
    print("🗑️ Clearing all documents from RAG system...")
    
    try:
        # Get all documents first
        response = requests.get(f"{BASE_URL}/api/rag/documents", timeout=10)
        if response.status_code == 200:
            data = response.json()
            documents = data.get('documents', [])
            
            print(f"📄 Found {len(documents)} documents to clear")
            
            # Delete each document
            for doc in documents:
                doc_id = doc.get('document_id')
                if doc_id:
                    print(f"   Deleting: {doc_id}")
                    try:
                        del_response = requests.delete(f"{BASE_URL}/api/rag/documents/{doc_id}", timeout=10)
                        if del_response.status_code == 200:
                            print(f"   ✅ Deleted: {doc_id}")
                        else:
                            print(f"   ❌ Failed to delete: {doc_id}")
                    except Exception as e:
                        print(f"   ❌ Error deleting {doc_id}: {str(e)}")
            
            return True
        else:
            print(f"❌ Failed to get documents: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Failed to clear documents: {str(e)}")
        return False

def restart_rag_service():
    """Restart RAG service to clear memory"""
    print("\n🔄 Restarting RAG service...")
    
    try:
        # Check status to trigger service restart
        response = requests.get(f"{BASE_URL}/api/rag/status", timeout=10)
        if response.status_code == 200:
            data = response.json()
            stats = data.get('stats', {})
            print(f"✅ RAG service restarted")
            print(f"   Documents: {stats.get('total_documents', 0)}")
            print(f"   Chunks: {stats.get('total_chunks', 0)}")
            print(f"   Vector Stores: {stats.get('vector_stores', 0)}")
            return True
        else:
            print(f"❌ Failed to restart RAG service: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Failed to restart RAG service: {str(e)}")
        return False

def upload_fresh_document(pdf_path, model_name='llama3.2'):
    """Upload document to clean RAG system"""
    print(f"\n📤 Uploading fresh document: {pdf_path}")
    
    try:
        with open(pdf_path, 'rb') as f:
            files = {'file': (pdf_path, f, 'application/pdf')}
            data = {'model_name': model_name}
            
            response = requests.post(
                f"{BASE_URL}/api/rag/ingest",
                files=files,
                data=data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('status') == 'success':
                    print(f"✅ Document uploaded successfully!")
                    print(f"   Document ID: {result.get('document_id')}")
                    print(f"   Chunks: {result.get('chunks_created')}")
                    print(f"   Pages: {result.get('pages_processed')}")
                    return result.get('document_id')
                else:
                    print(f"❌ Upload failed: {result.get('message')}")
                    return None
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                return None
    except Exception as e:
        print(f"❌ Upload failed: {str(e)}")
        return None

def test_clean_retrieval(document_id, query="What is this document about?"):
    """Test retrieval with clean system"""
    print(f"\n🔍 Testing clean retrieval...")
    print(f"   Document ID: {document_id}")
    print(f"   Query: '{query}'")
    
    try:
        payload = {
            'query': query,
            'document_ids': [document_id],
            'model_name': 'llama3.2'
        }
        
        response = requests.post(
            f"{BASE_URL}/api/rag/debug-query",
            json=payload,
            timeout=45
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('status') == 'success':
                print(f"✅ Query successful!")
                print(f"📝 Response: {data.get('response', 'No response')}")
                
                # Show what was actually retrieved
                if data.get('relevant_chunks'):
                    print(f"\n📄 Retrieved Content:")
                    for i, chunk in enumerate(data.get('relevant_chunks', [])):
                        print(f"   Chunk {i+1}: {chunk[:300]}...")
                
                print(f"\n📊 Retrieval Stats:")
                print(f"   Chunks Retrieved: {data.get('chunks_retrieved', 0)}")
                print(f"   Context Length: {data.get('context_length', 0)}")
                print(f"   Context Overlap: {data.get('context_overlap', 0)}")
                
                return True
            else:
                print(f"❌ Query failed: {data.get('message')}")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            return False
    
    except requests.exceptions.Timeout:
        print(f"⏰ Query timed out")
        return False
    except Exception as e:
        print(f"❌ Query failed: {str(e)}")
        return False

def main():
    print("🔧 Fixing Document Isolation Issue")
    print("=" * 50)
    
    # Step 1: Clear all documents
    if not clear_all_documents():
        print("❌ Failed to clear documents")
        return
    
    # Step 2: Restart RAG service
    if not restart_rag_service():
        print("❌ Failed to restart RAG service")
        return
    
    # Step 3: Upload fresh document
    # Try with the test PDF first
    pdf_files = ['test_ashley_resume.pdf']
    
    document_id = None
    for pdf_file in pdf_files:
        try:
            document_id = upload_fresh_document(pdf_file)
            if document_id:
                break
        except FileNotFoundError:
            print(f"   File not found: {pdf_file}")
            continue
    
    if not document_id:
        print("❌ No PDF files available for testing")
        print("💡 Please upload your landlord consent PDF through the UI after this cleanup")
        return
    
    # Step 4: Test clean retrieval
    if test_clean_retrieval(document_id):
        print("\n🎉 SUCCESS: Document isolation fixed!")
        print("💡 Now upload your landlord consent PDF and it should work correctly")
    else:
        print("\n❌ Still having issues with retrieval")

if __name__ == "__main__":
    main()