# Kala Beauty Parlour

MERN starter for Kala Beauty Parlour, with phone/password authentication, OTP verification, an admin-only service catalogue, a 10-second welcome intro, and WhatsApp contact.

## Run locally

1. Copy `server/.env.example` to `server/.env` and add MongoDB plus SMS provider values.
2. Install dependencies:

   ```bash
   npm install
   npm --prefix server install
   npm --prefix client install
   ```

3. Start both apps with `npm run dev`.

The API runs on `http://localhost:5000` and the Vite client on `http://localhost:5173`. Keep both processes running while using the page. MongoDB is required; the API will not start without a working `MONGODB_URI`.

## Build an Android APK

The APK contains the built client, but it still connects to the deployed Express API. Deploy the API first, then create `client/.env` from `client/.env.example` and set `VITE_API_URL` to the public API URL ending in `/api`.

Install Android Studio with an Android SDK and a JDK, then run:

```bash
npm run android:init
npm run android:build
```

The debug APK is generated at `android/app/build/outputs/apk/debug/app-debug.apk`. Use `npm run android:open` to open the native project in Android Studio. For Play Store distribution, create a signed release bundle in Android Studio rather than distributing the debug APK.

## OTP delivery

Twilio sends OTPs to Indian phone numbers using `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`. OTPs are never returned to the browser; a configured SMS provider is required. OTP records are stored in MongoDB and expire automatically after 10 minutes.

New accounts use phone and password signup without OTP. OTP is used by the forgot-password flow to verify the phone before creating a new password. The requested admin account is seeded from environment variables, defaulting to phone ` and password `. Change these values before deploying.
