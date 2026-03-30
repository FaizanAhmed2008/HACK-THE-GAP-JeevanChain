# 🆘 JeevanChain - Symptom → Diagnosis → Fix Guide

## If you see this 👇, here's what to do:

---

## ❌ Red Error Box: "Signups not allowed for this instance"

### Diagnosis
The truncated Supabase anon key is being used, triggering demo mode fallback OR email confirmation is required.

### Fix
**In 2 steps:**
1. Get full anon key from Supabase Dashboard
2. Update `.env.local`
3. Restart dev server

**Details:**
- Supabase key must be ~100+ characters
- Current key ends with `BI_` - that's WRONG
- Get new key: Dashboard → Settings → API → anon key → Copy button

---

## ❌ Red Error Box: "Could not find the table 'public.profiles' in the schema cache"

### Diagnosis
Database schema tables were not created.

### Fix
**Run SQL in Supabase:**
1. Open Supabase Dashboard → SQL Editor
2. New Query
3. Open `app/supabase.sql`
4. Copy all content
5. Paste into query
6. Click Run
7. Wait for success ✅

---

## ❌ No error, just infinite loading / page doesn't redirect

### Diagnosis
Auth is stuck, either:
- Session storage not working
- Profile fetch failing silently
- No session created after signup

### Fix
**Check browser console (F12):**
1. Open DevTools
2. Go to Console tab
3. Look for `[AUTH` logs
4. Find the last log before it stops
5. If last log is `SIGNUP_AUTH_SUCCESS`, then profile creation failed
   - Fix: Run SQL schema (see previous error)
6. If last log is nothing, check `.env.local` for truncated key

---

## ❌ "Invalid login credentials" on signin

### Diagnosis
Email/password combination doesn't match what was created.

### Fix
**For demo mode:**
Use the emails shown on SignIn page:
- `citizen@demo.com` → for Citizen role
- `hospital@demo.com` → for Hospital role
- `admin@demo.com` → for Admin role
- Any password works in demo mode

**For real Supabase:**
Use exact email and password from signup

---

## ❌ Yellow banner still shows "Demo Mode Active" after fix

### Diagnosis
The anon key is still not recognized.

### Fix
1. Check `.env.local` - is it very short? (ending with `BI_'`)
2. Get fresh anon key from Supabase Dashboard
3. Make sure you used Copy button (not manual copy)
4. Restart dev server:
   ```powershell
   Ctrl+C
   npm run dev
   ```

---

## ⚠️ "Missing mother's identification" rejection

### Diagnosis
Registrar rejected birth record for given reason.

### Fix
**For the system:**
- This is expected behavior (rejection handling)
- Hospital can submit corrected record
- Creates new version (v2) with improvements

**For testing:**
- Use correct test data on next submission

---

## ⚠️ Page refreshed and logged out

### Diagnosis
Session not being persisted correctly.

### Fix
**In demo mode:**
- Session stored in localStorage
- Should persist on refresh
- If still happening: Clear browser cache/cookies

**In real Supabase:**
- Session should be in Supabase cookies
- Should persist on refresh
- If not: Check RLS policies

---

## ⚠️ Console shows "SIGNUP_PROFILE_CREATE_FAILED"

### Diagnosis
Profile table doesn't exist or RLS policies are blocking creation.

### Fix
**Step 1:** Verify table exists
```sql
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'profiles';
```
Should see 1 row.

**Step 2:** If missing, run `app/supabase.sql`

**Step 3:** If table exists, check RLS:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'profiles';
```
Should see RLS policies.

---

## ⚠️ User role always shows as "citizen"

### Diagnosis
Role metadata not being passed or retrieved correctly.

### Fix
**In signup:**
1. Check role selection on SignUpPage
   - Make sure role is selected
   - Check radio/button selection UI
2. Verify metadata passed:
   ```typescript
   // Should show selected role, not default
   options: { data: { role: selectedRole } }
   ```

**In profile loading:**
1. Check profile has correct role from DB
2. If DB shows wrong role: Edit profile in Supabase Dashboard

---

## ⚠️ "Maximum of 5 emails per hour exceeded"

### Diagnosis
You've created 5+ accounts in 1 hour (Supabase rate limit).

### Fix
- Wait 1 hour
- OR use different emailsuper
- OR contact Supabase support for rate limit increase

---

## ⚠️ Very slow signup (takes 30+ seconds)

### Diagnosis
Multiple issues happening:
1. Profile creation is slow
2. Session fetch is slow
3. Auth state listener triggered multiple times

### Fix
1. Check Supabase project status (may be overloaded)
2. Check your internet speed
3. Try again - sometimes temporary

---

## ✅ No errors but nothing happens on signup

### Diagnosis
One of these:
1. Form validation failing silently
2. Button click not triggering
3. Auth state not updating UI

### Fix
**Check browser console:**
```javascript
// Type in console and check
document.querySelector('button[type="submit"]').onclick
// Should show function
```

**Check form validation:**
- Password must be 6+ characters
- Email must be valid format
- Full name must not be empty
- Password must match confirmation

---

## 🆇 TypeScript errors in build

### Diagnosis
Code has type mismatches.

### Fix
Run type check:
```powershell
cd app
npm run build
```

Should show specific errors with file/line numbers.

Most common:
- Profile type mismatch
- Role type mismatch
- Missing null checks

---

## 🔍 Debug Checklist When Stuck

```
1. Browser Console Issues?
   [ ] Opened DevTools (F12)?
   [ ] On Console tab?
   [ ] Looking for [AUTH logs?
   [ ] Any ERROR: logs?

2. Configuration Issues?
   [ ] .env.local has COMPLETE anon key?
   [ ] Key is ~100+ characters?
   [ ] Key NOT ending with "BI_"?
   [ ] Restarted dev server after .env change?

3. Database Issues?
   [ ] Supabase dashboard open?
   [ ] All 5 tables exist (SQL Editor, check)?
   [ ] PROFILES table present?
   [ ] RLS policies visible?

4. Frontend Issues?
   [ ] Form validation passing?
   [ ] Dev server running (localhost:5173)?
   [ ] No other errors in console?
   [ ] Page rendering correctly?
```

---

## 🎯 Most Common Exact Errors & Fixes

### "sb_publishable_PgXqh1REaYUJCuTW086Gew_YDUiwBI_"
**Error:** This is truncated!
**Fix:** Get full key from Supabase Dashboard Settings → API

### "anon" key not visible in Supabase
**Error:** Looking in wrong place
**Fix:** Dashboard → Settings → API → Find "anon" public key (not secret key)

### "profiles table not found"
**Error:** SQL not executed
**Fix:** Run all of `app/supabase.sql` in Supabase SQL Editor

### "RLS policies preventing writes"
**Error:** Table exists but insertions blocked
**Fix:** Check RLS policies - verify policy allows inserts for authenticated users

### "Email not confirmed"
**Error:** Supabase requires email confirmation
**Fix:** Either:
   - Confirm email from email link, OR
   - Disable email confirmation in Supabase Auth Settings

---

## 🚀 Success Indicators

You'll know it's working when:

- ✅ Signup completes in 1-3 seconds
- ✅ No red error boxes appear
- ✅ Redirects to dashboard automatically
- ✅ Dashboard shows user profile
- ✅ Can refresh page and stay logged in
- ✅ Console shows: `SIGNUP_COMPLETE_SUCCESS`
- ✅ No yellow "Demo Mode Active" banner (real mode)

---

## 📞 If Still Stuck

**Share these:**
1. Exact error from red box
2. Console logs (start with `[AUTH`)
3. Screenshot of `.env.local`
4. Supabase project name
5. What step you're on (signup/signin/redirect)

Most issues solved by:
- Getting complete anon key (90% of problems)
- Running SQL schema (9% of problems)
- Restarting dev server (1% of problems)

Good luck! 🎉
