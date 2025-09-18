# Windows Troubleshooting Guide
## "Site Can't Be Reached" Error Solutions

### Quick Fix Steps:
1. **Run Fix-Windows-Issues.bat** - This will diagnose and fix common issues
2. **Use Start-Agent-Platform-Debug.bat** - This provides detailed startup diagnostics
3. **Wait longer** - Windows can take 15-30 seconds to start servers

### Common Issues & Solutions:

#### 1. Ports Already in Use
**Symptoms:** Error messages about ports 3000 or 5000 being busy
**Solution:**
```batch
# Kill processes on ports
netstat -ano | findstr :3000
netstat -ano | findstr :5000
# Then kill the process IDs shown
taskkill /f /pid [PROCESS_ID]
```

#### 2. Windows Firewall Blocking
**Symptoms:** Servers start but browser can't connect
**Solution:**
- Open Windows Defender Firewall
- Allow Node.js and Python through firewall
- Or temporarily disable firewall for testing

#### 3. Antivirus Interference
**Symptoms:** Files being quarantined or blocked
**Solution:**
- Add the Agent Platform folder to antivirus exclusions
- Temporarily disable real-time protection

#### 4. Node.js/Python Not in PATH
**Symptoms:** "Command not found" errors
**Solution:**
- Reinstall Node.js with "Add to PATH" option checked
- Reinstall Python with "Add to PATH" option checked
- Or manually add to system PATH

#### 5. Permission Issues
**Symptoms:** Access denied errors
**Solution:**
- Right-click batch files and "Run as Administrator"
- Ensure you have write permissions in the folder

### Step-by-Step Troubleshooting:

#### Step 1: Check System Requirements
- Windows 10/11
- Node.js 16+ installed
- Python 3.8+ installed
- At least 4GB RAM available

#### Step 2: Run Diagnostics
```batch
# Run this to check everything
Fix-Windows-Issues.bat
```

#### Step 3: Manual Server Start (if batch files fail)
```batch
# Terminal 1 - Backend
cd backend
python simple_api.py

# Terminal 2 - Frontend  
npm run dev
```

#### Step 4: Check Server Status
Open Command Prompt and run:
```batch
netstat -an | findstr :3000
netstat -an | findstr :5000
curl http://localhost:3000
curl http://localhost:5000/health
```

#### Step 5: Browser Issues
If servers are running but browser shows errors:
- Try different browser (Chrome, Firefox, Edge)
- Clear browser cache
- Try incognito/private mode
- Manually type: http://localhost:3000

### Advanced Troubleshooting:

#### Check Windows Event Logs
1. Open Event Viewer
2. Look for application errors related to Node.js or Python

#### Network Configuration
```batch
# Reset network stack
netsh winsock reset
netsh int ip reset
ipconfig /flushdns
```

#### Alternative Ports
If ports 3000/5000 are persistently blocked:
1. Edit `package.json` to use different port
2. Edit `backend/simple_api.py` to use different port
3. Update all references to new ports

### Getting Help:
If none of these solutions work:
1. Run `Start-Agent-Platform-Debug.bat`
2. Take screenshots of any error messages
3. Note your Windows version and Node.js/Python versions
4. Check if corporate firewall/proxy is interfering

### Success Indicators:
✅ Both server windows stay open without errors
✅ Browser opens to http://localhost:3000
✅ You can see the Agent Platform interface
✅ Backend validation page shows "Connected" status