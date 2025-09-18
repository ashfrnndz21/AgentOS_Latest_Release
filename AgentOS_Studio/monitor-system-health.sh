#!/bin/bash

echo "🏥 System Health Monitor"
echo "========================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to check memory usage
check_memory() {
    echo -e "${BLUE}💾 Memory Usage:${NC}"
    
    # Get memory info (macOS)
    if command -v vm_stat &> /dev/null; then
        vm_stat | head -5
    fi
    
    # Check for memory-intensive processes
    echo "   Top memory consumers:"
    ps aux | sort -nr -k 4 | head -5 | while read line; do
        echo "     $line"
    done
}

# Function to check CPU usage
check_cpu() {
    echo -e "${BLUE}🖥️  CPU Usage:${NC}"
    
    # Get CPU info
    top -l 1 | grep "CPU usage" | head -1
    
    # Check for CPU-intensive processes
    echo "   Top CPU consumers:"
    ps aux | sort -nr -k 3 | head -5 | while read line; do
        echo "     $line"
    done
}

# Function to check disk usage
check_disk() {
    echo -e "${BLUE}💿 Disk Usage:${NC}"
    df -h | grep -E "(Filesystem|/dev/)"
}

# Function to check network connections
check_network() {
    echo -e "${BLUE}🌐 Network Connections:${NC}"
    
    # Check our service ports
    ports=(5002 5003 5004 5005 5006 5173 11434)
    
    for port in "${ports[@]}"; do
        if lsof -ti:$port >/dev/null 2>&1; then
            process=$(lsof -ti:$port | head -1)
            process_name=$(ps -p $process -o comm= 2>/dev/null || echo "unknown")
            echo -e "   ✅ Port $port: ${GREEN}Active${NC} (PID: $process, Process: $process_name)"
        else
            echo -e "   ❌ Port $port: ${RED}Inactive${NC}"
        fi
    done
}

# Function to check database sizes
check_databases() {
    echo -e "${BLUE}🗄️  Database Status:${NC}"
    
    if [ -d "backend" ]; then
        for db in backend/*.db; do
            if [ -f "$db" ]; then
                size=$(du -h "$db" | cut -f1)
                echo "   📊 $(basename "$db"): $size"
            fi
        done
    fi
}

# Function to check log files
check_logs() {
    echo -e "${BLUE}📋 Log Files:${NC}"
    
    # Check for large log files
    if [ -d "backend" ]; then
        for log in backend/*.log; do
            if [ -f "$log" ]; then
                size=$(du -h "$log" | cut -f1)
                lines=$(wc -l < "$log" 2>/dev/null || echo "0")
                echo "   📄 $(basename "$log"): $size ($lines lines)"
                
                # Check for recent errors
                if [ -f "$log" ]; then
                    recent_errors=$(tail -100 "$log" | grep -i error | wc -l)
                    if [ $recent_errors -gt 0 ]; then
                        echo -e "     ⚠️  ${YELLOW}$recent_errors recent errors${NC}"
                    fi
                fi
            fi
        done
    fi
}

# Function to check service health
check_service_health() {
    echo -e "${BLUE}🏥 Service Health Checks:${NC}"
    
    # Health endpoints
    endpoints=(
        "http://localhost:5002/health:Ollama API"
        "http://localhost:5003/health:RAG API"
        "http://localhost:5004/api/strands/health:Strands API"
        "http://localhost:5005/api/chat/health:Chat Orchestrator"
        "http://localhost:5006/api/strands-sdk/health:Strands SDK API"
    )
    
    for endpoint in "${endpoints[@]}"; do
        url=$(echo $endpoint | cut -d: -f1-3)
        name=$(echo $endpoint | cut -d: -f4)
        
        if curl -s --max-time 5 "$url" >/dev/null 2>&1; then
            echo -e "   ✅ $name: ${GREEN}Healthy${NC}"
        else
            echo -e "   ❌ $name: ${RED}Unhealthy${NC}"
        fi
    done
}

# Function to check for performance issues
check_performance() {
    echo -e "${BLUE}⚡ Performance Metrics:${NC}"
    
    # Check load average
    if command -v uptime &> /dev/null; then
        load=$(uptime | awk -F'load averages:' '{print $2}')
        echo "   📈 Load Average:$load"
    fi
    
    # Check for zombie processes
    zombies=$(ps aux | awk '$8 ~ /^Z/ { count++ } END { print count+0 }')
    if [ $zombies -gt 0 ]; then
        echo -e "   ⚠️  ${YELLOW}$zombies zombie processes${NC}"
    else
        echo -e "   ✅ No zombie processes"
    fi
    
    # Check for high memory usage processes
    high_mem=$(ps aux | awk '$4 > 10.0 { count++ } END { print count+0 }')
    if [ $high_mem -gt 0 ]; then
        echo -e "   ⚠️  ${YELLOW}$high_mem processes using >10% memory${NC}"
    else
        echo -e "   ✅ Memory usage normal"
    fi
}

# Main execution
echo "$(date)"
echo ""

check_memory
echo ""

check_cpu
echo ""

check_disk
echo ""

check_network
echo ""

check_databases
echo ""

check_logs
echo ""

check_service_health
echo ""

check_performance
echo ""

echo -e "${GREEN}🎯 Health check complete!${NC}"
echo "========================"