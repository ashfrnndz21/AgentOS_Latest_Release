# Fix Air Liquide Sidebar - Show Industrial Use Cases

## Problem
The sidebar is still showing "Patient Analytics" and "Care Management" instead of the Air Liquide industrial use cases.

## Root Cause
The browser has cached the previous healthcare industry configuration in localStorage, which is overriding our Air Liquide industrial context.

## Solution Options

### Option 1: Use the Cache Clearing Tool (Recommended)
1. Open the file `clear-cache.html` in your browser
2. Click the "🧹 Clear Cache & Set Air Liquide Context" button
3. Refresh your Air Liquide Agent OS page
4. The sidebar should now show the correct industrial use cases

### Option 2: Manual Browser Console Method
1. Open your Air Liquide Agent OS page
2. Open browser Developer Tools (F12)
3. Go to the Console tab
4. Paste and run this code:
```javascript
// Clear cached industry data
localStorage.removeItem('industryConfig');
localStorage.removeItem('customLogo');

// Clear any healthcare/telco cache
Object.keys(localStorage).forEach(key => {
  if (key.includes('industry') || key.includes('healthcare') || key.includes('telco')) {
    localStorage.removeItem(key);
  }
});

// Force refresh
location.reload();
```

### Option 3: Hard Browser Refresh
1. Open your Air Liquide Agent OS page
2. Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac) for a hard refresh
3. This should clear the cache and load the updated industrial context

## Expected Result
After clearing the cache, the sidebar under "Agent Use Cases" should show:

✅ **Procurement Analytics** - Financial Forecasting & Scenario Analysis  
✅ **Safety Monitoring** - Predictive Maintenance & Safety  
✅ **R&D Discovery** - Materials Research & Innovation  
✅ **Talent Management** - Engineering Recruitment & Development  

Instead of:
❌ Patient Analytics  
❌ Care Management  

## Verification
1. Check that the sidebar shows the 4 Air Liquide use cases listed above
2. Click on each use case to verify they load the correct pages:
   - `/procurement-analytics` - Shows financial forecasting dashboard
   - `/safety-monitoring` - Shows safety and maintenance monitoring
   - `/rd-discovery` - Shows R&D materials discovery
   - `/talent-management` - Shows engineering talent management

## Technical Details
- Updated `IndustryContext.tsx` to force industrial configuration as default
- Created 4 comprehensive use case pages with Air Liquide branding
- Added routes in `App.tsx` for all new pages
- Industrial context includes proper navigation paths for all use cases

## If Issues Persist
If you're still seeing the wrong sidebar items after trying all options above:
1. Check browser console for any JavaScript errors
2. Verify that the build completed successfully
3. Try opening the page in an incognito/private browser window
4. Contact support with browser console logs