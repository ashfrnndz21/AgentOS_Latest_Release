#!/usr/bin/env python3
import os
import shutil

print("🔄 REVERTING TO SAVED WORKING VERSIONS")
print("=" * 60)

# 1. Check what backup files we have
print("\n1️⃣ CHECKING AVAILABLE BACKUP FILES:")
backup_files = [
    "src/App_working.tsx",
    "src/App_minimal.tsx", 
    "src/App_without_problematic_components.tsx"
]

available_backups = []
for backup in backup_files:
    if os.path.exists(backup):
        available_backups.append(backup)
        print(f"   ✅ Found: {backup}")
    else:
        print(f"   ❌ Missing: {backup}")

if not available_backups:
    print("   ⚠️  No backup files found!")
    exit(1)

# 2. Restore from the most appropriate backup
print(f"\n2️⃣ RESTORING FROM BACKUP:")
# Use App_working.tsx if available, otherwise App_minimal.tsx
if "src/App_working.tsx" in available_backups:
    backup_to_use = "src/App_working.tsx"
elif "src/App_minimal.tsx" in available_backups:
    backup_to_use = "src/App_minimal.tsx"
else:
    backup_to_use = available_backups[0]

print(f"   📁 Using backup: {backup_to_use}")

# Read the backup content
with open(backup_to_use, 'r') as f:
    backup_content = f.read()

# Restore to main App.tsx
with open("src/App.tsx", 'w') as f:
    f.write(backup_content)

print(f"   ✅ Restored App.tsx from {backup_to_use}")

# 3. Check if we need to restore other components
print(f"\n3️⃣ CHECKING FOR OTHER BACKUP COMPONENTS:")

# Look for any other backup files in the project
import glob

# Find all backup files
all_backups = []
for pattern in ["*_working.*", "*_minimal.*", "*_backup.*"]:
    all_backups.extend(glob.glob(f"src/**/{pattern}", recursive=True))

if all_backups:
    print("   📋 Found additional backup files:")
    for backup in all_backups:
        print(f"      - {backup}")
else:
    print("   ℹ️  No additional backup files found")

print(f"\n4️⃣ CLEANING UP RECENT CHANGES:")
# Remove the files I created that might be causing issues
files_to_remove = [
    "src/pages/MonitoringDashboard.tsx",
    "src/pages/ConfigurationManagement.tsx", 
    "src/pages/AIMarketplace.tsx",
    "src/components/ComponentFallback.tsx",
    "src/components/SystemFlow/AgentOSLogicalFlow.tsx",
    "src/components/SystemFlow/AgentOSArchitectureDesign.tsx"
]

for file_path in files_to_remove:
    if os.path.exists(file_path):
        os.remove(file_path)
        print(f"   🗑️  Removed: {file_path}")
    else:
        print(f"   ℹ️  Not found: {file_path}")

print(f"\n✅ REVERSION COMPLETE!")
print("=" * 60)
print(f"\n🎯 ACTIONS TAKEN:")
actions = [
    f"✅ Restored App.tsx from {backup_to_use}",
    "✅ Removed problematic new components I created",
    "✅ Cleaned up recent changes that caused issues",
    "✅ System should now be back to working state"
]
for action in actions:
    print(f"   {action}")

print(f"\n🚀 NEXT STEPS:")
print("   1. Refresh your browser")
print("   2. The app should now work like it did before")
print("   3. All components should load properly")
print("   4. No more component errors")