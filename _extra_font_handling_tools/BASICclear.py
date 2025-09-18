import os
import glob
import os
import random
import hashlib
import random
import string
import argparse
from fontTools.ttLib import TTFont

from fontTools.ttLib.woff2 import main as woff2_compress

def random_string(length=8):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def generate_font_metadata(platform):
    common_families = [
        "NeoMono",        
        "PrimeSans",      
        "LunaText",      
        "NimbusPro",      
        "CodaSans",       
        "ClarityMono",   
        "Interstate",     
        "Vectora",        
        "OrbitaSans",     
        "AtlasType",      
        "Torus",         
        "Equinox",       
        "ZenithMono",     
        "QuantumSans",    
        "SolarGrotesk",   
        "StellarText",    
        "AxiomSans",      
        "ApexGrotesk",    
        "Visage",
        "Viretta",
        "Qorin",        
    ]
    platform_names = {
        "win": ["Arial", "Verdana", "Tahoma", "Trebuchet MS", "Segoe UI", "Calibri", "Impact", "Consolas", "Lucida Console"],
        "mac": ["Helvetica Neue", "Geneva", "Lucida Grande", "Menlo", "Monaco", "Avenir", "Optima", "Baskerville", "Gill Sans"]
    }
    designers = {
        "win": ["Microsoft Corp.", "Monolith Design", "Sharp Sable Graphics", "The New Glory View", "PrototypeFont Factory", "Pure bury design", "Granite & Grid"],
        "mac": ["Apple Inc.", "Aftermath", "Pure bury design", "Futura Design", "Omni Group", "Generation Frontline Foundry",]
    }
    subfamilies = ["Thin", "Extra Light", "Light", "Regular", "Medium", "SemiBold", "Bold", "Extra Bold",
        "Black", "Italic", "Oblique", "Extended", "Narrow", "Expanded", "Ultra Light",
        "Ultra Bold", "Heavy", "Mono", "Display", "Hairline", "Book", "DemiBold", "Extra Black", "Ultra Black",
        "Condensed", "Extra Condensed", "Ultra Condensed", "Compressed", "Extra Compressed",
        "Wide", "Extra Wide", "Ultra Wide", "Slanted", "Backslant", "Caption", "Text", "Subhead", "Headline", "Poster", "Small Caps", "Titling",
        "Inline", "Shadow", "Variable", "Stencil", "Outline", "Engraved", "Script", "Rounded",
        "UI", "Micro", "Footnote", "Compact", ""]
    licenses = [
        "GNU General Public License (GPL)", "MIT License",
        "SIL Open Font License (OFL)", "Apache License 2.0", "Creative Commons license"]

    family = random.choice(platform_names[platform] + common_families)
    subfamily = random.choice(subfamilies)
    unique_id = f"{family[:2]}-{random_string(10)}"
    full_name = f"{family} {subfamily}".strip()
    version = f"Version {random.randint(1, 5)}.{random.randint(0, 9999)}"
    ps_name = f"{family}-{subfamily}".replace(" ", "")
    designer = random.choice(designers[platform])
    license_desc = random.choice(licenses)

    return {
        1: family,
        2: subfamily,
        3: unique_id,
        4: full_name,
        5: version,
        6: ps_name,
        9: designer,
        13: license_desc
    }

def clean_and_export_woff2(src_ttf_path, output_woff2_path, names_to_change, platform):
    font = TTFont(src_ttf_path)
    name_table = font['name']
    essential_name_ids = set(names_to_change.keys())
    name_table.names = [r for r in name_table.names if r.nameID in essential_name_ids]
    platformID = 3
    encodingID = 1
    languageID = 1033

    # in the case platform is macOS, overlap win name-table setting
    if platform == "mac":
        platformID  = 1  # Macintosh (Apple)
        encodingID  = 0  # Roman
        languageID  = 0  # English (Macintosh)

    # use platformID/encodingID/languageID while patching name-table
    for nameID, value in names_to_change.items():
        if value:
            font['name'].setName(value, nameID, platformID, encodingID, languageID)

    # save as .woff2
    font.flavor = "woff2"
    font.save(output_woff2_path)
    print(f"[+] Saved: {output_woff2_path}")


def generate_fonts(src_ttf, count, platform, target_folder):
    os.makedirs(target_folder, exist_ok=True)
    
    for i in range(1, count + 1):
        for idx, src_path in enumerate(src_ttf):
            with open(src_path, 'rb') as f:
                data = f.read()
            names = generate_font_metadata(platform)
            salt = hashlib.md5(data).hexdigest()[:6]
            out_filename = f"{platform}_{idx}_{salt}.woff2"
            output_woff2_path = os.path.join(target_folder, out_filename)
            clean_and_export_woff2(src_path, output_woff2_path, names, platform)
            print(f"[✔] {platform.upper()}: Created → {output_woff2_path}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=1, help="How many copies for each source font")
    parser.add_argument("--platform", choices=["win"], default="win", help="Platform for metadata")
    args = parser.parse_args()

    source_dir = os.path.dirname(__file__)
    src_ttf = glob.glob(os.path.join(source_dir, "*.ttf")) + \
              glob.glob(os.path.join(source_dir, "*.woff2"))

    if not src_ttf:
        print("[!] There are no .ttf  \ .woff2 files in the folder ")
        return

    print(f"[*] Found {len(src_ttf)} files")

    generate_fonts(src_ttf, count=args.count, platform=args.platform,
                   target_folder=r"C:\YOUR\FOLDER\PATH")



if __name__ == "__main__":
    main()
