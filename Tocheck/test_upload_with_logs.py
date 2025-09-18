#!/usr/bin/env python3
"""
Test document upload to verify processing logs are working
"""

import requests
import time
import json

def test_upload():
    """Test uploading a document and check for processing logs"""
    
    # Create a simple test PDF content (minimal PDF structure)
    pdf_content = b"""%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test document for RAG processing) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
300
%%EOF"""

    print("🧪 Testing document upload with processing logs...")
    
    # Check initial logs
    print("\n1. Checking initial processing logs...")
    response = requests.get("http://localhost:8000/api/processing-logs")
    if response.status_code == 200:
        initial_logs = response.json()
        print(f"   Initial logs: {initial_logs['total']} entries")
    else:
        print(f"   ❌ Failed to get initial logs: {response.status_code}")
        return False
    
    # Upload document
    print("\n2. Uploading test document...")
    files = {
        'file': ('test_offer_letter.pdf', pdf_content, 'application/pdf')
    }
    data = {
        'model_name': 'mistral'
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/rag/ingest",
            files=files,
            data=data,
            timeout=60
        )
        
        print(f"   Upload response: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Result: {json.dumps(result, indent=2)}")
        else:
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Upload failed: {e}")
        return False
    
    # Check logs after upload
    print("\n3. Checking processing logs after upload...")
    time.sleep(2)  # Give it a moment
    
    response = requests.get("http://localhost:8000/api/processing-logs")
    if response.status_code == 200:
        final_logs = response.json()
        print(f"   Final logs: {final_logs['total']} entries")
        
        if final_logs['total'] > initial_logs['total']:
            print("   ✅ New processing logs found!")
            for log in final_logs['logs']:
                print(f"      - [{log['stage'].upper()}] {log['message']}")
            return True
        else:
            print("   ❌ No new processing logs found")
            return False
    else:
        print(f"   ❌ Failed to get final logs: {response.status_code}")
        return False

if __name__ == "__main__":
    success = test_upload()
    if success:
        print("\n🎉 Processing logs are working correctly!")
    else:
        print("\n❌ Processing logs are not working as expected")