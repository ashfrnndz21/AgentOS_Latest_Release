#!/bin/bash

echo "🛑 Stopping Utility Agentic Services..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Utility service ports
UTILITY_PORTS=(5041 5042 5043 5044)

stopped_count=0
total_count=${#UTILITY_PORTS[@]}

for port in "${UTILITY_PORTS[@]}"; do
    echo "Checking port $port..."
    
    if lsof -ti:$port >/dev/null 2>&1; then
        echo "   Found process on port $port, stopping..."
        
        # Get process info before killing
        process_info=$(lsof -ti:$port | xargs ps -p 2>/dev/null || echo "Unknown process")
        
        # Kill the process
        if lsof -ti:$port | xargs kill -9 2>/dev/null; then
            echo -e "   ${GREEN}✅ Stopped process on port $port${NC}"
            stopped_count=$((stopped_count + 1))
        else
            echo -e "   ${RED}❌ Failed to stop process on port $port${NC}"
        fi
    else
        echo -e "   ${YELLOW}⚠️  No process found on port $port${NC}"
        stopped_count=$((stopped_count + 1))
    fi
done

echo ""
echo "📊 Stop Summary:"
echo "==============="
echo "Stopped: $stopped_count/$total_count services"

if [ $stopped_count -eq $total_count ]; then
    echo -e "${GREEN}🎉 All utility services stopped successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Some services may still be running${NC}"
    echo "   You may need to stop them manually"
fi

echo ""
echo "🧹 Cleaning up log files..."
if [ -f "backend/utility_database.log" ]; then
    rm backend/utility_database.log
    echo "   Removed utility_database.log"
fi

if [ -f "backend/utility_synthetic.log" ]; then
    rm backend/utility_synthetic.log
    echo "   Removed utility_synthetic.log"
fi

if [ -f "backend/utility_orchestration.log" ]; then
    rm backend/utility_orchestration.log
    echo "   Removed utility_orchestration.log"
fi

if [ -f "backend/utility_gateway.log" ]; then
    rm backend/utility_gateway.log
    echo "   Removed utility_gateway.log"
fi

echo ""
echo "✅ Utility services cleanup completed!"
echo "======================================"
