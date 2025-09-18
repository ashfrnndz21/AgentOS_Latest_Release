#!/usr/bin/env python3
"""
Create a simple test PDF to verify RAG system works
"""

def create_simple_pdf():
    """Create a simple PDF using reportlab"""
    try:
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        
        filename = "test_ashley_resume.pdf"
        
        # Create PDF
        c = canvas.Canvas(filename, pagesize=letter)
        
        # Add content
        c.drawString(100, 750, "Ashley Fernandes - Resume")
        c.drawString(100, 720, "=" * 40)
        c.drawString(100, 690, "Contact Information:")
        c.drawString(120, 670, "Email: ashley.fernandes@example.com")
        c.drawString(120, 650, "Phone: (555) 123-4567")
        c.drawString(120, 630, "Location: San Francisco, CA")
        
        c.drawString(100, 600, "Skills:")
        c.drawString(120, 580, "• Python Programming")
        c.drawString(120, 560, "• Machine Learning")
        c.drawString(120, 540, "• Data Analysis")
        c.drawString(120, 520, "• Web Development")
        c.drawString(120, 500, "• Database Management")
        
        c.drawString(100, 470, "Experience:")
        c.drawString(120, 450, "Senior Software Developer - Tech Corp (2020-2023)")
        c.drawString(120, 430, "• Developed web applications using Python and React")
        c.drawString(120, 410, "• Implemented machine learning models for data analysis")
        c.drawString(120, 390, "• Led a team of 5 developers")
        
        c.drawString(120, 360, "Software Developer - StartupXYZ (2018-2020)")
        c.drawString(120, 340, "• Built scalable backend systems")
        c.drawString(120, 320, "• Optimized database performance")
        
        c.drawString(100, 290, "Education:")
        c.drawString(120, 270, "Bachelor of Science in Computer Science")
        c.drawString(120, 250, "University of California, Berkeley (2014-2018)")
        c.drawString(120, 230, "GPA: 3.8/4.0")
        
        c.drawString(100, 200, "Projects:")
        c.drawString(120, 180, "• E-commerce Platform: Full-stack web application")
        c.drawString(120, 160, "• ML Prediction Model: Customer behavior analysis")
        c.drawString(120, 140, "• Data Visualization Tool: Interactive dashboards")
        
        c.save()
        
        print(f"✅ Created test PDF: {filename}")
        return filename
        
    except ImportError:
        print("❌ reportlab not available")
        print("💡 Install with: pip install reportlab")
        return None

def create_minimal_pdf():
    """Create a minimal PDF without external dependencies"""
    filename = "minimal_test.pdf"
    
    # Minimal PDF content
    pdf_content = """%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 100
>>
stream
BT
/F1 12 Tf
100 700 Td
(Ashley Fernandes Resume) Tj
0 -20 Td
(Skills: Python, Machine Learning, Data Analysis) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
356
%%EOF"""
    
    try:
        with open(filename, 'w') as f:
            f.write(pdf_content)
        
        print(f"✅ Created minimal PDF: {filename}")
        return filename
    except Exception as e:
        print(f"❌ Failed to create minimal PDF: {e}")
        return None

if __name__ == "__main__":
    print("📄 Creating test PDF files...")
    
    # Try reportlab first
    pdf_file = create_simple_pdf()
    
    # If that fails, create minimal PDF
    if not pdf_file:
        pdf_file = create_minimal_pdf()
    
    if pdf_file:
        print(f"\n✅ Test PDF created: {pdf_file}")
        print("💡 You can now upload this file to test the RAG system")
    else:
        print("\n❌ Could not create test PDF")