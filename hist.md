# Project History & Memory Log

## Project Overview
- **Name:** Gigz / Kellasa
- **Stack:** React, Vite, Tailwind CSS, Supabase (Auth, DB, Storage, Realtime), Capacitor (Mobile).
- **Core Functionality:** Gig finding platform, Professional Profiles, Admin Dashboard, Messaging.

## 1. Features Implemented

### A. Professional Profiles
- **Creation/Editing:** Users can create *one* professional profile (`CreateProfessionalProfile.jsx`).
- **Data:** Bio, hourly/project rates, location, willing to travel, skills, certifications, portfolio images.
- **Constraints:** 
    - Enforced 1 profile per user via Database UNIQUE constraint (`migration_enforce_single_professional.sql`).
    - **KYC Block:** Users must be 'verified' in `profiles.kyc_status` to create a professional profile.
- **Features:**
    - **Delete Option:** Users can delete their profile.
    - **Contact for Pricing:** Checkbox to hide hourly rate and show "Contact for Pricing".
    - **Direct Messaging:** "Message" button links to `/messages?userId=...` to auto-start chat.

### B. Admin Dashboard
- **Route:** `/admin`
- **Access Control:** Restricted to `nsjdfmjr@gmail.com` via frontend check (should be enforced via RLS policy for critical actions).
- **Tabs:**
    - **Overview:** Stats (Total Users, Gigs).
    - **Push Notifications:** Send Broadcast messages.
    - **Users/Gigs/CMS/KYC:** (Existing stubs/implementations).

### C. Broadcast Notifications
- **System:** Admin allows sending global push/toast notifications.
- **Backend:** `notifications` table. `is_global` flag added. RLS updated to allow reading global messages.
- **Frontend:** `BroadcastListener.jsx` (mounted in `Layout.jsx`) listens to Realtime `INSERT` on `notifications`.
- **UI:** Admin form allows Title + Message input.

### D. PWA (Progressive Web App)
- **Plugin:** `vite-plugin-pwa` added.
- **Config:** `vite.config.js` updated to generate Service Worker.
- **Status:** ready for "Add to Home Screen" (requires icons in `public/`).

### E. UI/UX Improvements
- **Fixed Bottom Nav Conflict:**
    - Increased `Layout` bottom padding to `pb-28` to clear the floating island on all pages.
    - Adjusted `Messages` page height to `calc(100vh - 180px)` on mobile so the chat input floats *above* the navigation.

### F. Admin & Home Customization
- **Admin CMS:** Added "Home Page" section to customize Hero Headline, Subheadline, Image, Button Texts, and Feature Cards (3x).
- **Home Page:** Added "Hire Pros" button to Hero and integrated CMS settings for dynamic content.
- **Admin Professionals:** Added "Professionals" tab to Admin Dashboard to list, search, and delete professional profiles.

### G. Professional Profile Enhancements
- **Professions List:** Created `professions.js` constant with extensive list of categories (Trades, Tech, Events, etc.).
- **Searchable Dropdown:** Replaced simple select with a custom Searchable Dropdown in `CreateProfessionalProfile.jsx`.
- **Custom Profession:** Added "Other" option allowing users to specify a profession not in the list.

### H. Professional Activation Fee
- **Monetization:** Implemented a ₹99 one-time fee to unlock professional profile creation.
- **Payment Gate:** Integrated Cashfree payment flow; new users MUST pay to create a profile.
- **Success Handling:** Updated `SubscriptionSuccess.jsx` to activate the professional account upon successful payment.
- **Payment Phone Handling:** Added phone number confirmation input to the payment screen to ensure valid contact details are used.

---

## 2. Database Migrations (SQL)

All migrations are located in `/supabase` folder. **Crucial:** These must be run in Supabase SQL Editor.

1.  **`migration_add_kyc_status.sql`**: Adds `kyc_status` column to `profiles`.
2.  **`migration_professional_storage.sql`**: Sets up Storage buckets `professional_assets` and policies.
3.  **`migration_broadcast_notifications.sql`**:
    - Adds `is_global`, `sender_id`, `title`, `message` to `notifications`.
    - Updates RLS to allowing viewing global notifications.
    - **Fix:** Drops restrictive `notifications_type_check` constraint.
4.  **`migration_enforce_single_professional.sql`**: Adds `UNIQUE(user_id)` constraint to `professional_profiles`.
5.  **`migration_add_pricing_option.sql`**: Adds `contact_for_pricing` boolean column.

---

## 3. Errors Encountered & Solutions

### A. ReferenceError in CreateProfessionalProfile
- **Issue:** `fetchExistingProfile` was being called before initialization due to early `return` statements.
- **Fix:** Moved `authLoading` and `kyc_status` checks to the **end** of the component, just before the JSX return.

### B. Minified React Error #306 (Lazy Load)
- **Issue:** The `AdminDashboard.jsx` file became **empty (0 bytes)** during an edit, causing `lazy(() => import(...))` to return `undefined`.
- **Fix:** Restored the file content completely.
- **Lesson:** Always verify file integrity after complex edits.

### C. "Missing title column" in Notifications
- **Issue:** The code tried to insert `title` into `notifications`, but the column didn't exist in the live DB.
- **Fix:** Updated `migration_broadcast_notifications.sql` to explicitly `ADD COLUMN IF NOT EXISTS title type text`.

### D. "Policy already exists" Error
- **Issue:** Rerunning migration failed because RLS policy names collided.
- **Fix:** Added `DROP POLICY IF EXISTS ...` before creating policies in the migration script.

### E. "Violates check constraint notifications_type_check"
- **Issue:** Sending a broadcast with `type: 'system_broadcast'` failed because the DB had a strict check constraint on allowed types.
- **Fix:** Added `ALTER TABLE notifications DROP CONSTRAINT notifications_type_check` to the migration.

### F. Import Error "AdminNotifications"
- **Issue:** `AdminNotifications.jsx` was also found to be 0 bytes.
- **Fix:** Restored the file content.

---

## 4. Current Configuration
- **Permissions:** Admin email is hardcoded in `AdminDashboard.jsx`.
- **Realtime:** Enabled for `notifications` and `messages`.
- **Mobile:** App is built via Capacitor (`@capacitor/core`). Updates require `npm run build && npx cap sync`.

## 5. Next Steps / Todo
- **PWA Icons:** Add `pwa-192x192.png` and `pwa-512x512.png` to `/public`.
- **Fix Notification Loop:** Wrapped `refreshProfile` in `AuthContext` with `useCallback` to prevent infinite re-renders.
- **Fix Notification Loop:** Wrapped `refreshProfile` in `AuthContext` with `useCallback` to prevent infinite re-renders.
- **Real-Time Payment Check:** Updated `CreateProfessionalProfile` to fetch payment status directly from database to avoid context caching latency.
- **Secure Verification:** Added server-side payment verification (Edge Function) to prevent 'false success' on cancelled or failed payments.
- **Verification:** Ensure the "One Profile" constraint doesn't fail on production data (clean up duplicates first).
