# Finance App — First-Time Setup Guide

This guide walks you through getting the app running end-to-end. Follow each step in order.

---

## Step 1: Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up for a free account (if you don't have one).
2. Click **"New project"**.
3. Give it a name (e.g. `finance-app`) and choose a region close to you.
4. Set a strong database password and save it somewhere safe.
5. Wait about 60 seconds for the project to finish provisioning.

---

## Step 2: Get your API keys

1. In your Supabase project dashboard, click **"Settings"** (gear icon, left sidebar).
2. Click **"API"** under the Project Settings section.
3. You need two values:
   - **Project URL** — looks like `https://abcdefghijkl.supabase.co`
   - **anon / public key** — a long string starting with `eyJ...`

Keep this browser tab open — you'll need these in Step 4.

---

## Step 3: Run the database migrations

This creates all the tables and security policies for your app.

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar.
2. Click **"New query"**.
3. Open the file `supabase/migrations/001_initial_schema.sql` from this project in any text editor.
4. Copy the entire contents and paste it into the SQL editor.
5. Click **"Run"**. You should see "Success. No rows returned."
6. Repeat steps 2-5 for `supabase/migrations/002_rls_policies.sql`.

---

## Step 4: Add your API keys to the app

1. Open the file `apps/web/.env.local` in a text editor.
2. Replace the placeholder values with your real keys from Step 2:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

Save the file. **Never commit this file to git** — it's already in `.gitignore`.

---

## Step 5: Install dependencies and run locally

Open your terminal, navigate to the `finance-app` folder, and run:

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install all dependencies
pnpm install

# Start the development server
pnpm dev
```

The app will be running at [http://localhost:3000](http://localhost:3000).

Try signing up with your email — you'll get a confirmation email from Supabase. Click the link, then sign in.

---

## Step 6: Deploy to Vercel (optional, but recommended)

Vercel is free for personal projects and handles deploys automatically.

1. Push your code to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit — finance app foundation"
   # Create a repo on github.com, then:
   git remote add origin https://github.com/YOUR_USERNAME/finance-app.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) and sign up (free).
3. Click **"Add New Project"** and import your GitHub repository.
4. Vercel will detect it's a Next.js app automatically. Before clicking "Deploy":
   - Click **"Environment Variables"**
   - Add `NEXT_PUBLIC_SUPABASE_URL` with your Supabase project URL
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your anon key
5. Click **"Deploy"**. Your app will be live at a `.vercel.app` URL in about 60 seconds.

---

## Troubleshooting

**"Invalid API key" or auth not working:**  
Double-check that `apps/web/.env.local` has the correct URL and anon key (not the service key).

**Emails not arriving after signup:**  
Check your spam folder. Supabase sends from `noreply@mail.supabase.io`.

**Database errors after login:**  
Make sure you ran both SQL migration files in the correct order (001 first, then 002).

**pnpm not found:**  
Run `npm install -g pnpm` first, then retry.
