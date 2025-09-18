# Agent Platform - Windows Setup Guide

## 🚀 Quick Start (If Everything Works)
1. Extract the ZIP file
2. Double-click `Start.bat`
3. Wait 10-15 seconds
4. Browser should open automatically

## ⚠️ If You See "Site Can't Be Reached"

This is a common Windows issue. Here's how to fix it:

### Option 1: Use the Debug Script
1. Double-click `Start-Agent-Platform-Debug.bat`
2. This will diagnose and show you exactly what's wrong
3. Follow the on-screen instructions

### Option 2: Use the Fix Script
1. Double-click `Fix-Windows-Issues.bat`
2. This will automatically fix common Windows problems
3. Then try starting again

### Option 3: Manual Troubleshooting
Read `Windows-Troubleshooting-Guide.md` for detailed solutions

## 📋 Requirements
- Windows 10 or 11
- Node.js 16+ (download from nodejs.org)
- Python 3.8+ (download from python.org)
- At least 4GB free RAM

## 🔧 Common Issues & Quick Fixes

### "Command not found" errors
- Reinstall Node.js and Python with "Add to PATH" checked
- Or run scripts as Administrator

### Servers won't start
- Check if ports 3000 and 5000 are free
- Disable antivirus temporarily
- Run `Fix-Windows-Issues.bat`

### Browser won't connect
- Wait longer (up to 30 seconds)
- Try different browser
- Manually go to http://localhost:8080

## 📞 Getting Help
1. Run `Start-Agent-Platform-Debug.bat`
2. Take screenshots of any errors
3. Check `Windows-Troubleshooting-Guide.md`

## ✅ Success Indicators
- Two command windows stay open (backend and frontend)
- Browser opens to the Agent Platform
- You can see the dashboard and create agents

---
**Note:** Keep the command windows open while using the platform!