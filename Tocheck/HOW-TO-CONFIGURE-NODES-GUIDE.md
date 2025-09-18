# 🔧 How to Configure Utility Nodes - Step by Step Guide

## 🎯 **Current Status**
You have a **Decision node** on your canvas that needs configuration!

## 🖱️ **3 Ways to Configure Nodes:**

### **Method 1: Single Click (Recommended)**
1. **Click once** on the Decision node
2. Configuration dialog should open automatically
3. Fill in your decision logic
4. Click "Save Configuration"

### **Method 2: Double Click**
1. **Double-click** on the Decision node
2. Configuration dialog opens
3. Configure and save

### **Method 3: Properties Panel**
1. **Click** on the Decision node
2. **Properties panel** opens on the right
3. Use the configuration options there

## ⚙️ **What You Can Configure in Decision Node:**

### **1. Basic Info**
- **Node Name**: "Customer Routing Decision"
- **Description**: "Routes customers based on their inquiry type"

### **2. Decision Conditions** (The Important Part!)
Click "Add Condition" to create rules like:

**Example Condition 1:**
- **Field**: Message Content
- **Operator**: Contains
- **Value**: "technical"
- **Action**: Route to Agent
- **Target**: Tech Support Agent

**Example Condition 2:**
- **Field**: Confidence Score
- **Operator**: Less Than
- **Value**: 0.7
- **Action**: Route to Human
- **Target**: Human Support Queue

### **3. Default Action**
What happens if no conditions match:
- **Action**: Route to Agent
- **Target**: General Support Agent

### **4. Evaluation Mode**
- **First Match**: Stop at first true condition
- **Highest Priority**: Evaluate by priority order
- **All Conditions**: Must match all conditions

## 🚀 **Quick Test Setup:**

Try this simple configuration:

1. **Condition 1**: 
   - If content contains "help" → Route to Support Agent
2. **Condition 2**: 
   - If content contains "buy" → Route to Sales Agent
3. **Default**: 
   - Route to General Agent

## 🔍 **Troubleshooting:**

### **If Configuration Dialog Doesn't Open:**
1. **Refresh the browser** (new code was just applied)
2. **Try clicking the node again**
3. **Check browser console** for any errors

### **If No Agents Available:**
1. **Add some agents first** from the Agents tab
2. **Then configure the Decision node**
3. **Agents will appear in the dropdown**

## ✅ **Expected Result:**
After configuration, your Decision node should:
- Show as "configured" status
- Display your custom name
- Have your routing logic ready for execution

---

**Try clicking on your Decision node now - the configuration dialog should open!** 🎉