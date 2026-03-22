# LamboMoon Project State

**Last Updated:** 2026-03-22 11:40 CET

## Current Task: Add launch dates to cards (DONE)

### Completed
1. ✅ Login page 404 error - FIXED (wrapped useSearchParams in Suspense)
2. ✅ Submit page - shows form, prompts login on submit if not authenticated
3. ✅ Login page - email/password login (not Google)
4. ✅ Home page Sign In button - links to /login
5. ✅ Home page Get Started button - links to /submit

### Files Changed
- `web/src/app/login/page.tsx` - Added Suspense wrapper for useSearchParams
- `web/src/app/submit/page.tsx` - Added dynamic export, shows form always
- `web/src/app/page.tsx` - Buttons wrapped in Link components

### Verified Working
- /login → 200 ✅
- /submit → 200 ✅
- / → 200 ✅

### Next Task: CoinGecko API Integration
- Status: DONE ✅
- PriceTicker fetches BTC/ETH prices ✅
- Project detail page fetches live data ✅
- Landing page now fetches live prices ✅ (just deployed)
- Refreshes every 60 seconds

### Deployment
- Deployed to: https://lambomoon.vercel.app
- Build: Passing ✅
- Latest: Added live CoinGecko prices to landing page
- Latest: Changed "Launched" to "Featured" on cards (when added to LamboMoon, not token genesis)

### Next: Supabase Caching
- Status: DONE ✅
- Created `/api/prices` endpoint
- Vercel Edge caching (60s) to avoid CoinGecko rate limits
- Works! https://www.lambomoon.io/api/prices returns live data