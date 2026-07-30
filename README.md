# Purple Giraffe System Review — Feedback Tool

This is the reviewable version of the System Review document, with sign-in,
highlighting, and comments. This README walks you through putting it online
so the comments are saved permanently, even if everyone closes their browser.

You do not need to know how to code. You just need to follow the steps below,
which are mostly clicking buttons on two free websites (Vercel and Supabase).

## What's in this folder

- `index.html` — the tool itself (the document, sign-in screen, highlighting and comments panel)
- `api/comments.js` — a small helper that saves and loads the comments
- `package.json` — a small file Vercel needs, you don't need to touch it

## Why this needs two accounts

- **Vercel** hosts the website itself (so people can open a link in their browser).
- **Supabase** is where the comments actually get saved, so they survive even
  after everyone closes the tab. Both have a free tier, and neither needs a
  credit card for the size of use this tool needs.

## Step 1 — Create the storage (Supabase)

1. Go to **supabase.com** and sign up for a free account (you can sign up with GitHub).
2. Click **New project**. Give it any name (e.g. `pg-review-tool`), set a database password (you won't need to remember it for this), pick a region close to Australia, and click **Create new project**. It takes a minute or two to spin up.
3. Once it's ready, click **SQL Editor** in the left menu, click **New query**, paste in the following, and click **Run**:

   ```sql
   create table comments (
     id text primary key,
     author text not null,
     ts bigint not null,
     quote text not null,
     body text not null,
     tab text,
     occurrence_index integer default 0
   );
   ```

   This creates the table that holds every comment.
4. Click **Project Settings** (the gear icon) in the left menu, then **API**.
5. You'll see a **Project URL** and, under **Project API keys**, a key labelled **service_role** (click "Reveal" to see it). Keep this page open — you'll copy both of these into Vercel in Step 3.

   The service_role key is powerful (it can read and write anything), so it
   only ever goes into Vercel's environment variables in Step 3 — it's never
   put in the page itself or shown to the people using the tool.

## Step 2 — Put this project online (Vercel)

1. Go to **vercel.com** and sign up for a free account.
2. Click **Add New... > Project**.
3. Vercel will ask you to import a project. The simplest way is to upload this folder directly:
   - If you're offered a "browse" or drag-and-drop option, drag this whole `pg-review-tool` folder in.
   - If Vercel only offers to connect a GitHub repository, upload this folder to a new GitHub repository first (create a free GitHub account, click **New repository**, then use the **uploading an existing file** option to drag all these files in), then import that repository into Vercel.
4. Click **Deploy**. It will finish in under a minute. Don't worry that comments won't work yet — that's Step 3.

## Step 3 — Connect the storage to the website

1. In your new Vercel project, click **Settings**, then **Environment Variables** in the left menu.
2. Add a new variable:
   - Name: `SUPABASE_URL`
   - Value: paste the **Project URL** you copied from Supabase in Step 1
3. Add a second variable:
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: paste the **service_role** key you copied from Supabase in Step 1
4. Go to the **Deployments** tab, click the three dots next to the latest deployment, and choose **Redeploy**. This makes the site pick up the two values you just added.

## Step 4 — Use it

Open the web address Vercel gives you (something like `pg-review-tool.vercel.app`)
and share that link with your team. Everyone signs in with:

- Username: `suba`
- Password: `suba`
- Their own name (so you can see who left each comment)

From then on:
- Selecting any text in the document shows an **Add comment** button.
- Every comment appears in the panel on the right, with the person's name and
  a **Go to it** button that jumps straight to that highlight.
- Comments are now saved on the server, so they'll still be there the next
  time anyone opens the link — including after closing the browser entirely.

## If something looks wrong

If comments stop loading or saving, the tool shows a small red banner at the
top explaining the problem. The most common cause is the two environment
variable values in Step 3 being missing, mistyped, or not yet redeployed —
double-check those first.
