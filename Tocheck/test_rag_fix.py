#!/usr/bin/env python3
"""
Test the RAG fix to ensure context is properly passed to the LLM
"""

import requests
import json
import time

BACKEND_URL = "http://localhost:8000"

def test_rag_query_with_debug():
    """Test RAG query and check if context is being used"""
    print("🧪 Testing RAG Query with Debug...")
    
    # First, check if there are any documents available
    try:
        response = requests.get(f"{BACKEND_URL}/api/rag/status")
        if response.status_code == 200:
            data = response.json()
            print(f"📊 RAG Status: {data.get('stats', {})}")
            
            if data.get('stats', {}).get('total_documents', 0) == 0:
                print("⚠️ No documents available for testing")
                return False
        else:
            print(f"❌ Could not get RAG status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error checking RAG status: {e}")
        return False
    
    # Test query
    test_query = "What is this document about?"
    
    try:
        print(f"\n❓ Testing query: {test_query}")
        
        payload = {
            "query": test_query,
            "document_ids": [],  # Empty to use all available documents
            "model_name": "mistral"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/api/rag/query",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            print(f"✅ Query successful!")
            print(f"📝 Response: {result.get('response', 'No response')}")
            print(f"📊 Chunks retrieved: {result.get('chunks_retrieved', 0)}")
            print(f"📚 Sources: {result.get('sources', [])}")
            print(f"🔍 Context length: {result.get('context_length', 0)}")
            
            # Check if response indicates context was used
            response_text = result.get('response', '').lower()
            if 'no information' in response_text or 'context is empty' in response_text or 'not available' in response_text:
                print("⚠️ Response suggests context was not properly used")
                return False
            else:
                print("✅ Response appears to use document context")
                return True
                
        else:
            print(f"❌ Query failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Query error: {e}")
        return False

def main():
    """Run the RAG fix test"""
    print("🧪 Testing RAG Context Fix")
    print("=" * 40)
    
    success = test_rag_query_with_debug()
    
    if success:
        print("\n🎉 RAG context fix appears to be working!")
    else:
        print("\n❌ RAG context fix needs more work")
    
    print("=" * 40)

if __name__ == "__main__":
    main()