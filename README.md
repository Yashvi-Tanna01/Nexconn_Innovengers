# ANTAH

ANTAH is a web and Android client backed by one FastAPI API and database.

## Local development

Backend:

```powershell
cd backend
copy .env.example .env
python -m uvicorn app.main:app --reload --env-file .env
```

Web:

```powershell
cd frontend
npm install
npm run dev
```

Android uses the shared API URL from `ANTAH_API_BASE_URL` when supplied as a
Gradle property. The default is the HTTPS production API; no localhost URL is
packaged into the native client.

```powershell
cd android
.\gradlew.bat assembleDebug -PANTAH_API_BASE_URL=https://your-staging-api.example.com/api/v1
```

The Android build uses Android Gradle Plugin 8.2.2, Gradle 8.2.1, JDK 17,
compile/target SDK 34, and build-tools 34.0.0. The Gradle Wrapper is checked in,
so a system Gradle installation is not required. Set `JAVA_HOME` to a JDK 17
installation if the default Java version is newer.

Debug APK output:
`android/app/build/outputs/apk/debug/app-debug.apk`

Install on a connected device:

```powershell
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

The native client now supports backend-issued access and rotating refresh
tokens, encrypted with Android Keystore, session restoration, logout clearing,
network/invalid-session handling, and backend-derived role dashboards. Reports,
incidents, Nexconn mobile chat, push notifications, and release signing still
require subsequent implementation or credentials.