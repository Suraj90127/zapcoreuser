# API Unnecessary Calls & Re-renders – Fix Report

## Issues found and fixed

### 1. **ProviderCard.jsx** – N API calls (one per card)
- **Problem:** Each `ProviderCard` called `dispatch(getGames({ provider: provider.provider }))` in `useEffect`. With 10–20 cards, that was 10–20 identical-style API calls and overwrote global `state.games`.
- **Fix:** Removed the per-card `getGames` call. Game count now comes from:
  - `gameCount` prop when the parent passes it, or
  - Redux `state.games.games` (filter by `provider`) when games were already loaded (e.g. by parent/slider). No extra API calls from cards.

### 2. **Checkout.jsx** – Payment details refetched on theme/navigate
- **Problem:** `useEffect(..., [dispatch, user, navigate, theme])` refetched payment details whenever `theme` or `navigate` changed. Toggling dark mode caused an unnecessary `fetchPaymentDetails()` call.
- **Fix:** Dependencies reduced to `[dispatch, user]`. Fetch only when the user changes. Added guard so we only fetch when `user` is truthy.

### 3. **Header.jsx** – Duplicate `getUserInfo` with PrivateRoute
- **Problem:** Header ran `getUserInfo()` when `!user && !loading`, and PrivateRoute ran it when `!isFetched`. On first load both could run, causing two auth API calls.
- **Fix:** Header now uses the same “single source” as PrivateRoute: it calls `getUserInfo()` only when `!isFetched && !loading`. After the first fetch, `isFetched` is true so neither triggers again.

### 4. **Home.jsx** – Providers refetched on any user change
- **Problem:** `useEffect(..., [dispatch, user])` refetched `getAllProviders()` whenever `user` changed (e.g. after profile update or new reference from Redux). Providers list doesn’t depend on user identity for this screen.
- **Fix:** Dependencies reduced to `[dispatch]`. `getAllProviders()` runs once on mount when Home is shown.

---

## Other notes (no code change)

- **getCartProviders:** Called from Header (when `user` is set) and after cart mutations in Providers/Cart. That’s intentional (load once when user is set, then refresh after add/remove). No change.
- **getGames from multiple places:** AllPages (96), Gameslider (20), ProviderGameSliders (50), Games (96) each fetch with different params; the last response wins in Redux. That’s a known trade-off; possible future improvement is separate state keys (e.g. `gamesCatalog`, `gamesSlider`) or a single source that passes data down.
- **Recharge.jsx:** Single mount effect with `[dispatch]` for payment/history fetch is correct; no change.

---

## Summary

| File           | Issue                          | Fix                                      |
|----------------|---------------------------------|------------------------------------------|
| ProviderCard   | 1 getGames API call per card   | Use `gameCount` prop + Redux, no API     |
| Checkout       | Refetch on theme/navigate       | Deps `[dispatch, user]`, fetch if user   |
| Header         | Duplicate getUserInfo          | Use `isFetched` so only one place fetches |
| Home           | getAllProviders on user change  | Deps `[dispatch]` only                   |

These changes reduce unnecessary API calls and avoid extra re-renders that triggered refetches.
