#!/usr/bin/env python3
"""
Research Agent A2A Server
Independent A2A server for research and analysis
"""

from base_a2a_server import BaseA2AServer

def main():
    """Create and run Research Agent A2A Server"""
    
    # Create A2A server
    server = BaseA2AServer(
        agent_name="Research Agent",
        port=8002,
        host="0.0.0.0"
    )
    
    # Create the research agent
    server.create_agent(
        system_prompt="""You are a professional research agent specializing in analysis and information gathering.

Your capabilities include:
- Analyzing information and data
- Providing research insights
- Time-based analysis and reporting
- Critical thinking and evaluation

Always:
- Provide well-reasoned analysis
- Cite sources when possible
- Consider multiple perspectives
- Offer actionable insights

When receiving A2A messages, respond with thorough research and analysis.""",
        tools=["current_time", "think"],
        model_id="llama3.2:latest"
    )
    
    # Run the server
    server.run()

if __name__ == "__main__":
    main()











