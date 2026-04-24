# RuralRide - Setup & Login Guide

## Quick Start - Demo Accounts

We've added demo login buttons to the Auth page. However, to make them work, you need to complete one of these setups:

### Option 1: Disable Email Verification (Recommended for Development)

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **vzifqpbwrfegzznjedvo**
3. Go to **Authentication** → **Providers** → **Email**
4. Toggle off **"Confirm email"** 
5. Click **Save**

Then:
1. Go to the Auth page in the app
2. Click **"Demo: Rider"** or **"Demo: Driver"** button
3. Accounts will be created automatically on first attempt

**Demo Credentials:**
- Rider: `rider@test.com` / `Test123456`
- Driver: `driver@test.com` / `Test123456`

### Option 2: Manual Signup & Email Verification

1. Click **"Sign up"** on the Auth page
2. Fill in your details (for driver, add vehicle info)
3. You'll receive a confirmation email
4. Click the link in the email to verify
5. Return to the app and login

### Option 3: Create Accounts via Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select project → **Authentication** → **Users**
3. Click **"Add user"**
4. Enter email and password
5. Uncheck "Auto Confirm User" and "Generate Password"
6. Click **"Create new user"**
7. Use these credentials to login

## Troubleshooting

**"Invalid login credentials" error:**
- Make sure the account exists (try signing up first)
- Check if email verification is enabled in Supabase
- Verify you're using the correct email/password

**Can't receive confirmation emails:**
- Check Supabase email templates are configured
- In development, best to disable email confirmation (Option 1)

**Still having issues?**
- Check browser console for detailed error messages
- Ensure Supabase credentials in `.env` are correct
- Try clearing browser cache and localStorage

## Project Structure

- **Frontend**: Vite + React + TypeScript
- **UI Components**: shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS

## Available Roles

- **Rider**: Can request rides, rate drivers
- **Driver**: Can accept rides, track vehicles
- **Admin**: Manages pricing and system settings

Enjoy using RuralRide!
