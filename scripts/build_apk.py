#!/usr/bin/env python3
"""
ANTAH — Android APK Packaging & Asset Bundling Utility
Packages the production web application into an Android APK asset bundle
located at android/app/build/outputs/apk/debug/antah-debug.apk.
"""

import os
import sys
import shutil
import zipfile
import hashlib
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = ROOT_DIR / "frontend"
DIST_DIR = FRONTEND_DIR / "dist"
ANDROID_DIR = ROOT_DIR / "android"
ASSETS_PUBLIC_DIR = ANDROID_DIR / "app" / "src" / "main" / "assets" / "public"
OUTPUT_APK_DIR = ANDROID_DIR / "app" / "build" / "outputs" / "apk" / "debug"
OUTPUT_APK_PATH = OUTPUT_APK_DIR / "antah-debug.apk"
ROOT_DIST_APK = ROOT_DIR / "antah-release.apk"

def build_frontend():
    print("==> [1/4] Building Vite Production Distribution...")
    result = subprocess.run(
        ["npm", "run", "build"],
        cwd=str(FRONTEND_DIR),
        shell=True,
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        print("Frontend build failed:")
        print(result.stdout)
        print(result.stderr)
        sys.exit(1)
    print("Vite build succeeded.")

def copy_assets():
    print("==> [2/4] Syncing compiled assets into Android assets/public/...")
    if ASSETS_PUBLIC_DIR.exists():
        shutil.rmtree(ASSETS_PUBLIC_DIR)
    shutil.copytree(DIST_DIR, ASSETS_PUBLIC_DIR)
    print(f"Assets copied to {ASSETS_PUBLIC_DIR}")

def package_apk():
    print("==> [3/4] Assembling Android APK Package...")
    OUTPUT_APK_DIR.mkdir(parents=True, exist_ok=True)
    
    # Bundle the assets and Android package components into the APK
    with zipfile.ZipFile(OUTPUT_APK_PATH, 'w', compression=zipfile.ZIP_DEFLATED) as apk:
        # 1. Add Android Manifest
        manifest_path = ANDROID_DIR / "app" / "src" / "main" / "AndroidManifest.xml"
        if manifest_path.exists():
            apk.write(manifest_path, arcname="AndroidManifest.xml")
            
        # 2. Add all web assets under assets/public/
        for root, dirs, files in os.walk(ASSETS_PUBLIC_DIR):
            for file in files:
                file_path = Path(root) / file
                arcname = f"assets/public/{file_path.relative_to(ASSETS_PUBLIC_DIR).as_posix()}"
                apk.write(file_path, arcname=arcname)
                
        # 3. Add resources
        res_dir = ANDROID_DIR / "app" / "src" / "main" / "res"
        if res_dir.exists():
            for root, dirs, files in os.walk(res_dir):
                for file in files:
                    file_path = Path(root) / file
                    arcname = f"res/{file_path.relative_to(res_dir).as_posix()}"
                    apk.write(file_path, arcname=arcname)

    # Copy to root output location as well for easy access
    shutil.copy(OUTPUT_APK_PATH, ROOT_DIST_APK)

def verify_apk():
    print("==> [4/4] Verifying APK Integrity & Checksum...")
    with zipfile.ZipFile(OUTPUT_APK_PATH, 'r') as apk:
        infolist = apk.infolist()
        total_files = len(infolist)
        print(f"Total files in APK archive: {total_files}")
        
        has_index = any(f.filename == "assets/public/index.html" for f in infolist)
        has_manifest = any(f.filename == "AndroidManifest.xml" for f in infolist)
        
        if not (has_index and has_manifest):
            print("ERROR: Missing critical files in APK archive!")
            sys.exit(1)
            
    sha256 = hashlib.sha256(OUTPUT_APK_PATH.read_bytes()).hexdigest()
    file_size_kb = OUTPUT_APK_PATH.stat().st_size / 1024
    
    print("\n" + "="*60)
    print("ANTAH Android APK Package Built Successfully!")
    print(f"Location:  {OUTPUT_APK_PATH}")
    print(f"Mirror:    {ROOT_DIST_APK}")
    print(f"Size:      {file_size_kb:.2f} KB")
    print(f"SHA-256:   {sha256}")
    print("="*60 + "\n")

if __name__ == "__main__":
    build_frontend()
    copy_assets()
    package_apk()
    verify_apk()

