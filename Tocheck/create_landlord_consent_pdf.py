#!/usr/bin/env python3
"""
Create a proper landlord consent PDF with extractable text
"""

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io

def create_landlord_consent_pdf():
    """Create a landlord consent PDF with actual text content"""
    
    # Create PDF in memory first
    buffer = io.BytesIO()
    
    # Create the PDF object
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Add title
    p.setFont("Helvetica-Bold", 16)
    p.drawString(100, height - 100, "LANDLORD CONSENT LETTER")
    
    # Add content
    p.setFont("Helvetica", 12)
    y_position = height - 150
    
    content = [
        "Date: December 15, 2024",
        "",
        "To Whom It May Concern:",
        "",
        "I, John Smith, as the landlord of the property located at",
        "123 Main Street, Apartment 4B, Anytown, State 12345,",
        "hereby provide my written consent for the following:",
        "",
        "1. The tenant may install internet equipment as needed",
        "2. The tenant may make reasonable modifications for accessibility",
        "3. The tenant has permission to sublet with prior notice",
        "",
        "This consent is valid from January 1, 2025 to December 31, 2025.",
        "",
        "Please contact me at (555) 123-4567 if you have any questions.",
        "",
        "Sincerely,",
        "",
        "John Smith",
        "Property Owner",
        "john.smith@email.com"
    ]
    
    for line in content:
        p.drawString(100, y_position, line)
        y_position -= 20
    
    # Save the PDF
    p.showPage()
    p.save()
    
    # Write to file
    buffer.seek(0)
    with open("landlord_consent.pdf", "wb") as f:
        f.write(buffer.getvalue())
    
    print("✅ Created landlord_consent.pdf with extractable text")

if __name__ == "__main__":
    try:
        create_landlord_consent_pdf()
    except ImportError:
        print("❌ reportlab not installed. Installing...")
        import subprocess
        subprocess.run(["pip", "install", "reportlab"])
        create_landlord_consent_pdf()