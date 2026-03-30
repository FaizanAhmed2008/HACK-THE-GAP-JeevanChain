# 📋 JeevanChain Auth - Quick Setup Checklist

## ⏱️ Estimated Time: 5-10 minutes

---

## ✅ PHASE 1: GET SUPABASE CREDENTIALS (2 mins)

- [ ] Open https://supabase.com/dashboard
- [ ] Select project: **gpsbeayfslomkeurbiyv**
- [ ] Click **Settings** → **API**
- [ ] Find "Project API keys" section
- [ ] Find the **`anon`** key (labeled "public")
- [ ] Click **Copy** button (don't manually copy)
- [ ] Key starts with: `sb_publishable_*`
- [ ] Key length: ~100+ characters
- [ ] Open file: `app/.env.local`
- [ ] Replace truncated key:
  ```
  OLD: VITE_SUPABASE_ANON_KEY=sb_publishable_PgXqh1REaYUJCuTW086Gew_YDUiwBI_
  NEW: VITE_SUPABASE_ANON_KEY=sb_publishable_[PASTE_FULL_KEY]
  ```
- [ ] Verify key is NOT ending with `BI_` (that was truncated)
- [ ] Save `.env.local`

---

## ✅ PHASE 2: CREATE DATABASE SCHEMA (2 mins)

- [ ] Go to Supabase Dashboard
- [ ] Click **SQL Editor**
- [ ] Click **New Query**
- [ ] Open file: `app/supabase.sql`
- [ ] Copy ALL file contents (entire file)
- [ ] Paste into SQL Editor query box
- [ ] Click **Run** button (big blue button)
- [ ] Wait for success message
- [ ] See green checkmark ✅

**Verify tables created:**
- [ ] In SQL Editor, run:
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' ORDER BY table_name;
  ```
- [ ] See 5 tables:
  - [ ] `audit_logs`
  - [ ] `birth_records`
  - [ ] `certificates`
  - [ ] `death_records`
  - [ ] `profiles`

---

## ✅ PHASE 3: TEST AUTH (3 mins)

Open Terminal:
```powershell
cd app
npm run dev
```

Wait for dev server to start (shows: `localhost:5173`)

Open Browser:
```
http://localhost:5173/signup
```

**Test Signup:**
- [ ] See SignUp form
- [ ] See yellow banner: **"Demo Mode Active"**
- [ ] Fill in form:
  - Full Name: `Test User`
  - Email: `test@demo.com`
  - Role: Select any (e.g., Citizen)
  - Password: `password123`
- [ ] Click **"Create Account"**
- [ ] Should redirect to dashboard within 2-3 seconds
- [ ] No red error box should appear

**Check Browser Console (F12 → Console tab):**
- [ ] Should see multiple logs starting with `[AUTH`
- [ ] Look for:
  ```
  [AUTH ...] SIGNUP_START
  [AUTH ...] SIGNUP_DEMO_MODE
  [AUTH ...] SIGNUP_DEMO_SUCCESS
  ```
- [ ] NO ERROR logs (logs starting with "ERROR:")

**If red error box appears:**
- [ ] Check console for exact error
- [ ] Most common: Anon key still truncated
- [ ] Solution: Get complete key from Supabase

---

## ✅ PHASE 4: VERIFY REAL SUPABASE (3 mins)

Once demo mode works, we need to verify real Supabase is configured.

**If still seeing "Demo Mode Active":**
- [ ] Anon key is still truncated or empty
- [ ] Go back to Phase 1
- [ ] Get complete anon key (should be very long)

**Once real mode activates:**
- [ ] Yellow banner should disappear
- [ ] Console logs should show:
  ```
  [AUTH ...] SIGNUP_SUPABASE_AUTH_CALL
  [AUTH ...] SIGNUP_AUTH_SUCCESS {userId: "real-uuid"}
  [AUTH ...] SIGNUP_PROFILE_CREATED
  ```

---

## 🎯 Expected Results

### Demo Mode (First Test)
```
✅ Yellow banner: "Demo Mode Active"
✅ Signup button creates account instantly
✅ Redirects to dashboard
✅ No database queries (localStorage only)
✅ Console logs: SIGNUP_DEMO_MODE
```

### Real Supabase (After Full Setup)
```
✅ No yellow banner
✅ Signup button waits 1-2 seconds
✅ Actually creates user in Supabase Auth
✅ Actually creates profile in DB
✅ Redirects to dashboard
✅ Real session token created
✅ Console logs: SIGNUP_SUPABASE_AUTH_CALL
```

---

## ❌ COMMON ISSUES

### Issue: Still showing "Demo Mode Active"
**Cause:** Anon key is empty or truncated
**Solution:**
1. Check `.env.local` - is key very long (~100+ chars)?
2. Get fresh key from Supabase Dashboard
3. Restart dev server: press `Ctrl+C`, then `npm run dev`

### Issue: "Could not find the table 'public.profiles'"
**Cause:** SQL schema not executed
**Solution:**
1. Copy all of `app/supabase.sql`
2. Paste into Supabase SQL Editor
3. Click Run button
4. Wait for success

### Issue: Red error box on signup
**Cause:** Multiple possible (check console logs)
**Solutions:**
- If `isDemoMode: false` AND error: Need full anon key
- If `ERROR: SIGNUP_PROFILE_CREATE_FAILED`: Need to run SQL schema
- If "Invalid credentials": Email format issue

### Issue: No logs in console
**Cause:** Console tab not open or wrong tab
**Solution:**
1. Press F12 (opens DevTools)
2. Click **Console** tab
3. Filter by typing: `AUTH`
4. Try signup again

---

## ✅ SUCCESS INDICATORS

- [ ] Signup completes without error
- [ ] Dashboard loads with user info
- [ ] No red error boxes
- [ ] Console has `[AUTH` logs
- [ ] Can refresh page and stay signed in
- [ ] Page reload still shows logged-in state

---

## 🎉 ALL DONE!

Once all checkboxes are checked:

1. Your auth system is working ✅
2. Demo mode provides fallback ✅
3. Real Supabase auth is configured ✅
4. Database is ready for data ✅

**Next Phase:** Build role-based dashboards (Hospital, Registrar, Officer, Admin, Citizen)

See `app/ARCHITECTURE.md` for implementation roadmap.

---

## 📞 Getting Help

**If stuck, check:**
1. Browser console for `[AUTH` logs (press F12)
2. `.env.local` for complete anon key (not ending with `BI_`)
3. Supabase Dashboard - verify tables exist
4. Files in `app/` directory for guidance

**Most common fix:** Get complete anon key from Supabase Dashboard (Phase 1)
