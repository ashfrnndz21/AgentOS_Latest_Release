#!/usr/bin/env python3
"""
Check document chunking and retrieval details
"""

import requests
import json

BASE_URL = 'http://localhost:8000'

def check_document_status():
    """Check detailed document status"""
    print("📋 Checking document status...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/rag/status", timeout=10)
        if response.status_code == 200:
            data = response.json()
            stats = data.get('stats', {})
            
            print(f"✅ RAG System Status:")
            print(f"   Total Documents: {stats.get('total_documents', 0)}")
            print(f"   Total Chunks: {stats.get('total_chunks', 0)}")
            print(f"   Vector Stores: {stats.get('vector_stores', 0)}")
            print(f"   Active Chains: {stats.get('active_chains', 0)}")
            
            return stats.get('total_documents', 0) > 0
        else:
            print(f"❌ Status check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Status check failed: {str(e)}")
        return False

def check_ingested_documents():
    """Check detailed document information"""
    print("\n📄 Checking ingested documents...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/rag/documents", timeout=10)
        if response.status_code == 200:
            data = response.json()
            documents = data.get('documents', [])
            
            print(f"✅ Found {len(documents)} documents:")
            
            for i, doc in enumerate(documents):
                print(f"\n   Document {i+1}:")
                print(f"     ID: {doc.get('document_id', 'Unknown')}")
                print(f"     File: {doc.get('file_path', 'Unknown')}")
                print(f"     Chunks: {doc.get('chunks_count', 0)}")
                print(f"     Pages: {doc.get('pages_count', 0)}")
                print(f"     Model: {doc.get('model_name', 'Unknown')}")
                print(f"     Ingested: {doc.get('ingested_at', 'Unknown')}")
                print(f"     Vector Store: {doc.get('vector_store_type', 'Unknown')}")
                print(f"     Embeddings: {doc.get('embeddings_type', 'Unknown')}")
            
            return documents
        else:
            print(f"❌ Document check failed: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Document check failed: {str(e)}")
        return []

def test_document_retrieval(document_id, query="What is this document about?"):
    """Test document retrieval with detailed logging"""
    print(f"\n🔍 Testing retrieval for document: {document_id}")
    print(f"   Query: '{query}'")
    
    try:
        # Use the debug endpoint for detailed information
        payload = {
            'query': query,
            'document_ids': [document_id],
            'model_name': 'llama3.2'  # Use faster model
        }
        
        response = requests.post(
            f"{BASE_URL}/api/rag/debug-query",
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            data = response.json()
            
            print(f"📥 Response Status: {data.get('status')}")
            
            if data.get('status') == 'success':
                print(f"✅ Query successful!")
                print(f"📝 Response: {data.get('response', 'No response')}")
                print(f"\n🔍 Retrieval Details:")
                print(f"   Chunks Retrieved: {data.get('chunks_retrieved', 0)}")
                print(f"   Context Length: {data.get('context_length', 0)} characters")
                print(f"   Context Overlap: {data.get('context_overlap', 0)} keywords")
                
                # Show retrieved chunks
                if data.get('relevant_chunks'):
                    print(f"\n📄 Retrieved Chunks:")
                    for i, chunk in enumerate(data.get('relevant_chunks', [])):
                        print(f"   Chunk {i+1}: {chunk[:200]}...")
                        if len(chunk) > 200:
                            print(f"              ... (total length: {len(chunk)} chars)")
                
                # Show debug info
                debug_info = data.get('debug_info', {})
                if debug_info:
                    print(f"\n🔧 Debug Information:")
                    print(f"   Available Documents: {debug_info.get('available_documents', [])}")
                    print(f"   Vector Stores: {debug_info.get('vector_stores_count', 0)}")
                    print(f"   Retrievers: {debug_info.get('retrievers_count', 0)}")
                    print(f"   Chains: {debug_info.get('chains_count', 0)}")
                    
                    if debug_info.get('context_preview'):
                        print(f"\n📋 Context Preview:")
                        print(f"   {debug_info['context_preview'][:300]}...")
                
                # Analysis
                print(f"\n📊 Analysis:")
                if data.get('chunks_retrieved', 0) == 0:
                    print(f"   ❌ No chunks retrieved - similarity search found no relevant content")
                elif data.get('context_length', 0) == 0:
                    print(f"   ❌ Empty context - chunks retrieved but no content passed to model")
                elif data.get('context_overlap', 0) < 3:
                    print(f"   ❌ Low context overlap - model not using document content")
                else:
                    print(f"   ✅ Good retrieval - model should be using document content")
                
                return True
            else:
                print(f"❌ Query failed: {data.get('message', 'Unknown error')}")
                if data.get('error'):
                    print(f"   Error: {data['error']}")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error details: {error_data}")
            except:
                print(f"   Raw response: {response.text[:200]}")
            return False
    
    except requests.exceptions.Timeout:
        print(f"⏰ Query timed out - Ollama may be slow")
        return False
    except Exception as e:
        print(f"❌ Query failed: {str(e)}")
        return False

def main():
    print("🔍 Document Chunking and Retrieval Analysis")
    print("=" * 60)
    
    # Check overall status
    if not check_document_status():
        print("❌ No documents in RAG system")
        return
    
    # Check document details
    documents = check_ingested_documents()
    if not documents:
        print("❌ No document details available")
        return
    
    # Test retrieval for each document
    for doc in documents:
        document_id = doc.get('document_id')
        if document_id:
            # Test with different queries
            queries = [
                "What is this document about?",
                "What are the main contents of this document?",
                "Summarize this document",
                "What names are mentioned in this document?"
            ]
            
            for query in queries:
                print("\n" + "=" * 60)
                success = test_document_retrieval(document_id, query)
                if success:
                    break  # If one query works, no need to test others
                print("Trying next query...")
    
    print("\n" + "=" * 60)
    print("🏁 Analysis Complete")

if __name__ == "__main__":
    main()