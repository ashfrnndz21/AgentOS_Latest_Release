#!/bin/bash

# A2A Services Stop Script
# Stops all A2A services

echo "🛑 Stopping A2A Services..."
echo "================================"

# Function to stop service
stop_service() {
    local service_name=$1
    local pid_file="logs/${service_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        echo "🔧 Stopping $service_name (PID: $pid)..."
        
        if kill -0 $pid 2>/dev/null; then
            kill $pid
            sleep 2
            
            if kill -0 $pid 2>/dev/null; then
                echo "⚠️  Force killing $service_name..."
                kill -9 $pid
            fi
            
            echo "✅ $service_name stopped"
        else
            echo "⚠️  $service_name was not running"
        fi
        
        rm -f "$pid_file"
    else
        echo "⚠️  No PID file found for $service_name"
    fi
}

# Stop services
stop_service "a2a_service"
stop_service "strands_sdk"
stop_service "strands_orchestration"

# Clean up any remaining processes on our ports
echo ""
echo "🧹 Cleaning up remaining processes..."

for port in 5006 5007 5009; do
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "🔧 Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null
    fi
done

echo ""
echo "✅ A2A Services Stopped!"
echo "================================"
echo ""
echo "📝 Logs are preserved in logs/ directory"
echo "🔧 To start services again:"
echo "   ./start_a2a_services.sh"












