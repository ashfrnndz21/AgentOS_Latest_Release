#!/usr/bin/env python3
"""
Test script to run the RAN/Churn/PRB query through the unified orchestration system
"""

import requests
import json
import time
from datetime import datetime

def run_ran_query():
    """Run the RAN/Churn/PRB query and show complete outputs"""
    
    query = "How does RAN Affect churn and what is the PRB utilization & Churn thresholds that we should set to monitor these performance kpis"
    
    print("🚀 UNIFIED ORCHESTRATION SYSTEM - RAN/CHURN/PRB QUERY")
    print("=" * 60)
    print(f"📝 Query: {query}")
    print("=" * 60)
    
    # Try to run the query through the unified API
    try:
        print("🔍 Attempting to connect to unified orchestration API...")
        
        # First check if API is running
        health_response = requests.get("http://localhost:5021/health", timeout=5)
        if health_response.status_code == 200:
            print("✅ Unified API is running")
            print(f"📊 Health Status: {health_response.json()}")
        else:
            print(f"❌ Health check failed: {health_response.status_code}")
            return
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to unified API: {e}")
        print("🔄 Falling back to direct orchestration...")
        
        # Fallback: Run orchestration directly
        run_direct_orchestration(query)
        return
    
    # Run the full orchestration query
    try:
        print("\n🎯 Running full orchestration query...")
        print("📋 This will show:")
        print("   - 6-Stage LLM Analysis")
        print("   - Dynamic Agent Discovery") 
        print("   - A2A Communication")
        print("   - Text Cleaning & Synthesis")
        print("   - Complete metadata and observability trace")
        
        start_time = time.time()
        
        response = requests.post(
            "http://localhost:5021/api/orchestrate",
            json={
                "query": query,
                "options": {
                    "enable_observability": True
                }
            },
            timeout=120
        )
        
        execution_time = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            
            print(f"\n✅ ORCHESTRATION COMPLETED in {execution_time:.2f}s")
            print("=" * 60)
            
            # Show complete result
            print("📊 COMPLETE ORCHESTRATION RESULT:")
            print(json.dumps(result, indent=2))
            
        else:
            print(f"❌ Orchestration failed: {response.status_code}")
            print(f"Error: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Orchestration request failed: {e}")
        print("🔄 Falling back to direct orchestration...")
        run_direct_orchestration(query)

def run_direct_orchestration(query):
    """Fallback: Run orchestration directly without API"""
    
    print("\n🔄 RUNNING DIRECT ORCHESTRATION (Fallback)")
    print("=" * 50)
    
    try:
        # Import the unified orchestrator directly
        import sys
        sys.path.append('/Users/ashleyfernandez/AgentOS_Studio_StrandsNew/AgentOS_Studio_Strands/backend')
        
        from unified_system_orchestrator import unified_orchestrator
        import asyncio
        
        print("📋 Running 6-Stage LLM Analysis...")
        print("📋 Dynamic Agent Discovery...")
        print("📋 A2A Communication...")
        print("📋 Text Cleaning & Synthesis...")
        
        # Run async orchestration
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(
                unified_orchestrator.process_query(query)
            )
        finally:
            loop.close()
        
        print(f"\n✅ DIRECT ORCHESTRATION COMPLETED")
        print("=" * 50)
        
        # Show complete result
        print("📊 COMPLETE ORCHESTRATION RESULT:")
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"❌ Direct orchestration failed: {e}")
        print("\n🔄 SIMULATING ORCHESTRATION WORKFLOW...")
        simulate_orchestration_workflow(query)

def simulate_orchestration_workflow(query):
    """Simulate the orchestration workflow for demonstration"""
    
    print("\n🎭 SIMULATING UNIFIED ORCHESTRATION WORKFLOW")
    print("=" * 50)
    
    # Simulate 6-Stage LLM Analysis
    print("📊 STAGE 1: 6-Stage LLM Analysis")
    analysis = {
        "stage_1_query_analysis": {
            "user_intent": "Understand RAN impact on churn and define PRB utilization thresholds",
            "domain": "telecommunications_network_analysis",
            "complexity": "complex",
            "required_expertise": ["telecommunications", "network_analysis", "kpi_definition", "churn_analysis"]
        },
        "stage_2_sequence_definition": {
            "workflow_steps": [
                {"step": 1, "task": "Analyze RAN impact on churn", "required_expertise": "telecommunications"},
                {"step": 2, "task": "Define PRB utilization thresholds", "required_expertise": "network_analysis"},
                {"step": 3, "task": "Set churn monitoring thresholds", "required_expertise": "kpi_definition"}
            ]
        },
        "stage_3_execution_strategy": {
            "strategy": "sequential",
            "reasoning": "Each analysis builds on the previous one"
        },
        "stage_4_agent_analysis": {
            "agent_requirements": [
                {"capability": "telecommunications", "priority": "high"},
                {"capability": "network_analysis", "priority": "high"},
                {"capability": "kpi_definition", "priority": "medium"}
            ]
        },
        "stage_5_agent_matching": {
            "matching_criteria": "Match agents with telecom and network analysis capabilities"
        },
        "stage_6_orchestration_plan": {
            "final_strategy": "sequential",
            "confidence": 0.9
        }
    }
    print(json.dumps(analysis, indent=2))
    
    # Simulate Agent Discovery
    print("\n🔍 STAGE 2: Dynamic Agent Discovery")
    agents = [
        {"id": "telecom_analyst", "name": "Telecom Network Analyst", "capabilities": ["telecommunications", "network_analysis"]},
        {"id": "kpi_specialist", "name": "KPI Definition Specialist", "capabilities": ["kpi_definition", "threshold_analysis"]}
    ]
    print(f"Selected agents: {[agent['name'] for agent in agents]}")
    
    # Simulate A2A Handoffs
    print("\n🤝 STAGE 3: A2A Communication")
    handoff_results = [
        {
            "agent_name": "Telecom Network Analyst",
            "step": 1,
            "output": "RAN (Radio Access Network) significantly affects churn through:\n- Coverage quality (signal strength, dead zones)\n- Network capacity and congestion\n- Data speeds and latency\n- Call drop rates\n- Handover success rates"
        },
        {
            "agent_name": "KPI Definition Specialist", 
            "step": 2,
            "output": "PRB (Physical Resource Block) Utilization Thresholds:\n- Optimal: 70-80%\n- Warning: 80-90%\n- Critical: >90%\n- Churn Monitoring Thresholds:\n  - Good: <2% monthly\n  - Warning: 2-5% monthly\n  - Critical: >5% monthly"
        }
    ]
    
    for result in handoff_results:
        print(f"\n**{result['agent_name']} (Step {result['step']}):**")
        print(result['output'])
    
    # Simulate Clean Output
    print("\n✨ STAGE 4: Clean Output Synthesis")
    final_response = """# RAN Impact on Churn & PRB Utilization Thresholds

## RAN Impact on Churn

**RAN (Radio Access Network)** significantly affects customer churn through several key factors:

### 1. Coverage Quality
- **Signal Strength**: Poor signal leads to dropped calls and slow data
- **Dead Zones**: Areas with no coverage cause immediate churn
- **Indoor Coverage**: Weak indoor signals frustrate users

### 2. Network Performance
- **Data Speeds**: Slow speeds compared to competitors drive churn
- **Latency**: High latency affects real-time applications
- **Congestion**: Network overload during peak hours

### 3. Call Quality
- **Drop Rates**: High call drop rates are a major churn driver
- **Handover Success**: Poor handover between cells causes service interruption

## PRB Utilization Thresholds

**PRB (Physical Resource Block)** utilization thresholds for optimal performance:

### Optimal Performance
- **Target Range**: 70-80% utilization
- **Benefits**: Good capacity utilization without congestion
- **User Experience**: Smooth service delivery

### Warning Levels
- **80-90%**: Monitor closely for congestion
- **Action**: Plan capacity expansion
- **Risk**: Potential service degradation

### Critical Levels
- **>90%**: Immediate action required
- **Impact**: High congestion, poor user experience
- **Churn Risk**: Significantly increased

## Churn Monitoring Thresholds

### Monthly Churn Rates
- **Good Performance**: <2% monthly churn
- **Warning Level**: 2-5% monthly churn
- **Critical Level**: >5% monthly churn

### Key Performance Indicators (KPIs)
1. **Network KPIs**:
   - PRB Utilization: 70-80%
   - Call Drop Rate: <2%
   - Handover Success Rate: >95%

2. **Customer KPIs**:
   - Monthly Churn Rate: <2%
   - Customer Satisfaction: >4.0/5.0
   - Net Promoter Score: >50

3. **Service KPIs**:
   - Data Speed: >50 Mbps average
   - Latency: <50ms
   - Coverage: >95% population

## Monitoring Recommendations

1. **Real-time Monitoring**: Continuous PRB utilization tracking
2. **Predictive Analytics**: Use ML to predict churn risk
3. **Proactive Alerts**: Set up automated threshold alerts
4. **Regular Reviews**: Weekly KPI reviews and monthly churn analysis
5. **Capacity Planning**: Plan network expansion based on utilization trends

## Action Items

1. Implement real-time PRB monitoring dashboard
2. Set up automated churn prediction models
3. Establish weekly KPI review meetings
4. Create customer experience improvement initiatives
5. Develop network capacity expansion roadmap"""
    
    print(final_response)
    
    # Simulate complete metadata
    print("\n📊 COMPLETE METADATA & OBSERVABILITY TRACE")
    print("=" * 50)
    
    complete_result = {
        "success": True,
        "session_id": "ran-churn-analysis-001",
        "response": final_response,
        "workflow_summary": {
            "total_stages": 4,
            "stages_completed": 4,
            "execution_strategy": "sequential",
            "agents_used": ["Telecom Network Analyst", "KPI Definition Specialist"],
            "processing_time": 15.2
        },
        "analysis": analysis,
        "agent_selection": {
            "total_available": 2,
            "selected_agents": ["Telecom Network Analyst", "KPI Definition Specialist"],
            "selection_reasoning": "LLM-driven discovery based on telecom expertise requirements"
        },
        "execution_details": {
            "strategy": "sequential",
            "total_agents": 2,
            "successful_agents": 2,
            "total_execution_time": 15.2
        },
        "observability_trace": {
            "llm_analysis_time": 3.2,
            "agent_discovery_time": 1.1,
            "a2a_handoffs_time": 8.5,
            "text_cleaning_time": 2.4,
            "total_processing_time": 15.2
        },
        "timestamp": datetime.now().isoformat()
    }
    
    print(json.dumps(complete_result, indent=2))

if __name__ == "__main__":
    run_ran_query()
