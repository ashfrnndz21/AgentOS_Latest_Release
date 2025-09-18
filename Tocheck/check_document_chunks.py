#!/usr/bin/env python3
"""
Check document chunking details from the RAG system
"""

import requests
import json

def check_document_chunks():
    """Check how many chunks were created from uploaded documents"""
    try:
        # Get document list
        response = requests.get("http://localhost:8000/api/rag/documents", timeout=5)
        
        if response.status_code == 200:
            documents = response.json()
            print("📄 Document Processing Details:")
            print("=" * 50)
            
            if documents:
                for doc in documents:
                    print(f"📋 Document: {doc.get('filename', 'Unknown')}")
                    print(f"   📊 Chunks: {doc.get('chunks_created', 'Unknown')}")
                    print(f"   📄 Pages: {doc.get('pages_processed', 'Unknown')}")
                    print(f"   🤖 Model: {doc.get('model_name', 'Unknown')}")
                    print(f"   📅 Ingested: {doc.get('ingested_at', 'Unknown')}")
                    print(f"   🗄️ Vector Store: {doc.get('vector_store_type', 'Unknown')}")
                    print(f"   🔗 Embeddings: {doc.get('embeddings_type', 'Unknown')}")
                    print("-" * 30)
            else:
                print("❌ No documents found in the system")
                
        else:
            print(f"❌ Failed to get documents: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error checking documents: {e}")

def check_vector_store_stats():
    """Check vector store statistics"""
    try:
        response = requests.get("http://localhost:8000/api/rag/stats", timeout=5)
        
        if response.status_code == 200:
            stats = response.json()
            print("\n📊 Vector Store Statistics:")
            print("=" * 50)
            print(f"Total Documents: {stats.get('total_documents', 'Unknown')}")
            print(f"Total Chunks: {stats.get('total_chunks', 'Unknown')}")
            print(f"Vector Store Size: {stats.get('vector_store_size', 'Unknown')}")
            print(f"Last Updated: {stats.get('last_updated', 'Unknown')}")
        else:
            print(f"❌ Failed to get stats: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error checking stats: {e}")

def test_query_with_chunks():
    """Test a query and see how many chunks are retrieved"""
    try:
        query_data = {
            "query": "What are Ashley's skills?",
            "document_ids": [],  # Empty means all documents
            "model_name": "mistral"
        }
        
        response = requests.post(
            "http://localhost:8000/api/rag/query",
            json=query_data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("\n🔍 Query Test Results:")
            print("=" * 50)
            print(f"Query: {query_data['query']}")
            print(f"Chunks Retrieved: {result.get('chunks_retrieved', 'Unknown')}")
            print(f"Sources: {len(result.get('sources', []))}")
            print(f"Response Length: {len(result.get('response', ''))}")
            
            if result.get('relevant_chunks'):
                print(f"Relevant Chunks: {len(result['relevant_chunks'])}")
                for i, chunk in enumerate(result['relevant_chunks'][:3]):  # Show first 3
                    print(f"  Chunk {i+1}: {chunk[:100]}...")
        else:
            print(f"❌ Query failed: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error testing query: {e}")

if __name__ == "__main__":
    print("🔍 RAG Document Chunk Analysis")
    print("=" * 60)
    
    check_document_chunks()
    check_vector_store_stats()
    test_query_with_chunks()