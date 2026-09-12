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

## Deploy on Render

1. Create a MongoDB Atlas database and copy its connection string.
2. In Render, choose **New > Blueprint** and select this repository. Render will use `render.yaml` to create the web service.
3. Add the secret environment variables requested by the Blueprint, especially `MONGODB_URI`, `ADMIN_PHONE`, and `ADMIN_PASSWORD`. Add the SMTP or Twilio variables if password-reset OTP delivery is required.
4. Deploy. The service serves the built React app and the Express API from one public URL. The health check is available at `/api/health`.

## OTP delivery

Twilio sends OTPs to Indian phone numbers using `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`. OTPs are never returned to the browser; a configured SMS provider is required. OTP records are stored in MongoDB and expire automatically after 10 minutes.

New accounts use phone and password signup without OTP. OTP is used by the forgot-password flow to verify the phone before creating a new password. The requested admin account is seeded from environment variables, defaulting to phone ` and password `. Change these values before deploying.
