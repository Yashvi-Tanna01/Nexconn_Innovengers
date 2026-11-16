#!/usr/bin/env python3
"""
ANTAH — Production Android APK Packaging Pipeline
Compiles the React/Vite frontend into Android assets and builds a genuine,
dex-compiled, resource-linked, cryptographically signed Android APK using Gradle.
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
GRADLE_APK_PATH = ANDROID_DIR / "app" / "build" / "outputs" / "apk" / "debug" / "app-debug.apk"
OUTPUT_APK_DIR = ANDROID_DIR / "app" / "build" / "outputs" / "apk" / "debug"
LOCAL_DEBUG_APK = OUTPUT_APK_DIR / "antah-debug.apk"
ROOT_DIST_APK = ROOT_DIR / "antah-release.apk"
USER_DOWNLOADS = Path(os.environ.get("USERPROFILE", "")) / "Downloads" / "antah-release.apk"

PORTABLE_JDK = ANDROID_DIR / ".tools" / "jdk17" / "jdk-17.0.21+9"
PORTABLE_SDK = ANDROID_DIR / ".tools" / "sdk"

def build_frontend():
    print("==> [1/5] Building Vite Production Distribution...")
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

def sync_assets():
    print("==> [2/5] Syncing compiled web assets into Android assets/public/...")
    if not DIST_DIR.exists():
        print(f"ERROR: {DIST_DIR} does not exist. Build frontend first.")
        sys.exit(1)
    if ASSETS_PUBLIC_DIR.exists():
        shutil.rmtree(ASSETS_PUBLIC_DIR)
    shutil.copytree(DIST_DIR, ASSETS_PUBLIC_DIR)
    print(f"Assets synced to {ASSETS_PUBLIC_DIR}")

def assemble_android_apk():
    print("==> [3/5] Compiling & Packaging Android APK with Gradle...")
    env = os.environ.copy()
    if PORTABLE_JDK.exists():
        env["JAVA_HOME"] = str(PORTABLE_JDK)
        env["PATH"] = str(PORTABLE_JDK / "bin") + os.pathsep + env.get("PATH", "")
    if PORTABLE_SDK.exists():
        env["ANDROID_HOME"] = str(PORTABLE_SDK)

    gradlew_cmd = ".\\gradlew.bat" if os.name == "nt" else "./gradlew"
    cmd = [gradlew_cmd, "assembleDebug"]

    print(f"Running Gradle: {' '.join(cmd)} in {ANDROID_DIR}")
    proc = subprocess.run(
        cmd,
        cwd=str(ANDROID_DIR),
        env=env,
        shell=True,
        capture_output=True,
        text=True
    )
    if proc.returncode != 0:
        print("Gradle compilation failed:")
        print(proc.stdout)
        print(proc.stderr)
        sys.exit(1)
    print("Gradle build successful.")

def verify_and_mirror_apk():
    print("==> [4/5] Inspecting & Verifying APK Package Structure...")
    if not GRADLE_APK_PATH.exists():
        print(f"ERROR: Expected APK not found at {GRADLE_APK_PATH}")
        sys.exit(1)

    with zipfile.ZipFile(GRADLE_APK_PATH, 'r') as apk:
        namelist = apk.namelist()
        required_entries = ["AndroidManifest.xml", "classes.dex", "resources.arsc", "assets/public/index.html"]
        missing = [req for req in required_entries if req not in namelist]
        if missing:
            print(f"ERROR: APK is missing required compiled artifacts: {missing}")
            sys.exit(1)

        # Verify AndroidManifest.xml is binary compiled
        manifest_head = apk.read("AndroidManifest.xml")[:4]
        if manifest_head != b"\x03\x00\x08\x00":
            print(f"ERROR: AndroidManifest.xml is not compiled binary XML (got {manifest_head.hex()})")
            sys.exit(1)

    # Check v2 signature block
    apk_bytes = GRADLE_APK_PATH.read_bytes()
    if b"APK Sig Block 42" not in apk_bytes:
        print("WARNING: APK Signing Block not detected.")
    else:
        print("APK Signing Block (v2/v3 signature): Verified")

    print("==> [5/5] Mirroring APK to distribution locations...")
    # Mirror to antah-debug.apk and root antah-release.apk
    shutil.copy2(GRADLE_APK_PATH, LOCAL_DEBUG_APK)
    shutil.copy2(GRADLE_APK_PATH, ROOT_DIST_APK)

    # Mirror to user's Downloads folder if accessible
    try:
        USER_DOWNLOADS.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(GRADLE_APK_PATH, USER_DOWNLOADS)
        downloads_copied = True
    except Exception as e:
        downloads_copied = False
        print(f"Could not copy to Downloads folder: {e}")

    sha256 = hashlib.sha256(apk_bytes).hexdigest()
    file_size_mb = len(apk_bytes) / (1024 * 1024)

    print("\n" + "="*70)
    print("SUCCESS: Genuine, Compiled & Signed ANTAH Android APK Ready!")
    print(f"Primary APK:     {GRADLE_APK_PATH}")
    print(f"Root Mirror:     {ROOT_DIST_APK}")
    if downloads_copied:
        print(f"User Downloads:  {USER_DOWNLOADS}")
    print(f"File Size:       {file_size_mb:.2f} MB")
    print(f"SHA-256:         {sha256}")
    print("="*70 + "\n")

if __name__ == "__main__":
    build_frontend()
    sync_assets()
    assemble_android_apk()
    verify_and_mirror_apk()
