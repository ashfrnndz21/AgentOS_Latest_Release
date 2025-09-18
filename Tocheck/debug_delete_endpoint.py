#!/usr/bin/env python3
"""
Debug the delete endpoint to see what's happening
"""

import requests
import json

def debug_delete_endpoint():
    """Debug the delete endpoint"""
    
    print("🔍 Debugging Delete Endpoint...")
    
    # Test with a known predefined agent ID
    agent_id = "legal-analyst"
    
    print(f"\n1. Testing DELETE /api/document-agents/{agent_id}")
    
    try:
        response = requests.delete(f"http://localhost:8000/api/document-agents/{agent_id}")
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Success Response: {json.dumps(result, indent=2)}")
        else:
            print(f"Error Response:")
            try:
                error = response.json()
                print(f"  JSON: {json.dumps(error, indent=2)}")
            except:
                print(f"  Text: {response.text}")
        
    except Exception as e:
        print(f"Request failed: {e}")
    
    # Also test if the endpoint exists
    print(f"\n2. Testing if endpoint exists with OPTIONS request...")
    try:
        response = requests.options(f"http://localhost:8000/api/document-agents/{agent_id}")
        print(f"OPTIONS Status: {response.status_code}")
        print(f"Allowed Methods: {response.headers.get('Allow', 'Not specified')}")
    except Exception as e:
        print(f"OPTIONS request failed: {e}")

def main():
    print("🔧 Delete Endpoint Debug Tool")
    print("=" * 40)
    
    debug_delete_endpoint()
    
    print("\n" + "=" * 40)
    print("🔍 Debug complete!")

if __name__ == "__main__":
    main()