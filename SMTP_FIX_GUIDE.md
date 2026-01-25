# Fixing Email Delivery Issues (Brevo + Supabase)

Since you are using Brevo (formerly Sendinblue) SMTP and emails are not arriving, the issue is almost certainly a configuration mismatch or a "Sender Identity" issue.

### 1. The #1 Cause: "Sender Email" Mismatch
Brevo rejects emails if the "From" address does not match a **verified sender** or **verified domain** in your Brevo account.

**How to fix:**
1. Go to **Brevo Dashboard** > **Senders & IP**.
2. Check what email is listed there (e.g., `helpatkelasa@gmail.com` or `noreply@yourdomain.com`).
3. Go to **Supabase Dashboard** > **Authentication** > **Email Templates**.
4. **CRITICAL**: The **"From email"** field MUST match the verified email in Brevo.
   - If Brevo verified `admin@myapp.com`, Supabase MUST send as `admin@myapp.com`.
   - If you are testing with `helpatkelasa@gmail.com`, ensure that exact Gmail address is verified in Brevo Senders.

### 2. Check Redirect URLs
Supabase will block emails if the `redirectTo` URL is not whitelisted.

1. In your project code, we are sending: `${window.location.origin}/update-password` (e.g., `http://localhost:5173/update-password`).
2. Go to **Supabase Dashboard** > **Authentication** > **URL Configuration**.
3. Under **Redirect URLs**, ensure you have:
   - `http://localhost:5173`
   - `http://localhost:5173/**` (Wildcard is recommended for nested routes)
   - If accessing via IP (e.g. `192.168.x.x`), add that too.

### 3. Verify SMTP Credentials
Double check these in **Supabase > Project Settings > Authentication > SMTP Settings**:

- **Host**: `smtp-relay.brevo.com` (or `smtp-relay.sendinblue.com`)
- **Port**: Try `587` (StartTLS) first. If that fails, try `465` (SSL).
- **User**: Your Brevo login email (usually).
- **Password**: Your **SMTP Key** (NOT your login password). You generate this in Brevo under **SMTP & API**.

### 4. Check Supabase Logs
1. Go to **Supabase Dashboard** > **Authentication** > **Logs**.
2. Look for "Auth" logs.
3. If Supabase successfully handed off the email to Brevo, you will see a `200` status.
4. If you see `200` but no email, the issue is **strictly inside Brevo** (Logs/Events tab in Brevo will show if it was "Dropped" or "Deferred").
