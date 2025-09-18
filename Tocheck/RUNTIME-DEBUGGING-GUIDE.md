# Runtime Debugging Guide for Configuration Issues

## Debugging Steps
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Click on a Decision node to select it
4. Try changing the Node Name in Properties Panel
5. Click 'Save Changes' button
6. Click 'Edit Decision Logic' button
7. Check console for debug messages

## Expected Console Messages
- 🚀 UPDATE LOCAL DATA CALLED: when changing node name
- 🚀 BUTTON CLICKED: Save Changes when clicking save
- 🚀 BUTTON CLICKED: Edit Decision Logic when clicking edit
- 🚀 HANDLE OPEN CONFIG CALLED: when opening configuration
- ✅ Configuration dialog state set: when dialog should open

## Troubleshooting
- If no console messages appear: JavaScript errors are preventing execution
- If UPDATE LOCAL DATA not called: Input change events not firing
- If BUTTON CLICKED not appearing: Button click events not firing
- If HANDLE OPEN CONFIG not called: onOpenConfiguration prop not passed
- If dialog state set but dialog doesn't open: Dialog rendering issue

## Common Fixes
- Check for JavaScript errors in console
- Verify React components are properly mounted
- Check if props are being passed correctly
- Verify event handlers are attached
- Check if state updates are triggering re-renders

## What Each Button Should Do

### Edit Decision Logic Button
- Opens a detailed configuration dialog
- Allows setting up conditions and decision rules
- Should show console message: 🚀 BUTTON CLICKED: Edit Decision Logic

### Save Changes Button
- Saves all Properties Panel changes to localStorage
- Updates the node on the canvas immediately
- Should show console message: 🚀 BUTTON CLICKED: Save Changes

### Node Name Field
- Should update the node name on canvas in real-time
- Should show console message: 🚀 UPDATE LOCAL DATA CALLED
- Changes should persist after page refresh
