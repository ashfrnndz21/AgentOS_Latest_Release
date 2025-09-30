#!/usr/bin/env python3
"""
Test script to run PRB utilization query and show complete A2A handovers
"""

import requests
import json
from datetime import datetime

def run_prb_query():
    """Run the PRB utilization query and display complete output"""
    
    print("🚀 RUNNING PRB UTILIZATION QUERY")
    print("=" * 60)
    print(f"Query: What is PRB utilisation and how does it affect churn? What is the threshold for it?")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # API endpoint
    url = "http://localhost:5021/api/orchestrate"
    
    # Query payload
    payload = {
        "query": "What is PRB utilisation and how does it affect churn? What is the threshold for it?",
        "session_id": f"prb_query_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "user_context": {
            "domain": "telecommunications",
            "expertise_level": "intermediate",
            "request_type": "technical_explanation"
        }
    }
    
    try:
        print("\n📡 SENDING REQUEST TO UNIFIED ORCHESTRATION API...")
        print(f"URL: {url}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        # Send request
        response = requests.post(url, json=payload, timeout=300)
        
        print(f"\n📊 RESPONSE STATUS: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            print("\n✅ QUERY EXECUTED SUCCESSFULLY!")
            print("=" * 60)
            
            # Display session info
            print(f"Session ID: {data.get('session_id', 'N/A')}")
            print(f"Success: {data.get('success', False)}")
            print(f"Timestamp: {data.get('timestamp', 'N/A')}")
            
            # Display workflow summary
            workflow = data.get('workflow_summary', {})
            print(f"\n📋 WORKFLOW SUMMARY:")
            print(f"  • Total Stages: {workflow.get('total_stages', 'N/A')}")
            print(f"  • Stages Completed: {workflow.get('stages_completed', 'N/A')}")
            print(f"  • Execution Strategy: {workflow.get('execution_strategy', 'N/A')}")
            print(f"  • Agents Used: {workflow.get('agents_used', [])}")
            print(f"  • Processing Time: {workflow.get('processing_time', 'N/A')}s")
            
            # Display the final clean response
            print(f"\n🎯 FINAL CLEAN RESPONSE:")
            print("=" * 60)
            print(data.get('response', 'No response generated'))
            
            # Display complete data flow with A2A handovers
            complete_data_flow = data.get('complete_data_flow', {})
            
            if complete_data_flow:
                print(f"\n🔄 COMPLETE A2A DATA FLOW & HANDOVERS:")
                print("=" * 60)
                
                # Stage 1: Query Analysis
                stage1 = complete_data_flow.get('stage_1_analysis', {})
                if stage1:
                    print(f"\n📊 STAGE 1: QUERY ANALYSIS")
                    print("-" * 40)
                    print(f"Query Understanding: {stage1.get('query_understanding', {})}")
                    print(f"Domain Analysis: {stage1.get('domain_analysis', {})}")
                    print(f"Complexity Assessment: {stage1.get('complexity_assessment', {})}")
                
                # Stage 2: Sequence Definition
                stage2 = complete_data_flow.get('stage_2_analysis', {})
                if stage2:
                    print(f"\n🎯 STAGE 2: SEQUENCE DEFINITION")
                    print("-" * 40)
                    print(f"Workflow Planning: {stage2.get('workflow_planning', {})}")
                    print(f"Execution Flow: {stage2.get('execution_flow', {})}")
                    print(f"Handoff Points: {stage2.get('handoff_points', {})}")
                
                # Stage 3: Agent Selection
                stage3 = complete_data_flow.get('stage_3_analysis', {})
                if stage3:
                    print(f"\n🤖 STAGE 3: AGENT SELECTION")
                    print("-" * 40)
                    print(f"Available Agents: {stage3.get('available_agents', [])}")
                    print(f"Selected Agents: {stage3.get('selected_agents', [])}")
                    print(f"Selection Reasoning: {stage3.get('selection_reasoning', {})}")
                
                # A2A Handoffs
                a2a_handoffs = complete_data_flow.get('a2a_handoffs', {})
                if a2a_handoffs:
                    print(f"\n🤝 A2A HANDOFFS & CONTEXT EXCHANGES:")
                    print("-" * 40)
                    
                    handoff_details = a2a_handoffs.get('handoff_details', [])
                    for i, handoff in enumerate(handoff_details, 1):
                        print(f"\n  🔄 HANDOFF {i}: {handoff.get('handoff_type', 'Unknown')}")
                        print(f"     From: {handoff.get('from', 'Unknown')}")
                        print(f"     To: {handoff.get('to', 'Unknown')}")
                        print(f"     Status: {handoff.get('status', 'Unknown')}")
                        print(f"     Duration: {handoff.get('duration', 'Unknown')}s")
                        
                        # Show context sent
                        context_sent = handoff.get('context_sent', {})
                        if context_sent:
                            print(f"     📤 Context Sent:")
                            print(f"        Message: {context_sent.get('message', 'N/A')}")
                            print(f"        Input Type: {context_sent.get('input_type', 'N/A')}")
                            print(f"        Context Length: {context_sent.get('context_length', 'N/A')} chars")
                        
                        # Show agent output
                        agent_output = handoff.get('agent_output', {})
                        if agent_output:
                            print(f"     📥 Agent Output:")
                            print(f"        Raw Response: {agent_output.get('raw_response', 'N/A')[:200]}...")
                            print(f"        Clean Response: {agent_output.get('clean_response', 'N/A')[:200]}...")
                            print(f"        Response Length: {agent_output.get('response_length', 'N/A')} chars")
                            print(f"        Processing Time: {agent_output.get('processing_time', 'N/A')}s")
                        
                        # Show orchestrator processing
                        orchestrator_processing = handoff.get('orchestrator_processing', {})
                        if orchestrator_processing:
                            print(f"     🧠 Orchestrator Processing:")
                            print(f"        Processing Type: {orchestrator_processing.get('processing_type', 'N/A')}")
                            print(f"        Context Updates: {orchestrator_processing.get('context_updates', {})}")
                            print(f"        Processing Time: {orchestrator_processing.get('processing_time', 'N/A')}s")
                
                # Final synthesis
                final_synthesis = complete_data_flow.get('final_synthesis', {})
                if final_synthesis:
                    print(f"\n✨ FINAL SYNTHESIS:")
                    print("-" * 40)
                    synthesis_input = final_synthesis.get('input', {})
                    synthesis_output = final_synthesis.get('output', {})
                    
                    print(f"Raw Response Length: {synthesis_input.get('response_length', 'N/A')} chars")
                    print(f"Cleaned Response Length: {synthesis_output.get('cleaned_length', 'N/A')} chars")
                    print(f"Compression Ratio: {synthesis_output.get('compression_ratio', 'N/A'):.2%}")
                    print(f"Processing Notes: {final_synthesis.get('processing_notes', 'N/A')}")
            
            print(f"\n" + "=" * 60)
            print("🎯 QUERY COMPLETED SUCCESSFULLY!")
            print("=" * 60)
            
        else:
            print(f"\n❌ ERROR: HTTP {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error: {error_data.get('error', 'Unknown error')}")
            except:
                print(f"Response: {response.text}")
                
    except requests.exceptions.Timeout:
        print("\n⏰ TIMEOUT: Request took too long (>5 minutes)")
    except requests.exceptions.ConnectionError:
        print("\n🔌 CONNECTION ERROR: Cannot connect to orchestration API")
        print("Make sure the Working Orchestration API is running on port 5021")
    except Exception as e:
        print(f"\n💥 ERROR: {str(e)}")

if __name__ == "__main__":
    run_prb_query()
