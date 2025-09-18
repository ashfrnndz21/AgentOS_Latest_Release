@echo off
echo 🚀 Starting AWS AgentCore Backend API...
echo 📊 Backend will be available at: http://localhost:5001
echo 🔍 Health check: http://localhost:5001/health
echo 🤖 Agents API: http://localhost:5001/api/agents
echo.
echo Press Ctrl+C to stop the server
echo.

cd backend
python aws_agentcore_api.py
pause