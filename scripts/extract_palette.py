import os
import sys
from PIL import Image

def get_hex(rgb):
    return '#{:02x}{:02x}{:02x}'.format(rgb[0], rgb[1], rgb[2])

def extract_palette(image_path):
    if not os.path.exists(image_path):
        print(f"Error: {image_path} not found.")
        return None

    img = Image.open(image_path).convert('RGB')
    width, height = img.size
    
    # Sample 5 primary colors from horizontal center, evenly spaced vertically
    # This assumes vertical bands. If horizontal, we'd do the opposite.
    # Instruction says "5 evenly spaced vertical positions across the palette bands"
    # Usually palette bands are vertical, so we sample across X.
    
    colors = []
    for i in range(5):
        x = int((width / 5) * i + (width / 10))
        y = int(height / 2)
        pixel = img.getpixel((x, y))
        colors.append(get_hex(pixel))
    
    # Compute 2 darker background-ready colors from the darkest region (usually right side)
    pixel_bg = img.getpixel((int(width * 0.9), int(height / 2)))
    pixel_surface = img.getpixel((int(width * 0.8), int(height / 2)))
    
    bg_hex = get_hex(pixel_bg)
    surface_hex = get_hex(pixel_surface)
    
    return {
        "brand-50": colors[0],
        "brand-100": colors[1],
        "brand-200": colors[2],
        "brand-300": colors[3],
        "brand-400": colors[4],
        "bg": bg_hex,
        "surface": surface_hex
    }

def update_css(tokens):
    css_path = "src/styles/brand-tokens.css"
    if not os.path.exists(css_path):
        print(f"Error: {css_path} not found.")
        return

    with open(css_path, 'r') as f:
        lines = f.readlines()

    new_lines = []
    in_raw_palette = False
    for line in lines:
        if "Raw Palette" in line:
            in_raw_palette = True
            new_lines.append(line)
            continue
        
        if in_raw_palette:
            if "--brand-50:" in line:
                new_lines.append(f"  --brand-50:  {tokens['brand-50']}; /* Extracted */\n")
            elif "--brand-100:" in line:
                new_lines.append(f"  --brand-100: {tokens['brand-100']}; /* Extracted */\n")
            elif "--brand-200:" in line:
                new_lines.append(f"  --brand-200: {tokens['brand-200']}; /* Extracted */\n")
            elif "--brand-300:" in line:
                new_lines.append(f"  --brand-300: {tokens['brand-300']}; /* Extracted */\n")
            elif "--brand-400:" in line:
                new_lines.append(f"  --brand-400: {tokens['brand-400']}; /* Extracted */\n")
            elif "Navy Background Anchors" in line:
                in_raw_palette = False
                new_lines.append(line)
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)

    with open(css_path, 'w') as f:
        f.writelines(new_lines)
    print(f"Updated {css_path} with extracted tokens.")

if __name__ == "__main__":
    path = "public/brand/palette.png"
    tokens = extract_palette(path)
    if tokens:
        update_css(tokens)
        print("Palette extraction successful.")
    else:
        print("Palette extraction failed (image missing).")
