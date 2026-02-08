# 📱 How to Publish Your KELLASA App to Google Play Store

This guide will walk you through turning your existing code into an Android App and publishing it to the Google Play Store.

## 🛠️ Prerequisites

1.  **Download Android Studio**: It's free from [developer.android.com/studio](https://developer.android.com/studio).
2.  **Google Play Console Account**: You need a developer account ($25 one-time fee) to publish apps.

---

## 🚀 Step 1: Open Your App in Android Studio

1.  Open **Android Studio**.
2.  Click **"Open"** (or File > Open).
3.  Navigate to your project folder: `c:\Users\User\Desktop\1\gigz\android`.
4.  Select the **`android`** folder and click OK.
5.  Wait for it to "Sync" (configure itself). This might take a few minutes the first time.

---

## 🧪 Step 2: Test on Your Phone (Debug APK)

Before publishing, you should run it on a real phone.

1.  Enable **Developer Mode** on your Android phone (Settings > About Phone > Tap "Build Number" 7 times).
2.  Enable **USB Debugging** in Developer Options.
3.  Connect your phone to your PC via USB.
4.  In Android Studio, you should see your phone's name in the top dropdown bar.
5.  Click the green **Run (▶️)** button.
6.  The app will install and open on your phone!

---

## 📦 Step 3: Build the Production Bundle (AAB)

The Play Store requires an **Android App Bundle (.aab)** file, not an APK.

1.  In Android Studio, go to the top menu: **Build** > **Generate Signed Bundle / APK**.
2.  Select **Android App Bundle** and click **Next**.
3.  **Key Store Path**: Click "Create new...".
    *   **Path**: Save it somewhere safe (e.g., inside your project folder as `release-key.jks`).
    *   **Password**: Create a strong password (keep this safe! You need it to update the app later).
    *   **Key Alias**: `key0` (default is fine).
    *   **Certificate**: Fill in your Name/Company details.
    *   Click **OK**.
4.  Enter the passwords you just created and click **Next**.
5.  Select **release** variant.
6.  Click **Create**.

Android Studio will now build your app. Once done, a popup will appear at the bottom right. Click **"locate"** to find your `.aab` file.

---

## 🌐 Step 4: Upload to Google Play Console

1.  Go to [Google Play Console](https://play.google.com/console).
2.  Click **Create App**.
3.  Fill in the details:
    *   **App Name**: KELLASA - Right Work For You
    *   **Language**: English
    *   **App or Game**: App
    *   **Free or Paid**: Free
4.  Accept the declarations and create.
5.  On the dashboard, complete the **"Set up your app"** tasks (Privacy Policy, App Content, etc.).
    *   **Privacy Policy URL**: Use your website link `https://kellasa.online/privacy` (you might need to create this simple page).
6.  Go to **Production** (sidebar) > **Create new release**.
7.  Upload the **.aab file** you generated in Step 3.
8.  Add release notes (e.g., "Initial Release").
9.  Click **Next**, review any warnings, and click **Start Rollout to Production**.

🎉 **Congratulations!** Google will review your app (usually takes 1-3 days), and then it will be live for the world to download!

---

## 🔄 How to Update Your App Later

When you change your code (e.g., add new features):

1.  Run this command in your VS Code terminal:
    ```bash
    npm run build
    npx cap sync android
    ```
2.  Open **Android Studio** again.
3.  Repeat "Step 3" above to generate a new signed bundle.
    *   **Important**: You MUST increase the `versionCode` in `android/app/build.gradle` (or do it in Project settings) before building, or the Play Store will reject the update.
4.  Upload the new `.aab` to Play Console.
