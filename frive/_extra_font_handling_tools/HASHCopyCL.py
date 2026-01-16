import os
import hashlib


# Specify the path to the folder with woff2 files
FOLDER = r'C:\YOUR\FOLDER\PATH'

hashes = {}

# check hashes
for fname in os.listdir(FOLDER):
    if fname.lower().endswith('.woff2'):
        fullpath = os.path.join(FOLDER, fname)
        with open(fullpath, 'rb') as f:
            data = f.read()
            hash_val = hashlib.sha256(data).hexdigest()
            hashes.setdefault(hash_val, []).append(fname)

print("\n--- Duplicated hashes---")
for h, files in hashes.items():
    if len(files) > 1:
        # We leave the first(original) one and delete the rest
        originals, duplicates = files[:1], files[1:]
        for dup_fname in duplicates:
            dup_fullpath = os.path.join(FOLDER, dup_fname)
            try:
                os.remove(dup_fullpath)
                print(f"🧹 Duplicate removed: {dup_fullpath}")
            except Exception as e:
                print(f"⚠️ Error while deleting {dup_fullpath}: {e}")
        print(f"{h}: originals = {originals}, duplicates removed = {duplicates}")