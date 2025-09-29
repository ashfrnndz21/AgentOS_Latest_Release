#!/bin/bash

echo "🔧 Service Management Tool"
echo "========================="

case "$1" in
    "start")
        echo "🚀 Starting optimized services..."
        ./start-optimized-services.sh
        ;;
    "stop")
        echo "🛑 Stopping all services..."
        ./kill-all-services.sh
        ;;
    "restart")
        echo "🔄 Restarting all services..."
        ./kill-all-services.sh
        sleep 3
        ./start-optimized-services.sh
        ;;
    "status")
        echo "📊 Service Status:"
        echo "=================="
        for port in 5002 5003 5004 5005 5006 5008 5010 5011 5014 5018 5019 5020 5021 5022 5173; do
            if lsof -ti:$port >/dev/null 2>&1; then
                echo "✅ Port $port - Running"
            else
                echo "❌ Port $port - Not Running"
            fi
        done
        ;;
    "monitor")
        echo "🔍 Starting health monitor..."
        cd backend && source venv/bin/activate && python service_health_monitor.py
        ;;
    "logs")
        echo "📋 Recent logs:"
        echo "==============="
        cd backend
        for log in *.log; do
            if [ -f "$log" ]; then
                echo "--- $log ---"
                tail -5 "$log"
                echo ""
            fi
        done
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|monitor|logs}"
        echo ""
        echo "Commands:"
        echo "  start   - Start all services with optimized configuration"
        echo "  stop    - Stop all services"
        echo "  restart - Restart all services"
        echo "  status  - Show service status"
        echo "  monitor - Start health monitoring"
        echo "  logs    - Show recent logs"
        exit 1
        ;;
esac
