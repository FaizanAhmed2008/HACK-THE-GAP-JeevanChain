# 🔐 JeevanChain Authentication - Debug & Setup Guide

## 🚨 CRITICAL ISSUE FOUND

Your `.env.local` file has a **TRUNCATED Supabase Anon Key**:

```
VITE_SUPABASE_ANON_KEY=sb_publishable_PgXqh1REaYUJCuTW086Gew_YDUiwBI_
```

❌ **WRONG** - Key ends abruptly at `BI_` (only ~40 chars)
✅ **CORRECT** - Should be ~100+ base64 characters

---

## 📋 ROOT CAUSE ANALYSIS

| Issue | Impact | Status |
|-------|--------|--------|
| Truncated Anon Key | Auth client initialization fails | 🔴 CRITICAL |
| Missing `profiles` table | Signup profile creation fails | 🔴 CRITICAL |
| Missing `certificates` table | Certificate operations crash | 🔴 CRITICAL |
| Missing birth/death tables | Lifecycle records crash | 🔴 CRITICAL |
| No RLS policies | Security vulnerabilities | 🟡 WARNING |

---

## 🔧 STEP 1: Get Complete Supabase Anon Key

### Option A: Via Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: **gpsbeayfslomkeurbiyv**
3. Click **Settings** → **API**
4. Under "Project API keys", find **`anon`** key (public)
5. Copy the COMPLETE key (click copy button, not manual select)
6. Paste into `.env.local`

### Option B: Via Supabase CLI

```powershell
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Get your anon key
supabase projects list
supabase projects api-show gpsbeayfslomkeurbiyv
```

### ⚠️ IMPORTANT

- **DO NOT edit** the key manually
- **DO NOT** use truncated keys
- The full key is: `sb_publishable_` + ~80 more base64 characters
- Example full key (NOT real): `sb_publishable_PgXqh1REaYUJCuTW086Gew_YDUiwBI_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z...`

---

## 🔧 STEP 2: Create Database Schema

### Run SQL in Supabase

1. Go to Supabase Dashboard → Your Project
2. Click **SQL Editor**
3. Click **New Query**
4. Open file: `app/supabase.sql`
5. Copy ALL contents
6. Paste into query editor
7. Click **Run**

**This creates:**
- ✅ `public.profiles` table
- ✅ `public.certificates` table
- ✅ `public.birth_records` table
- ✅ `public.death_records` table
- ✅ `public.audit_logs` table
- ✅ RLS policies
- ✅ Indexes
- ✅ Auto-update triggers

### Verify Tables Exist

```sql
-- Run in SQL Editor to verify
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected output:
```
audit_logs
birth_records
certificates
death_records
profiles
```

---

## 🔧 STEP 3: Update `.env.local`

```env
VITE_SUPABASE_URL=https://gpsbeayfslomkeurbiyv.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_[PASTE_FULL_KEY_HERE]
```

---

## 🔧 STEP 4: Test Auth Flow

### Terminal 1: Start Dev Server

```powershell
cd app
npm run dev
```

Your app should open at `http://localhost:5173`

### Test Signs (in order)

#### Test 1: Signup with Demo Fallback
1. Click "Sign Up"
2. Fill form:
   - Full Name: `Test Hospital`
   - Email: `test@hospital.com`
   - Role: `Hospital`
   - Password: `password123`
3. Expected:
   - ✅ Yellow banner shows "Demo Mode Active"
   - ✅ Redirects to dashboard
   - ✅ Profile loads with hospital role

#### Test 2: Verify Real Supabase is NOT Active
1. Open Browser DevTools → Console
2. Look for logs starting with `[AUTH`
3. You should see:
   ```
   [AUTH 2024-03-30T] SIGNUP_START {email: "test@hospital.com", role: "hospital", isDemoMode: true}
   [AUTH 2024-03-30T] SIGNUP_DEMO_MODE
   [AUTH 2024-03-30T] SIGNUP_DEMO_SUCCESS {userId: "demo-hospital-..."}
   ```

#### Test 3: Once Real Supabase Works
1. Fix `.env.local` with real key
2. Restart dev server
3. Signup again - should see:
   ```
   [AUTH 2024-03-30T] SIGNUP_START {isDemoMode: false}
   [AUTH 2024-03-30T] SIGNUP_SUPABASE_AUTH_CALL
   [AUTH 2024-03-30T] SIGNUP_AUTH_SUCCESS {userId: "UUID..."}
   [AUTH 2024-03-30T] SIGNUP_PROFILE_CREATED
   ```

---

## 🐛 DEBUG LOGGING

The auth system now includes comprehensive logging. Check DevTools Console for:

### Signup Flow
```
[AUTH ...] SIGNUP_START
[AUTH ...] SIGNUP_SUPABASE_AUTH_CALL
[AUTH ...] SIGNUP_CREATING_PROFILE
[AUTH ...] SIGNUP_PROFILE_CREATED
[AUTH ...] SIGNUP_COMPLETE_SUCCESS
```

### Signin Flow
```
[AUTH ...] SIGNIN_START
[AUTH ...] SIGNIN_SUPABASE_AUTH_CALL
[AUTH ...] SIGNIN_AUTH_SUCCESS
[AUTH ...] SIGNIN_PROFILE_LOADED
```

### Auth Init
```
[AUTH ...] AUTH_INIT_START
[AUTH ...] AUTH_INIT_SESSION_FOUND
[AUTH ...] AUTH_INIT_SESSION_PROFILE_LOADED
```

### Errors (Logged as `ERROR:`)
```
[AUTH ...] ERROR: SIGNUP_PROFILE_CREATE_FAILED
[AUTH ...] ERROR: SIGNIN_AUTH_FAILED
```

---

## 📊 Expected Auth Flow

```
┌─────────────────────────────────────────────┐
│ User Clicks "Sign Up"                       │
└──────────────────┬──────────────────────────┘
                   ↓
        ┌─────────────────────┐
        │ Check isDemoMode?   │
        └──────────┬──────────┘
                   │
         ┌─────────┴─────────┐
         ↓                   ↓
    [YES] Demo          [NO] Real Supabase
         ↓                   ↓
    Create in         Call auth.signUp()
    localStorage      ↓
         │         Create profile in DB
         │         ↓
         │         Check session
         │         ↓
         └─────────┴─────────┐
                   ↓
        Set user state
        Set session=true
        Redirect to dashboard
```

---

## 🧪 Quick Troubleshooting

### Problem: Still seeing "Demo Mode Active"
**Cause:** `.env.local` has empty or invalid Supabase keys

**Fix:**
1. Check `.env.local` - paste COMPLETE anon key
2. Restart dev server: `npm run dev`

### Problem: "Could not find the table 'public.profiles'"
**Cause:** Database schema not created

**Fix:**
1. Run SQL from `app/supabase.sql`
2. Verify tables exist
3. Restart dev server

### Problem: Email/password rejected on signin
**Cause:** Email not confirmed or invalid credentials

**Fix:**
1. Use demo mode for testing (see SignIn page hints)
2. Or check Supabase Auth settings for email confirmation

### Problem: Profile visible but role is wrong
**Cause:** Metadata not passed during signup

**Fix:**
1. Check SignUpPage.tsx - role selection
2. Verify AuthContext signUp passes metadata
3. Check Supabase Auth user metadata in dashboard

---

## 📝 Files Modified

| File | Changes |
|------|---------|
| `src/features/auth/AuthContext.tsx` | ✅ Added DEBUG logging, error handling, session recovery |
| `src/lib/supabase.ts` | ℹ️ No changes (working) |
| `src/features/auth/SignUpPage.tsx` | ℹ️ No changes (working) |
| `src/features/auth/SignInPage.tsx` | ℹ️ No changes (working) |
| `.env.local` | ⚠️ FIX: Paste complete anon key |

---

## 🚀 Next Steps After Auth is Fixed

1. ✅ Verify signup/login work with real Supabase
2. ✅ Test session persistence (refresh page, still logged in)
3. ✅ Build role-based dashboards:
   - Hospital dashboard
   - Registrar dashboard
   - Officer dashboard
   - Admin dashboard
4. ✅ Implement birth record flow
5. ✅ Implement death record flow
6. ✅ Add blockchain-like hashing
7. ✅ Add audit logging

---

## 🆘 Still Having Issues?

Check the console logs with `[AUTH` prefix. The timestamp and log level tell you exactly where auth failed. Share those logs and I can pinpoint the issue.

**Common log patterns:**

- `SIGNUP_DEMO_MODE` → Demo fallback active (need real Supabase key)
- `ERROR: SIGNUP_PROFILE_CREATE_FAILED` → `profiles` table missing
- `ERROR: SIGNIN_AUTH_FAILED` → Wrong credentials or auth issue
- `SIGNUP_NO_SESSION_CREATED` → Email confirmation required

---

## 📚 Reference

- **Supabase Docs:** https://supabase.com/docs
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Your Project:** gpsbeayfslomkeurbiyv
- **Project URL:** https://gpsbeayfslomkeurbiyv.supabase.co
