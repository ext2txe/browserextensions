#!/usr/bin/env python3
"""Generate placeholder icons for the extension."""

from PIL import Image, ImageDraw, ImageFont

def create_icon(size, filename):
    """Create a simple icon with the size."""
    # Create image with blue background
    img = Image.new('RGB', (size, size), color='#0066cc')
    draw = ImageDraw.Draw(img)

    # Draw white circle in center
    margin = size // 4
    draw.ellipse([margin, margin, size - margin, size - margin], fill='white')

    # Draw blue arrow/refresh symbol
    arrow_margin = size // 3
    draw.polygon([
        (size // 2, arrow_margin + 5),
        (size // 2 + 10, arrow_margin + 15),
        (size // 2 - 10, arrow_margin + 15)
    ], fill='#0066cc')

    # Save
    img.save(filename, 'PNG')
    print(f'Created {filename}')

# Create all required sizes
sizes = [16, 32, 48, 128]
for size in sizes:
    create_icon(size, f'icons/icon-{size}.png')

print('All icons created successfully!')
