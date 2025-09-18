// Debug script to test Strands tab functionality
console.log('🔍 Debugging Strands Tab Issue...');

// Check if we're on the command centre page
const currentPath = window.location.pathname;
console.log('Current path:', currentPath);

// Check if the Strands tab button exists
const strandsButton = document.querySelector('button[onclick*="strands"]') || 
                     Array.from(document.querySelectorAll('button')).find(btn => 
                       btn.textContent.includes('Strands'));

if (strandsButton) {
  console.log('✅ Strands button found:', strandsButton);
  console.log('Button classes:', strandsButton.className);
  console.log('Button onclick:', strandsButton.onclick);
  
  // Try to click it programmatically
  console.log('🖱️ Attempting to click Strands tab...');
  strandsButton.click();
  
  // Check if content appeared
  setTimeout(() => {
    const strandsContent = document.querySelector('[data-testid="strands-content"]') ||
                          document.querySelector('*[class*="SimpleStrandsTraceability"]') ||
                          Array.from(document.querySelectorAll('*')).find(el => 
                            el.textContent && el.textContent.includes('Strands Intelligence Traceability'));
    
    if (strandsContent) {
      console.log('✅ Strands content found after click:', strandsContent);
    } else {
      console.log('❌ No Strands content found after click');
      
      // Check for any error messages
      const errorElements = document.querySelectorAll('[class*="error"], .error, [role="alert"]');
      if (errorElements.length > 0) {
        console.log('🚨 Found error elements:', errorElements);
      }
      
      // Check console for React errors
      console.log('🔍 Check browser console for React errors...');
    }
  }, 1000);
  
} else {
  console.log('❌ Strands button not found');
  
  // List all buttons to see what's available
  const allButtons = document.querySelectorAll('button');
  console.log('Available buttons:', Array.from(allButtons).map(btn => ({
    text: btn.textContent?.trim(),
    classes: btn.className
  })));
}

// Check if React is loaded
if (window.React) {
  console.log('✅ React is loaded');
} else {
  console.log('❌ React not found');
}

// Check for any JavaScript errors
window.addEventListener('error', (e) => {
  console.error('🚨 JavaScript Error:', e.error);
});

console.log('🔍 Debug script completed. Check the results above.');