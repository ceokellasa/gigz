# How to Deploy to Netlify via GitHub (Automatic Updates)

Since you want your site to automatically update when you change code, you need to connect your local project to **GitHub**, and then connect **GitHub to Netlify**.

## Phase 1: Install Git (Required)
It seems **Git is not installed** on your computer (or not reachable).
1. Download Git: [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Install it (keep clicking "Next" with default settings).
3. **Restart your terminal** (or VS Code) after installation.

## Phase 2: Push Your Code to GitHub
Once Git is installed, run these commands in your terminal (inside the `gigz` folder):

```bash
# 1. Initialize Git
git init

# 2. Add all files (we already secured .env)
git add .

# 3. Commit your changes
git commit -m "Initial commit of Gigz app"

# 4. Connect to GitHub
# Go to https://github.com/new and create a repository named 'gigz'
# Then run the commands GitHub gives you, typically:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gigz.git
git push -u origin main
```

## Phase 3: Connect Netlify to GitHub
1. Go to [https://app.netlify.com/](https://app.netlify.com/) and Log in.
2. Click **"Add new site"** > **"Import from an existing project"**.
3. Choose **GitHub**.
4. Authorize Netlify to access your GitHub account.
5. Select your `gigz` repository.

## Phase 4: Configure Build Settings
Netlify should detect these automatically, but ensure they are correct:

- **Build Command**: `npm run build`
- **Publish Directory**: `dist`

### Environment Variables (CRITICAL)
Your app needs Supabase keys to work. You must add them to Netlify:
1. In Netlify, while setting up (or later in Site Settings > Environment variables):
2. Add the following keys (copy them from your local `.env` file):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SITE_URL` (Set this to your Netlify URL, e.g. `https://your-site.netlify.app`)

3. Click **"Deploy Site"**.

## Done!
Now, exactly as you requested:
- Every time you make changes on your PC.
- Run:
  ```bash
  git add .
  git commit -m "Update message"
  git push
  ```
- Netlify will detect the push and **automatically update your live site**.
