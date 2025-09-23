#!/bin/bash

echo "🚀 AgentOS Studio - One-Click Installation"
echo "=========================================="
echo "This will set up the complete AgentOS Studio environment"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ] || [ ! -d "backend" ]; then
    echo "❌ Please run this script from the AgentOS Studio root directory"
    exit 1
fi

# Run the complete setup
echo "🔧 Running complete setup..."
./setup-complete.sh

echo ""
echo "🚀 Starting all services..."
./start-all-services.sh

echo ""
echo "🎉 Installation Complete!"
echo "========================="
echo "✅ All services are starting up"
echo "✅ Frontend will be available at: http://localhost:5173"
echo "✅ Check service status in Settings > Resources"
echo ""
echo "📚 For detailed information, see: SETUP-README.md"

