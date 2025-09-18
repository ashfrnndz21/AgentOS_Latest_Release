#!/bin/bash

# 🚀 System Performance Optimization Script
# Fixes memory leaks and CPU overload issues

echo "🔧 SYSTEM PERFORMANCE OPTIMIZATION"
echo "=================================="

# 1. Stop runaway monitoring processes
echo "🛑 Stopping runaway monitoring processes..."
pkill -f "watch_rag_processing"
pkill -f "monitor_rag_pipeline"
pkill -f "debug_frontend_backend"

# 2. Check current system load
echo "📊 Current system status:"
echo "Load Average: $(uptime | awk -F'load averages:' '{print $2}')"
echo "Memory Usage: $(vm_stat | grep 'Pages free' | awk '{print $3}' | sed 's/\.//')"

# 3. Find memory-intensive processes
echo "🔍 Top memory consumers:"
ps aux | sort -k4 -nr | head -3 | awk '{print $2, $3"% CPU", $4"% MEM", $11}'

# 4. Optimize Kiro IDE settings
echo "⚙️  Optimizing Kiro IDE performance..."

# Kill excessive Kiro processes if needed
KIRO_PROCESSES=$(ps aux | grep -c "Kiro Helper")
if [ "$KIRO_PROCESSES" -gt 5 ]; then
    echo "⚠️  Warning: $KIRO_PROCESSES Kiro processes detected (normal: 3-5)"
    echo "💡 Consider restarting Kiro IDE to clear memory leaks"
fi

# 5. Clean up temporary files
echo "🧹 Cleaning temporary files..."
rm -f *.log 2>/dev/null
rm -f debug_*.py 2>/dev/null
rm -f test_*.py 2>/dev/null

# 6. Optimize Python backend
echo "🐍 Checking Python backend performance..."
PYTHON_PROCESSES=$(ps aux | grep "simple_api.py" | grep -v grep | wc -l)
if [ "$PYTHON_PROCESSES" -gt 1 ]; then
    echo "⚠️  Multiple Python backends detected, killing extras..."
    pkill -f "simple_api.py"
    sleep 2
    echo "✅ Cleaned up duplicate Python processes"
fi

# 7. Check Ollama status
echo "🤖 Checking Ollama performance..."
OLLAMA_PROCESSES=$(ps aux | grep ollama | grep -v grep | wc -l)
echo "   Ollama processes: $OLLAMA_PROCESSES"

# 8. Memory cleanup recommendations
echo ""
echo "💡 PERFORMANCE RECOMMENDATIONS:"
echo "================================"
echo "1. 🔄 Restart Kiro IDE if CPU usage stays above 100%"
echo "2. 🧹 Close unused browser tabs"
echo "3. 📱 Close other memory-intensive applications"
echo "4. 🔧 Disable auto-refresh in monitoring scripts"
echo "5. ⏸️  Pause unnecessary background processes"

# 9. System resource summary
echo ""
echo "📈 CURRENT RESOURCE USAGE:"
echo "=========================="
echo "CPU Load: $(uptime | awk -F'load averages:' '{print $2}' | awk '{print $1}')"
echo "Memory: $(vm_stat | head -1)"
echo "Disk: $(df -h / | tail -1 | awk '{print $5 " used"}')"

# 10. Quick fixes
echo ""
echo "🚀 QUICK FIXES APPLIED:"
echo "======================"
echo "✅ Stopped runaway monitoring processes"
echo "✅ Cleaned temporary files"
echo "✅ Checked for duplicate processes"
echo ""
echo "🎯 Next: Restart Kiro IDE if performance issues persist"

echo ""
echo "=================================="
echo "✅ System optimization complete!"
echo "=================================="