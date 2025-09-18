#!/usr/bin/env python3

"""
Test script to verify Decision Node fixes:
1. Node name updates properly on canvas
2. Decision conditions can be configured
"""

import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options

def setup_driver():
    """Setup Chrome driver with appropriate options"""
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    
    driver = webdriver.Chrome(options=chrome_options)
    return driver

def test_decision_node_fixes():
    """Test Decision Node name updates and configuration"""
    driver = setup_driver()
    wait = WebDriverWait(driver, 10)
    
    try:
        print("🚀 Starting Decision Node Fixes Test...")
        
        # Navigate to Multi-Agent Workspace
        print("📍 Navigating to Multi-Agent Workspace...")
        driver.get("http://localhost:5173/multi-agent-workspace")
        time.sleep(3)
        
        # Wait for the workspace to load
        print("⏳ Waiting for workspace to load...")
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "react-flow")))
        
        # Look for agent palette
        print("🎨 Looking for Agent Palette...")
        palette_elements = driver.find_elements(By.CSS_SELECTOR, "[data-testid*='palette'], .agent-palette, .palette")
        
        if not palette_elements:
            # Try to find any draggable elements
            palette_elements = driver.find_elements(By.CSS_SELECTOR, "[draggable='true']")
        
        print(f"📊 Found {len(palette_elements)} palette elements")
        
        # Find decision node in palette
        decision_element = None
        for element in palette_elements:
            text = element.text.lower()
            if 'decision' in text or 'branch' in text or 'logic' in text:
                decision_element = element
                break
        
        if not decision_element:
            print("❌ Could not find Decision node in palette")
            return False
        
        print(f"✅ Found Decision element: {decision_element.text}")
        
        # Get canvas element
        canvas = driver.find_element(By.CLASS_NAME, "react-flow")
        canvas_rect = canvas.location
        
        # Drag decision node to canvas
        print("🎯 Dragging Decision node to canvas...")
        actions = ActionChains(driver)
        actions.drag_and_drop_by_offset(
            decision_element, 
            canvas_rect['x'] + 300, 
            canvas_rect['y'] + 200
        ).perform()
        
        time.sleep(2)
        
        # Look for the decision node on canvas
        print("🔍 Looking for Decision node on canvas...")
        decision_nodes = driver.find_elements(By.CSS_SELECTOR, "[data-testid*='decision'], .decision-node, [class*='decision']")
        
        if not decision_nodes:
            # Try to find any nodes on canvas
            all_nodes = driver.find_elements(By.CSS_SELECTOR, ".react-flow__node")
            print(f"📊 Found {len(all_nodes)} total nodes on canvas")
            
            for i, node in enumerate(all_nodes):
                print(f"Node {i}: {node.get_attribute('class')}")
                if 'decision' in node.get_attribute('class').lower():
                    decision_nodes = [node]
                    break
        
        if not decision_nodes:
            print("❌ Could not find Decision node on canvas after drag")
            return False
        
        decision_node = decision_nodes[0]
        print("✅ Found Decision node on canvas")
        
        # Click on the decision node to select it
        print("👆 Clicking Decision node to select...")
        decision_node.click()
        time.sleep(1)
        
        # Look for Properties Panel
        print("🔍 Looking for Properties Panel...")
        properties_panels = driver.find_elements(By.CSS_SELECTOR, ".properties-panel, [data-testid*='properties'], .panel")
        
        if not properties_panels:
            print("❌ Could not find Properties Panel")
            return False
        
        properties_panel = properties_panels[0]
        print("✅ Found Properties Panel")
        
        # Test 1: Update node name
        print("\n🧪 TEST 1: Updating Decision Node Name...")
        
        # Find name input field
        name_inputs = properties_panel.find_elements(By.CSS_SELECTOR, "input[placeholder*='name'], input[placeholder*='decision']")
        
        if not name_inputs:
            # Try to find any input in the properties panel
            name_inputs = properties_panel.find_elements(By.TAG_NAME, "input")
        
        if not name_inputs:
            print("❌ Could not find name input field")
            return False
        
        name_input = name_inputs[0]
        print("✅ Found name input field")
        
        # Clear and enter new name
        test_name = "Test Decision Node"
        name_input.clear()
        name_input.send_keys(test_name)
        time.sleep(1)
        
        # Check if the node on canvas updated
        print("🔍 Checking if node name updated on canvas...")
        time.sleep(2)  # Give time for update
        
        # Look for the updated text in the decision node
        node_text_elements = decision_node.find_elements(By.CSS_SELECTOR, "h3, .node-title, .node-name, span, div")
        
        name_updated = False
        for element in node_text_elements:
            if test_name.lower() in element.text.lower() or "test" in element.text.lower():
                name_updated = True
                print(f"✅ Node name updated on canvas: {element.text}")
                break
        
        if not name_updated:
            print("❌ Node name did not update on canvas")
            print("Current node text elements:")
            for i, element in enumerate(node_text_elements):
                print(f"  Element {i}: '{element.text}'")
        
        # Test 2: Configure Decision Conditions
        print("\n🧪 TEST 2: Configuring Decision Conditions...")
        
        # Look for configuration button
        config_buttons = properties_panel.find_elements(By.CSS_SELECTOR, "button[class*='yellow'], button:contains('Configure'), button:contains('Edit')")
        
        if not config_buttons:
            # Try to find any button in properties panel
            config_buttons = properties_panel.find_elements(By.TAG_NAME, "button")
        
        if not config_buttons:
            print("❌ Could not find configuration button")
            return False
        
        # Find the right button (likely the one with "Configure" or "Edit" text)
        config_button = None
        for button in config_buttons:
            button_text = button.text.lower()
            if 'configure' in button_text or 'edit' in button_text or 'logic' in button_text:
                config_button = button
                break
        
        if not config_button:
            config_button = config_buttons[-1]  # Try the last button
        
        print(f"✅ Found configuration button: {config_button.text}")
        
        # Click configuration button
        config_button.click()
        time.sleep(2)
        
        # Look for configuration dialog
        print("🔍 Looking for configuration dialog...")
        dialogs = driver.find_elements(By.CSS_SELECTOR, ".dialog, .modal, [role='dialog']")
        
        if not dialogs:
            print("❌ Configuration dialog did not open")
            return False
        
        dialog = dialogs[0]
        print("✅ Configuration dialog opened")
        
        # Look for "Add Condition" button
        add_condition_buttons = dialog.find_elements(By.CSS_SELECTOR, "button:contains('Add Condition'), button[class*='blue']")
        
        if not add_condition_buttons:
            # Try to find any button with "Add" text
            all_buttons = dialog.find_elements(By.TAG_NAME, "button")
            for button in all_buttons:
                if 'add' in button.text.lower():
                    add_condition_buttons = [button]
                    break
        
        if not add_condition_buttons:
            print("❌ Could not find 'Add Condition' button")
            return False
        
        add_button = add_condition_buttons[0]
        print(f"✅ Found Add Condition button: {add_button.text}")
        
        # Click Add Condition
        add_button.click()
        time.sleep(1)
        
        # Check if condition was added
        condition_elements = dialog.find_elements(By.CSS_SELECTOR, ".condition, [class*='condition'], .bg-gray-800")
        
        if not condition_elements:
            print("❌ Condition was not added")
            return False
        
        print(f"✅ Condition added successfully ({len(condition_elements)} conditions found)")
        
        # Try to configure the condition
        print("🔧 Configuring the condition...")
        
        # Look for select dropdowns and inputs in the condition
        condition = condition_elements[0]
        selects = condition.find_elements(By.TAG_NAME, "select")
        inputs = condition.find_elements(By.TAG_NAME, "input")
        
        print(f"Found {len(selects)} selects and {len(inputs)} inputs in condition")
        
        # Configure field (first select)
        if selects:
            field_select = selects[0]
            field_select.click()
            time.sleep(0.5)
            
            # Try to select "content" option
            options = driver.find_elements(By.CSS_SELECTOR, "option[value='content'], [data-value='content']")
            if options:
                options[0].click()
                print("✅ Set field to 'content'")
        
        # Configure value (first input)
        if inputs:
            value_input = inputs[0]
            value_input.clear()
            value_input.send_keys("test message")
            print("✅ Set condition value to 'test message'")
        
        # Save configuration
        save_buttons = dialog.find_elements(By.CSS_SELECTOR, "button:contains('Save'), button[class*='blue']")
        
        if save_buttons:
            save_button = save_buttons[0]
            save_button.click()
            time.sleep(2)
            print("✅ Saved configuration")
        
        # Check if dialog closed
        dialogs_after = driver.find_elements(By.CSS_SELECTOR, ".dialog, .modal, [role='dialog']")
        
        if len(dialogs_after) < len(dialogs):
            print("✅ Configuration dialog closed")
        
        # Check if conditions are now shown in properties panel
        print("🔍 Checking if conditions are displayed in Properties Panel...")
        time.sleep(1)
        
        # Look for condition count or condition display
        condition_displays = properties_panel.find_elements(By.CSS_SELECTOR, "*:contains('1 conditions'), *:contains('condition'), .condition")
        
        conditions_displayed = len(condition_displays) > 0
        if conditions_displayed:
            print("✅ Conditions are now displayed in Properties Panel")
        else:
            print("❌ Conditions are not displayed in Properties Panel")
        
        # Final summary
        print("\n📊 TEST RESULTS SUMMARY:")
        print(f"✅ Node name update: {'PASS' if name_updated else 'FAIL'}")
        print(f"✅ Configuration dialog: PASS")
        print(f"✅ Add condition: PASS")
        print(f"✅ Conditions display: {'PASS' if conditions_displayed else 'FAIL'}")
        
        overall_success = name_updated and conditions_displayed
        print(f"\n🎯 OVERALL RESULT: {'SUCCESS' if overall_success else 'PARTIAL SUCCESS'}")
        
        return overall_success
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        print("🧹 Cleaning up...")
        driver.quit()

if __name__ == "__main__":
    success = test_decision_node_fixes()
    exit(0 if success else 1)