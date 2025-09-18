#!/usr/bin/env python3
"""
Clean restart test - verify everything is working properly
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_clean_system():
    print("🔄 Testing Clean System Restart")
    print("=" * 40)
    
    # Test 1: Backend health
    print("1. Testing backend health...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("   ✅ Backend is healthy")
        else:
            print(f"   ❌ Backend health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Backend connection failed: {e}")
        return False
    
    # Test 2: Check documents (should be empty)
    print("\n2. Checking document count...")
    try:
        response = requests.get(f"{BASE_URL}/api/rag/documents", timeout=10)
        if response.status_code == 200:
            docs = response.json().get('documents', [])
            print(f"   📊 Documents in system: {len(docs)}")
            if len(docs) == 0:
                print("   ✅ Clean slate - no old documents")
            else:
                print("   ⚠️  Old documents still present:")
                for doc in docs:
                    print(f"      - {doc.get('document_id', 'Unknown')}")
        else:
            print(f"   ❌ Failed to check documents: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error checking documents: {e}")
    
    # Test 3: Upload fresh landlord document
    print("\n3. Uploading fresh landlord document...")
    try:
        with open("landlord_consent.pdf", 'rb') as f:
            files = {'file': ('landlord_consent.pdf', f, 'application/pdf')}
            response = requests.post(f"{BASE_URL}/api/rag/ingest", files=files, timeout=60)
        
        if response.status_code == 200:
            data = response.json()
            doc_id = data.get('document_id')
            print(f"   ✅ Document uploaded successfully")
            print(f"   📄 Document ID: {doc_id}")
            return doc_id
        else:
            print(f"   ❌ Upload failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"   ❌ Upload error: {e}")
        return None

def test_clean_query(doc_id):
    """Test a query with the clean document"""
    print("\n4. Testing clean query...")
    
    query = "Who is the landlord and what is the property address?"
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/rag/query",
            json={"query": query, "document_ids": [doc_id]},
            timeout=20
        )
        
        if response.status_code == 200:
            data = response.json()
            # Try different response field names
            answer = data.get('response', data.get('answer', 'No answer'))
            print(f"   🔍 Query: {query}")
            print(f"   📝 Answer: {answer}")
            
            # Check for correct content
            answer_lower = answer.lower()
            if 'john smith' in answer_lower and 'main street' in answer_lower:
                print("   ✅ CORRECT: Found expected landlord content")
                return True
            else:
                print("   ❌ PROBLEM: Expected content not found")
                print(f"   📝 Actual answer: {answer}")
                print(f"   🔍 Full response data: {data}")
                return False
        else:
            print(f"   ❌ Query failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Query error: {e}")
        return False

def main():
    doc_id = test_clean_system()
    
    if doc_id:
        time.sleep(3)  # Wait for processing
        success = test_clean_query(doc_id)
        
        print(f"\n🎯 Clean Restart Results:")
        if success:
            print("   ✅ System is working correctly!")
            print("   ✅ Document isolation is clean")
            print("   ✅ Queries return accurate content")
            print(f"\n🌐 Frontend should now work at: http://localhost:8080")
        else:
            print("   ❌ Issues detected - may need further debugging")
    else:
        print("\n❌ Failed to upload document - cannot test queries")

if __name__ == "__main__":
    main()