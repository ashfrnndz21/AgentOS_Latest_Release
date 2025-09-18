// Debug script to check tab clicking issues
console.log("🔍 DEBUGGING TAB CLICKING ISSUES");

// Check if tabs are properly rendered
const tabsList = document.querySelector('[role="tablist"]');
console.log("TabsList found:", tabsList);

// Check all tab triggers
const tabTriggers = document.querySelectorAll('[role="tab"]');
console.log("Tab triggers found:", tabTriggers.length);

tabTriggers.forEach((tab, index) => {
  console.log(`Tab ${index}:`, {
    value: tab.getAttribute('data-value'),
    disabled: tab.getAttribute('aria-disabled'),
    selected: tab.getAttribute('aria-selected'),
    classes: tab.className,
    clickable: !tab.hasAttribute('disabled')
  });
});

// Check for any CSS that might prevent clicking
const computedStyles = window.getComputedStyle(tabsList);
console.log("TabsList styles:", {
  pointerEvents: computedStyles.pointerEvents,
  zIndex: computedStyles.zIndex,
  position: computedStyles.position
});

// Try to click each tab programmatically
tabTriggers.forEach((tab, index) => {
  if (index > 0) { // Skip dashboard tab
    console.log(`Attempting to click tab ${index}:`, tab.getAttribute('data-value'));
    try {
      tab.click();
      console.log(`✅ Successfully clicked tab ${index}`);
    } catch (error) {
      console.log(`❌ Failed to click tab ${index}:`, error);
    }
  }
});

// Check for JavaScript errors
window.addEventListener('error', (e) => {
  console.log("JavaScript error detected:", e.error);
});

// Check for React errors
window.addEventListener('unhandledrejection', (e) => {
  console.log("Unhandled promise rejection:", e.reason);
});

console.log("🔍 Debug script completed. Check console for results.");