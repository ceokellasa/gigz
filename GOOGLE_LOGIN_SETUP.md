# Google OAuth Login Setup Guide

## Part 1: Google Cloud Console Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure the OAuth consent screen if prompted:
   - User Type: External
   - App name: Kellasa (or your app name)
   - User support email: Your email
   - Developer contact: Your email
6. Select **Application type**: Web application
7. Add **Authorized redirect URIs**:
   ```
   https://rhqzywqsfjzjzbfqlyqf.supabase.co/auth/v1/callback
   ```
8. Click **Create**
9. Copy the **Client ID** and **Client Secret**

---

## Part 2: Supabase Dashboard Configuration

### 1. Enable Google Provider

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/rhqzywqsfjzjzbfqlyqf/auth/providers)
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. Toggle **Enable Sign in with Google**
5. Paste your **Client ID** and **Client Secret** from Google Cloud Console
6. Click **Save**

---

## Part 3: Frontend Implementation

The frontend code has been updated with Google login button. You just need to:

1. Ensure the Supabase configuration is complete (Steps 1 & 2 above)
2. The login page will automatically show the Google login button
3. Users can click "Continue with Google" to sign in

---

## Testing

1. Go to your login page: `http://localhost:5173/login`
2. Click "Continue with Google"
3. You'll be redirected to Google's login page
4. After successful login, you'll be redirected back to your app
5. User profile will be automatically created in Supabase

---

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure the redirect URI in Google Cloud Console matches exactly:
  `https://rhqzywqsfjzjzbfqlyqf.supabase.co/auth/v1/callback`

### "Provider not enabled" error
- Verify Google provider is enabled in Supabase Dashboard
- Check that Client ID and Secret are correctly entered

### User not created in database
- Check Supabase Auth logs: Dashboard → Authentication → Users
- Verify RLS policies allow user creation

---

## Production Setup

For production (when deployed), add your production domain to:

1. **Google Cloud Console** → Authorized redirect URIs:
   ```
   https://yourdomain.com/auth/callback
   ```

2. **Supabase Dashboard** → Site URL:
   ```
   https://yourdomain.com
   ```
