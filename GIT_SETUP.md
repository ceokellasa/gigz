# How to Fix GitHub Authentication

GitHub no longer accepts your account password for command line access. You must use a **Personal Access Token (PAT)** instead.

## Step 1: Generate a Token
1.  Log in to your GitHub account in your browser.
2.  Go to **Settings** (click your profile photo in top right).
3.  Scroll down to **Developer settings** (at the very bottom of the left sidebar).
4.  Click **Personal access tokens** -> **Tokens (classic)**.
5.  Click **Generate new token** -> **Generate new token (classic)**.
6.  **Note**: Give it a name like "MacBook Git".
7.  **Expiration**: Set to "No expiration" or 90 days.
8.  **Select scopes**: Check the box for **`repo`** (this is required to push code).
9.  Click **Generate token**.
10. **COPY THE TOKEN starting with `ghp_...`**. You won't see it again!

## Step 2: Use the Token
Now, go back to your terminal and run the push command again:

```bash
git push -u origin main
```

- **Username**: Enter your GitHub username (`ceokellasa`).
- **Password**: **PASTE THE TOKEN** you just copied. (You won't see characters appears as you paste, that's normal).
- Press Enter.

## Troubleshooting
If it still says "Permission denied", you might need to update the remote URL to include the token directly (not recommended for shared computers, but easier):

```bash
git remote set-url origin https://<YOUR_TOKEN>@github.com/ceokellasa/gigz.git
```
(Replace `<YOUR_TOKEN>` with the generic token).
