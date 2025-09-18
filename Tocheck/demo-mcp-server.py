#!/usr/bin/env python3
"""
Demo MCP Server for AgentRepo Platform
Run this to test the MCP integration locally
"""

from mcp.server.fastmcp import FastMCP
from starlette.responses import JSONResponse
import uvicorn
import asyncio
from typing import List

# Create MCP server instance
mcp = FastMCP(host="0.0.0.0", port=8000, stateless_http=True)

@mcp.tool()
def add_numbers(a: int, b: int) -> int:
    """Add two numbers together"""
    return a + b

@mcp.tool()
def multiply_numbers(a: int, b: int) -> int:
    """Multiply two numbers together"""
    return a * b

@mcp.tool()
def calculate_percentage(value: float, percentage: float) -> float:
    """Calculate percentage of a value"""
    return (value * percentage) / 100

@mcp.tool()
def greet_user(name: str) -> str:
    """Greet a user by name"""
    return f"Hello, {name}! Welcome to the AgentRepo MCP Demo!"

@mcp.tool()
def analyze_text(text: str) -> dict:
    """Analyze text and return statistics"""
    words = text.split()
    return {
        "word_count": len(words),
        "character_count": len(text),
        "sentence_count": text.count('.') + text.count('!') + text.count('?'),
        "average_word_length": sum(len(word) for word in words) / len(words) if words else 0
    }

@mcp.tool()
def convert_temperature(temperature: float, from_unit: str, to_unit: str) -> dict:
    """Convert temperature between Celsius, Fahrenheit, and Kelvin"""
    # Convert to Celsius first
    if from_unit.lower() == "fahrenheit":
        celsius = (temperature - 32) * 5/9
    elif from_unit.lower() == "kelvin":
        celsius = temperature - 273.15
    else:
        celsius = temperature
    
    # Convert from Celsius to target unit
    if to_unit.lower() == "fahrenheit":
        result = celsius * 9/5 + 32
    elif to_unit.lower() == "kelvin":
        result = celsius + 273.15
    else:
        result = celsius
    
    return {
        "original": f"{temperature}°{from_unit}",
        "converted": f"{result:.2f}°{to_unit}",
        "value": round(result, 2)
    }

@mcp.tool()
def calculate_loan_payment(principal: float, annual_rate: float, years: int) -> dict:
    """Calculate monthly loan payment using standard formula"""
    monthly_rate = annual_rate / 100 / 12
    num_payments = years * 12
    
    if monthly_rate == 0:
        monthly_payment = principal / num_payments
    else:
        monthly_payment = principal * (monthly_rate * (1 + monthly_rate)**num_payments) / ((1 + monthly_rate)**num_payments - 1)
    
    total_payment = monthly_payment * num_payments
    total_interest = total_payment - principal
    
    return {
        "monthly_payment": round(monthly_payment, 2),
        "total_payment": round(total_payment, 2),
        "total_interest": round(total_interest, 2),
        "principal": principal,
        "annual_rate": annual_rate,
        "years": years
    }

@mcp.tool()
def generate_fibonacci(n: int) -> List[int]:
    """Generate Fibonacci sequence up to n numbers"""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]
    
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    
    return fib

if __name__ == "__main__":
    print("🚀 Starting AgentRepo Demo MCP Server...")
    print("📍 Server will be available at: http://localhost:8000/mcp")
    print("🔧 Add this URL to your AgentRepo MCP Settings")
    print("⚡ Available tools:")
    print("   - add_numbers: Add two numbers")
    print("   - multiply_numbers: Multiply two numbers") 
    print("   - calculate_percentage: Calculate percentage of a value")
    print("   - greet_user: Greet a user by name")
    print("   - analyze_text: Analyze text statistics")
    print("   - convert_temperature: Convert between temperature units")
    print("   - calculate_loan_payment: Calculate loan payments")
    print("   - generate_fibonacci: Generate Fibonacci sequence")
    print("\n🎯 To test in AgentRepo:")
    print("   1. Go to Settings → MCP Servers")
    print("   2. Add server: http://localhost:8000/mcp")
    print("   3. Test connection")
    print("   4. Go to MCP Dashboard to test tools")
    print("\n🛑 Press Ctrl+C to stop the server")
    
    try:
        mcp.run(transport="streamable-http")
    except KeyboardInterrupt:
        print("\n👋 MCP Server stopped. Goodbye!")