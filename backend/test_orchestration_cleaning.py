#!/usr/bin/env python3
"""
Test orchestration with text cleaning across all steps
"""

import requests
import json
import time

def test_orchestration_with_cleaning():
    """Test complete orchestration with text cleaning"""
    
    print("🧪 Testing Complete Orchestration with Text Cleaning")
    print("=" * 60)
    
    # Test query
    query = "Calculate 2x500202 and use the result to write a creative poem about numbers"
    
    print(f"📝 Query: {query}")
    print()
    
    # Step 1: Test text cleaning service directly
    print("🔧 Step 1: Testing Text Cleaning Service")
    print("-" * 40)
    
    # Simulate raw agent outputs that would come from orchestration
    raw_outputs = [
        {
            "agent": "Calculator Agent",
            "raw_output": "<think>I need to calculate 2 multiplied by 500,202. Let me break this down step by step. 2 × 500,202 = 1,000,404. That's the final answer.</think> The calculation result is 1,000,404.",
            "output_type": "agent_response"
        },
        {
            "agent": "Poetry Agent", 
            "raw_output": "<think>The user wants a poem about numbers using 1,000,404. I should create something creative and engaging about this large number. Let me think of some poetic imagery...</think> Here's a creative poem about the number 1,000,404:\n\nA Million and Four Hundred Four\n\nIn digits vast, a tale unfolds,\nOne million strong, four hundred bold,\nAnd four more friends in perfect row,\nA symphony of numbers flow.\n\nFrom zero's start to infinity's end,\nThis number stands, a faithful friend,\nIn calculations, big and small,\nIt answers when we give the call.",
            "output_type": "agent_response"
        },
        {
            "agent": "Orchestrator",
            "raw_output": "<think>I need to synthesize the calculator result with the poem. The calculation gave us 1,000,404 and the poetry agent created a beautiful poem about this number. I should present both results in a cohesive way.</think> Here's the complete response combining the mathematical calculation with creative poetry:\n\n**Mathematical Result:** 2 × 500,202 = 1,000,404\n\n**Creative Poem:**\nA Million and Four Hundred Four\n\nIn digits vast, a tale unfolds,\nOne million strong, four hundred bold,\nAnd four more friends in perfect row,\nA symphony of numbers flow.\n\nFrom zero's start to infinity's end,\nThis number stands, a faithful friend,\nIn calculations, big and small,\nIt answers when we give the call.",
            "output_type": "orchestrator_response"
        }
    ]
    
    cleaned_outputs = []
    
    for i, output in enumerate(raw_outputs, 1):
        print(f"🤖 Agent: {output['agent']}")
        print(f"📥 Raw Output: {output['raw_output'][:100]}...")
        
        # Clean the output
        try:
            response = requests.post(
                "http://localhost:5019/api/clean-text",
                json={
                    "text": output['raw_output'],
                    "output_type": output['output_type']
                },
                timeout=15
            )
            
            if response.status_code == 200:
                result = response.json()
                cleaned_text = result['cleaned_text']
                print(f"✅ Cleaned Output: {cleaned_text}")
                cleaned_outputs.append({
                    "agent": output['agent'],
                    "cleaned_output": cleaned_text
                })
            else:
                print(f"❌ Cleaning failed: {response.status_code}")
                cleaned_outputs.append({
                    "agent": output['agent'],
                    "cleaned_output": output['raw_output']  # Fallback
                })
                
        except Exception as e:
            print(f"❌ Error: {e}")
            cleaned_outputs.append({
                "agent": output['agent'],
                "cleaned_output": output['raw_output']  # Fallback
            })
        
        print()
        time.sleep(1)  # Small delay between requests
    
    # Step 2: Show the complete flow
    print("🔄 Step 2: Complete Orchestration Flow")
    print("-" * 40)
    
    print("📋 Original Query:")
    print(f"   {query}")
    print()
    
    print("🔄 Agent Handoff Sequence:")
    for i, output in enumerate(cleaned_outputs, 1):
        print(f"   Step {i}: {output['agent']}")
        print(f"   Input: {'Previous agent output' if i > 1 else 'Original query'}")
        print(f"   Output: {output['cleaned_output']}")
        print()
    
    # Step 3: Final synthesis
    print("🎯 Step 3: Final Synthesis")
    print("-" * 40)
    
    final_response = f"""**Complete Response:**

**Mathematical Calculation:**
{cleaned_outputs[0]['cleaned_output']}

**Creative Poetry:**
{cleaned_outputs[1]['cleaned_output']}

**Final Orchestrated Response:**
{cleaned_outputs[2]['cleaned_output']}"""
    
    print(final_response)
    
    print("\n✅ Test Complete!")
    print("=" * 60)

if __name__ == "__main__":
    test_orchestration_with_cleaning()
