#!/usr/bin/env python3
"""
Quick test of the enhanced text cleaning service
"""

import requests
import json

def test_text_cleaning():
    """Test the text cleaning service"""
    
    # Test data
    test_data = {
        "text": "<think>I need to calculate 2x500202. Let me think about this step by step...</think> The result is 1,000,404. This is a mathematical calculation.",
        "output_type": "agent_response"
    }
    
    try:
        print("🧪 Testing Enhanced Text Cleaning Service...")
        print(f"📤 Input: {test_data['text']}")
        
        response = requests.post(
            "http://localhost:5019/api/clean-text",
            json=test_data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success!")
            print(f"📥 Output: {result['cleaned_text']}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_text_cleaning()
