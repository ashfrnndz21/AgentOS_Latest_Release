#!/usr/bin/env python3
"""
Test script to debug 5-stage orchestrator directly
"""

import sys
import traceback

def test_5stage_orchestrator():
    """Test 5-stage orchestrator directly"""
    print("🧪 Testing 5-Stage Orchestrator")
    print("=" * 50)
    
    try:
        # Import the orchestrator
        from enhanced_orchestrator_5stage import Enhanced5StageOrchestrator
        print("✅ Successfully imported Enhanced5StageOrchestrator")
        
        # Initialize orchestrator
        orchestrator = Enhanced5StageOrchestrator()
        print("✅ Successfully initialized orchestrator")
        
        # Test with simple weather query
        print("🌤️ Testing with weather query...")
        result = orchestrator.analyze_query_with_5stage_orchestrator("weather")
        
        print("✅ Orchestrator completed successfully!")
        print(f"Success: {result.get('success', False)}")
        
        if 'analysis' in result:
            analysis = result['analysis']
            print(f"Stages completed: {len(analysis)}")
            
            # Check each stage
            for stage_key, stage_data in analysis.items():
                if isinstance(stage_data, dict):
                    status = stage_data.get('status', 'unknown')
                    print(f"  {stage_key}: {status}")
                else:
                    print(f"  {stage_key}: {type(stage_data)}")
        
        return result
        
    except Exception as e:
        print(f"❌ Error testing orchestrator: {e}")
        print("Full traceback:")
        traceback.print_exc()
        return None

if __name__ == "__main__":
    result = test_5stage_orchestrator()
    if result:
        print("\n🎉 Test completed successfully!")
    else:
        print("\n💥 Test failed!")
