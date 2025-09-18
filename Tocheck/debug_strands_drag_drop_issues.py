#!/usr/bin/env python3

"""
Debug script to help troubleshoot Strands tools drag-and-drop issues
"""

import os
from pathlib import Path

def debug_external_tools_drag():
    """Debug external tools drag functionality"""
    print("🔍 Debugging External Tools Drag Functionality...")
    
    palette_file = Path("src/components/MultiAgentWorkspace/AgentPalette.tsx")
    if not palette_file.exists():
        print("❌ AgentPalette file not found")
        return
    
    content = palette_file.read_text()
    
    # Check if external tools have draggable attribute
    external_tools_section = content[content.find('value="external-tools"'):content.find('</TabsContent>', content.find('value="external-tools"'))]
    
    has_draggable_external = 'draggable' in external_tools_section
    print(f"🔍 External tools have draggable attribute: {'YES' if has_draggable_external else 'NO'}")
    
    # Check if external tools have onDragStart
    has_drag_start_external = 'onDragStart' in external_tools_section
    print(f"🔍 External tools have onDragStart: {'YES' if has_drag_start_external else 'NO'}")
    
    # Check if external tools are click-only
    has_click_only = 'onClick={() => {' in external_tools_section and 'setToolConfigDialog' in external_tools_section
    print(f"🔍 External tools are click-only: {'YES' if has_click_only else 'NO'}")
    
    if has_click_only and not has_draggable_external:
        print("\\n💡 ISSUE IDENTIFIED: External tools are click-only and not draggable!")
        print("\\n🔧 SOLUTION NEEDED:")
        print("  1. External tools should be draggable AFTER configuration")
        print("  2. Need to track configured state and enable drag")
        print("  3. Or provide drag functionality alongside click-to-configure")
        return False
    
    return True

def debug_local_tools_drag():
    """Debug local tools drag functionality"""
    print("\\n🔍 Debugging Local Tools Drag Functionality...")
    
    palette_file = Path("src/components/MultiAgentWorkspace/AgentPalette.tsx")
    if not palette_file.exists():
        return False
    
    content = palette_file.read_text()
    
    # Check local tools section
    local_tools_section = content[content.find('value="local-tools"'):content.find('</TabsContent>', content.find('value="local-tools"'))]
    
    has_draggable_local = 'draggable' in local_tools_section
    print(f"🔍 Local tools have draggable attribute: {'YES' if has_draggable_local else 'NO'}")
    
    has_drag_start_local = 'onDragStart' in local_tools_section
    print(f"🔍 Local tools have onDragStart: {'YES' if has_drag_start_local else 'NO'}")
    
    has_correct_drag_data = "type: 'strands-tool'" in local_tools_section
    print(f"🔍 Local tools have correct drag data: {'YES' if has_correct_drag_data else 'NO'}")
    
    return has_draggable_local and has_drag_start_local and has_correct_drag_data

def debug_canvas_drop_handling():
    """Debug canvas drop handling"""
    print("\\n🔍 Debugging Canvas Drop Handling...")
    
    canvas_file = Path("src/components/MultiAgentWorkspace/StrandsWorkflowCanvas.tsx")
    if not canvas_file.exists():
        return False
    
    content = canvas_file.read_text()
    
    # Find onDrop function
    on_drop_start = content.find('const onDrop = useCallback(')
    if on_drop_start == -1:
        print("❌ onDrop function not found")
        return False
    
    on_drop_end = content.find('}, [', on_drop_start)
    on_drop_section = content[on_drop_start:on_drop_end]
    
    has_strands_tool_case = "dragData.type === 'strands-tool'" in on_drop_section
    print(f"🔍 Canvas handles strands-tool case: {'YES' if has_strands_tool_case else 'NO'}")
    
    has_tool_creation = 'createToolNode' in on_drop_section
    print(f"🔍 Canvas creates tool nodes: {'YES' if has_tool_creation else 'NO'}")
    
    has_error_handling = 'console.warn' in on_drop_section or 'console.error' in on_drop_section
    print(f"🔍 Canvas has error handling: {'YES' if has_error_handling else 'NO'}")
    
    return has_strands_tool_case and has_tool_creation

def provide_solutions():
    """Provide solutions for common issues"""
    print("\\n🔧 COMMON SOLUTIONS:")
    print("\\n1. **External Tools Not Draggable After Configuration:**")
    print("   - Add draggable=true to configured external tools")
    print("   - Track configuration state in AgentPalette")
    print("   - Enable drag after successful configuration")
    
    print("\\n2. **Tools Not Appearing on Canvas:**")
    print("   - Check browser console for drag/drop errors")
    print("   - Verify tool data structure matches expected format")
    print("   - Ensure canvas onDrop handler is working")
    
    print("\\n3. **Drag Visual Feedback Issues:**")
    print("   - Check cursor styles during drag")
    print("   - Verify drag preview is showing")
    print("   - Ensure drop zones are properly highlighted")
    
    print("\\n4. **Tool Configuration Issues:**")
    print("   - Verify StrandsToolConfigDialog is opening")
    print("   - Check API validation is working")
    print("   - Ensure configuration is being saved")

def main():
    """Run debug analysis"""
    print("🚀 Debugging Strands Tools Drag-and-Drop Issues...\\n")
    
    external_ok = debug_external_tools_drag()
    local_ok = debug_local_tools_drag()
    canvas_ok = debug_canvas_drop_handling()
    
    print("\\n" + "="*60)
    print("🔍 DEBUG ANALYSIS RESULTS")
    print("="*60)
    
    print(f"🔍 External Tools Drag: {'OK' if external_ok else 'ISSUE FOUND'}")
    print(f"🔍 Local Tools Drag: {'OK' if local_ok else 'ISSUE FOUND'}")
    print(f"🔍 Canvas Drop Handling: {'OK' if canvas_ok else 'ISSUE FOUND'}")
    
    if not external_ok:
        print("\\n⚠️  MAIN ISSUE: External tools are not draggable after configuration")
        print("\\n🔧 QUICK FIX NEEDED:")
        print("  1. Make external tools draggable after configuration")
        print("  2. Or add drag functionality alongside click-to-configure")
    
    if local_ok and canvas_ok:
        print("\\n✅ Local tools drag-and-drop should be working!")
    
    provide_solutions()
    
    return external_ok and local_ok and canvas_ok

if __name__ == "__main__":
    success = main()
    if not success:
        print("\\n💡 Run this script after making fixes to verify resolution.")
    exit(0 if success else 1)