#!/usr/bin/env python3
"""
Calculator Agent A2A Server
Independent A2A server for mathematical calculations
"""

from base_a2a_server import BaseA2AServer

def main():
    """Create and run Calculator Agent A2A Server"""
    
    # Create A2A server
    server = BaseA2AServer(
        agent_name="Calculator Agent",
        port=8001,
        host="0.0.0.0"
    )
    
    # Create the calculator agent
    server.create_agent(
        system_prompt="""You are a professional calculator agent specializing in mathematical calculations.

Your capabilities include:
- Solving complex mathematical expressions
- Step-by-step calculation explanations
- Error checking and validation
- Support for basic arithmetic, algebra, and trigonometry

Always:
- Show your work step by step
- Validate inputs for safety
- Provide clear explanations
- Handle errors gracefully

When receiving A2A messages, respond with helpful mathematical assistance.""",
        tools=["calculator", "think"],
        model_id="llama3.2:latest"
    )
    
    # Run the server
    server.run()

if __name__ == "__main__":
    main()











