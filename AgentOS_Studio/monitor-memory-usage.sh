#!/bin/bash

echo "🔍 Strands SDK Memory Usage Monitor"
echo "===================================="

# Function to get memory usage of a process
get_memory_usage() {
    local process_name=$1
    local pid=$(pgrep -f "$process_name" | head -1)
    
    if [ ! -z "$pid" ]; then
        local memory=$(ps -p $pid -o rss= | awk '{print $1/1024}')
        echo "$memory MB"
    else
        echo "Not running"
    fi
}

# Function to monitor memory over time
monitor_memory() {
    echo "Starting memory monitoring..."
    echo "Time,Frontend(MB),Backend(MB),Ollama(MB)"
    
    for i in {1..60}; do
        timestamp=$(date '+%H:%M:%S')
        frontend_mem=$(get_memory_usage "vite")
        backend_mem=$(get_memory_usage "strands_sdk_api.py")
        ollama_mem=$(get_memory_usage "ollama serve")
        
        echo "$timestamp,$frontend_mem,$backend_mem,$ollama_mem"
        sleep 5
    done
}

# Check current memory usage
echo ""
echo "📊 Current Memory Usage:"
echo "Frontend (Vite): $(get_memory_usage 'vite')"
echo "Strands Backend: $(get_memory_usage 'strands_sdk_api.py')"
echo "Ollama Server: $(get_memory_usage 'ollama serve')"

echo ""
echo "🚀 To monitor memory during web search:"
echo "1. Run: ./monitor-memory-usage.sh > memory_log.csv"
echo "2. Create a Strands agent with web search tool"
echo "3. Perform multiple web searches"
echo "4. Check memory_log.csv for usage patterns"

# If run with monitor flag
if [ "$1" = "monitor" ]; then
    monitor_memory
fi