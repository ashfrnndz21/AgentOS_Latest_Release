#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

show_help() {
    echo -e "${CYAN}🚀 AgentOS Studio Application Manager${NC}"
    echo "===================================="
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo -e "  ${GREEN}start${NC}     Start all services (frontend + backend)"
    echo -e "  ${RED}stop${NC}      Stop all services"
    echo -e "  ${YELLOW}restart${NC}   Restart all services"
    echo -e "  ${BLUE}status${NC}    Check status of all services"
    echo -e "  ${CYAN}logs${NC}      Show service logs"
    echo -e "  ${YELLOW}help${NC}      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start    # Start the entire application"
    echo "  $0 stop     # Stop all services"
    echo "  $0 restart  # Restart everything"
    echo "  $0 status   # Check what's running"
    echo ""
}

check_service_status() {
    local port=$1
    local name=$2
    
    if lsof -ti:$port >/dev/null 2>&1; then
        echo -e "   ${GREEN}✅ $name (port $port) - Running${NC}"
        return 0
    else
        echo -e "   ${RED}❌ $name (port $port) - Not Running${NC}"
        return 1
    fi
}

show_status() {
    echo -e "${BLUE}📊 Service Status${NC}"
    echo "================="
    
    services=(
        "5173:Frontend (Vite)"
        "11434:Ollama Core"
        "5002:Ollama API"
        "5003:RAG API"
    )
    
    all_running=true
    
    for service in "${services[@]}"; do
        port=$(echo $service | cut -d: -f1)
        name=$(echo $service | cut -d: -f2)
        
        if ! check_service_status $port "$name"; then
            all_running=false
        fi
    done
    
    echo ""
    if [ "$all_running" = true ]; then
        echo -e "${GREEN}🎉 All services are running!${NC}"
        echo -e "${CYAN}🌐 Open your browser: http://localhost:5173${NC}"
    else
        echo -e "${YELLOW}⚠️  Some services are not running${NC}"
        echo -e "${CYAN}💡 Run: $0 start${NC}"
    fi
}

show_logs() {
    echo -e "${CYAN}📋 Recent Service Logs${NC}"
    echo "====================="
    echo ""
    echo -e "${YELLOW}Note: This is a basic implementation.${NC}"
    echo -e "${YELLOW}For detailed logs, check individual service outputs.${NC}"
    echo ""
    
    # Show recent system logs related to our services
    echo -e "${BLUE}Recent process activity:${NC}"
    ps aux | grep -E "(vite|ollama|python.*api)" | grep -v grep | head -10
}

case "$1" in
    "start")
        echo -e "${GREEN}🚀 Starting AgentOS Studio...${NC}"
        ./start-all-services.sh
        ;;
    "stop")
        echo -e "${RED}🛑 Stopping AgentOS Studio...${NC}"
        ./kill-all-services.sh
        ;;
    "restart")
        echo -e "${YELLOW}🔄 Restarting AgentOS Studio...${NC}"
        echo ""
        echo -e "${RED}Stopping services...${NC}"
        ./kill-all-services.sh
        echo ""
        echo -e "${GREEN}Starting services...${NC}"
        ./start-all-services.sh
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    "")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac