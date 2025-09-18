#!/bin/bash

echo "🤖 Creating sample agents for testing..."

# Create a Research Agent
echo "📚 Creating Research Agent..."
curl -X POST http://localhost:5002/api/agents/ollama \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Research Assistant",
    "role": "Research Specialist",
    "description": "Specialized in conducting thorough research, analyzing information, and providing comprehensive insights on various topics.",
    "systemPrompt": "You are a professional research assistant. You excel at finding, analyzing, and synthesizing information from multiple sources. Always provide well-researched, accurate, and comprehensive responses with proper citations when possible.",
    "model": "llama3.2:3b",
    "temperature": 0.3,
    "maxTokens": 2000,
    "guardrails": {
      "enabled": true,
      "safetyLevel": "high",
      "rules": ["fact_checking", "source_verification"],
      "contentFilters": ["misinformation"]
    }
  }'

echo ""

# Create a Code Assistant
echo "💻 Creating Code Assistant..."
curl -X POST http://localhost:5002/api/agents/ollama \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Code Assistant",
    "role": "Software Developer",
    "description": "Expert in software development, code review, debugging, and providing programming solutions across multiple languages.",
    "systemPrompt": "You are an expert software developer and code assistant. You help with coding tasks, debugging, code review, and explaining programming concepts. Always write clean, efficient, and well-documented code.",
    "model": "llama3.2:3b",
    "temperature": 0.2,
    "maxTokens": 3000,
    "guardrails": {
      "enabled": true,
      "safetyLevel": "medium",
      "rules": ["code_safety", "security_best_practices"],
      "contentFilters": ["malicious_code"]
    }
  }'

echo ""

# Create a Business Analyst
echo "📊 Creating Business Analyst..."
curl -X POST http://localhost:5002/api/agents/ollama \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Business Analyst",
    "role": "Business Intelligence Specialist",
    "description": "Specialized in business analysis, market research, financial modeling, and strategic planning to drive business decisions.",
    "systemPrompt": "You are a professional business analyst with expertise in market analysis, financial modeling, and strategic planning. You provide data-driven insights and recommendations to support business decisions.",
    "model": "llama3.2:3b",
    "temperature": 0.4,
    "maxTokens": 2500,
    "guardrails": {
      "enabled": true,
      "safetyLevel": "high",
      "rules": ["financial_accuracy", "ethical_business_practices"],
      "contentFilters": ["financial_misinformation"]
    }
  }'

echo ""

echo "✅ Sample agents created successfully!"
echo "🔄 Refreshing the Strands workspace to see the new agents..."