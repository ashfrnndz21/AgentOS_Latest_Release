#!/usr/bin/env python3

import subprocess
import os

print("🔧 MANUAL FRONTEND START")
print("=" * 40)

print("\n🎯 STEP-BY-STEP FRONTEND STARTUP:")

# Step 1: Check current directory
print(f"\n1️⃣ Current directory: {os.getcwd()}")

# Step 2: Check if package.json exists
if os.path.exists("package.json"):
    print("2️⃣ ✅ package.json found")
    
    # Show package.json scripts
    try:
        with open("package.json", 'r') as f:
            import json
            package_data = json.load(f)
            if "scripts" in package_data:
                print("   📋 Available scripts:")
                for script, command in package_data["scripts"].items():
                    print(f"      {script}: {command}")
    except Exception as e:
        print(f"   ⚠️ Could not read package.json: {e}")
else:
    print("2️⃣ ❌ package.json not found!")
    exit(1)

# Step 3: Check node_modules
if os.path.exists("node_modules"):
    print("3️⃣ ✅ node_modules found")
else:
    print("3️⃣ ❌ node_modules not found - running npm install...")
    try:
        result = subprocess.run(["npm", "install"], check=True)
        print("   ✅ npm install completed")
    except subprocess.CalledProcessError as e:
        print(f"   ❌ npm install failed: {e}")
        exit(1)

# Step 4: Try to start the frontend
print("\n4️⃣ Starting frontend server...")
print("   Command: npm run dev")
print("   This will show all output...")

try:
    # Run npm run dev and show all output
    subprocess.run(["npm", "run", "dev"], check=True)
except subprocess.CalledProcessError as e:
    print(f"\n❌ Frontend failed to start: {e}")
except KeyboardInterrupt:
    print("\n🛑 Frontend stopped by user")

print("\n✅ Frontend startup attempt completed")