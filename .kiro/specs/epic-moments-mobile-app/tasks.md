# Implementation Tasks: Epic Moments Mobile App

## Task Overview

Build a cross-platform React Native + Expo mobile app (`mobile/` directory at the project root) that serves both Android/iOS and Web from a single codebase, consuming the existing backend API without any server changes.

---

## Task 1: Project Scaffold and Foundation

Set up the `mobile/` Expo managed-workflow project with all dependencies, configuration, and the folder structure defined in `design.md`.

**Sub-tasks:**
- [ ] 1.1 Initialise Expo project in `mobile/` using `npx create-expo-app@latest mobile --template blank-typescript`
- [ ] 1.2 Install all dependencies from the tech stack: `expo-router`, `axios`, `expo-secure-store`, `@react-native-async-storage/async-storage`, `expo-image`, `expo-av`, `react-native-toast-message`, `react-native-qrcode-svg`, `socket.io-client`, `nativewind`, `tailwindcss`, `fast-check`, `@testing-library/react-native`
- [ ] 1.3 Configure `app.json` with app name ("Epic Moments"), slug, scheme (`epicmoments`), Android package, iOS bundle ID, deep link origin, and Expo plugins for expo-router
- [ ] 1.4 Create `constants/colors.ts` with brand palette (`primary: '#e8157e'`, `background: '#fff'`, `backgroundDark: '#121212'`, `text`, `textMuted`, `success`, `warning`, etc.)
- [ ] 1.5 Create `constants/config.ts` reading `BACKEND_URL` from `expo-constants` / `.env`
- [ ] 1.6 Create the full directory structure: `app/`, `app/(tabs)/`, `app/product/`, `components/home/`, `components/product/`, `components/cart/`, `components/shared/`, `context/`, `hooks/`, `services/`, `assets/`, `__tests__/unit/`, `__tests__/property/`
- [ ] 1.7 Configure NativeWind: `tailwind.config.js` with content paths, `babel.config.js` with `nativewind/babel` plugin, `app/global.css` import
- [ ] 1.8 Configure Jest: `jest.config.js` with `expo` preset, module name mapper for NativeWind, transform for expo-router
- [ ] 1.9 Create root `app/_layout.tsx` that wraps children with `ShopContextProvider`, `Toast` (react-native-toast-message), and `ThemeProvider`

**Acceptance criteria met:** Requirement 1 (all 9 criteria)


---

## Task 2: Services and Storage Layer

Build the API service and storage abstraction that all screens and context depend on.

**Sub-tasks:**
- [ ] 2.1 Create `services/storage.ts` — implement `getToken`, `setToken`, `removeToken` (using `expo-secure-store` on native, `AsyncStorage` on web), plus `getCart`/`setCart` and `getFavorites`/`setFavorites` via `AsyncStorage`
- [ ] 2.2 Create `services/api.ts` — axios instance with `baseURL = BACKEND_URL`, `timeout: 15000`, request interceptor attaching JWT header, response interceptor handling 401 (clear token → redirect to `/login`)
- [ ] 2.3 Create `hooks/useCountdown.ts` — pure `decomposeSeconds(totalSecs)` export plus `useCountdown(initialSecs)` hook using `setInterval`; hook clears interval on unmount
- [ ] 2.4 Write property test for `decomposeSeconds`: `d*86400 + h*3600 + m*60 + s === T`, `0 ≤ h < 24`, `0 ≤ m < 60`, `0 ≤ s < 60` (Property 2)
- [ ] 2.5 Write property test for JWT expiry logic: expired token returns `''` and calls `removeToken`; valid token returns the token string unchanged (Property 1)

**Acceptance criteria met:** Requirement 1.5, 2.5, 2.6, 15.3–15.5

---

## Task 3: ShopContext (Global State)

Port the web `ShopContext.jsx` to React Native, swapping only the storage layer.

**Sub-tasks:**
- [ ] 3.1 Create `context/ShopContext.tsx` with all state fields: `products`, `popularProducts`, `offerProducts`, `deskDecoratives`, `wallDecoratives`, `carDecoratives`, `businessNeeds`, `googleReviews`, `shopCategories`, `slides`, `catagere`, `keywords`, `cartItems`, `token`, `favorites`, `search`, `currency ('₹')`, `delivery_fee (0)`
- [ ] 3.2 Implement `fetchData(url, setter, key?)` using `services/api.ts`; wrap in `fetchWithRetry` (max 3 retries, exponential back-off: 1s, 2s, 4s)
- [ ] 3.3 Implement `addToCart`, `updateQuantity`, `getCartCount`, `getCartAmount`, `getUserCart` — identical logic to web version
- [ ] 3.4 Persist `cartItems` to AsyncStorage via `storage.setCart` in a `useEffect` on every `cartItems` change; load from `storage.getCart()` on mount
- [ ] 3.5 Persist `favorites` to AsyncStorage via `storage.setFavorites` on every change; load from `storage.getFavorites()` on mount
- [ ] 3.6 Load JWT from `storage.getToken()` on mount; decode `exp` claim locally to validate; clear if expired
- [ ] 3.7 Implement Socket.IO connection: emit `user_online` when `token` is set, disconnect when `token` cleared or component unmounts
- [ ] 3.8 Write property test: `getCartAmount()` === sum of `product.price * quantity` for all cart entries (Property 13)
- [ ] 3.9 Write property test: cart persistence round-trip via `setCart` → `getCart` preserves all IDs, sizes, quantities (Property 15)
- [ ] 3.10 Write property test: `updateQuantity(id, size, 0)` removes that entry and decrements `getCartCount()` correctly (Property 14)

**Acceptance criteria met:** Requirement 1.7, 2.8–2.9, 6.2–6.5, 6.8, 15.4–15.5


---

## Task 4: Shared UI Components

Build the reusable components used across all screens.

**Sub-tasks:**
- [ ] 4.1 Create `components/shared/SkeletonLoader.tsx` — animated `Animated.View` placeholder matching the shape/dimensions passed via props; used for product card grids and horizontal lists
- [ ] 4.2 Create `components/shared/ErrorBanner.tsx` — red strip at top of screen with message text and optional Retry button; shown when connectivity is lost or initial fetch fails
- [ ] 4.3 Create `components/shared/EmptyState.tsx` — centered illustration (SVG or image), heading, subtext, and optional CTA button; used for empty cart, empty orders, no products found
- [ ] 4.4 Create `components/shared/StatusBadge.tsx` — coloured chip for order statuses: Order Placed (grey), Packing (blue), Shipped (orange), Out for Delivery (purple), Delivered (green)
- [ ] 4.5 Create `components/product/ProductCard.tsx` — displays `expo-image` (product's first image), product name, price, `originalPrice` with discount %, star rating, wishlist heart button; tappable to navigate to Product Detail; supports `horizontal` prop for compact layout
- [ ] 4.6 Create `components/home/SectionHeader.tsx` — section eyebrow label, h2 title, subtitle, "View All →" button; accepts `onViewAll` callback
- [ ] 4.7 Create `components/home/StatsStrip.tsx` — four stat items (5000+ Happy Customers, 4.8 Average Rating, 100+ Unique Products, 100% Made with Love) in a horizontal row
- [ ] 4.8 Create `components/home/CountdownBanner.tsx` — offer image, discount badge, "Limited Time Offer" label, countdown tiles (Days/Hours/Mins/Secs) using `useCountdown` hook; Shop Now button
- [ ] 4.9 Write property test: `ProductCard` renders without crash for any valid `Product` object with arbitrary name, price, and images array (Property 8 partial)

**Acceptance criteria met:** Requirement 3.10, 8.3, 15.1, 15.2, 16.2–16.6

---

## Task 5: Navigation Structure

Set up the complete expo-router navigation: bottom tabs, stack screens, auth guards, and deep linking.

**Sub-tasks:**
- [ ] 5.1 Create `app/(tabs)/_layout.tsx` — `<Tabs>` with five tabs: Home, Collections, Cart (with `tabBarBadge` from `getCartCount()`), Orders, Profile; `tabBarActiveTintColor: '#e8157e'`
- [ ] 5.2 Create placeholder screen files: `app/(tabs)/index.tsx`, `app/(tabs)/collections.tsx`, `app/(tabs)/cart.tsx`, `app/(tabs)/orders.tsx`, `app/(tabs)/profile.tsx`, `app/product/[id].tsx`, `app/checkout.tsx`, `app/login.tsx`, `app/register.tsx`, `app/about.tsx`, `app/contact.tsx`, `app/privacy-policy.tsx`, `app/terms.tsx`, `app/payment-policy.tsx`
- [ ] 5.3 Add auth guards to Orders and Profile screens: `useEffect(() => { if (!token) router.replace('/login'); }, [token])`
- [ ] 5.4 Configure deep linking in `app.json`: scheme `epicmoments`, Expo Router `origin` set to production URL
- [ ] 5.5 Create `hooks/useAuth.ts` with `login(email, password)`, `register(name, email, password)`, `logout()` functions that call the API and update `ShopContext.token` + `storage`
- [ ] 5.6 Write unit test: auth guard redirects to `/login` when token is empty string (Property 16)

**Acceptance criteria met:** Requirement 13 (all 6 criteria)


---

## Task 6: Authentication Screens

Build the Login and Register screens.

**Sub-tasks:**
- [ ] 6.1 Build `app/login.tsx` — email + password fields, "Login" button, link to Register; on submit call `useAuth.login()`; show inline error below field on failure; show loading state on button during request
- [ ] 6.2 Build `app/register.tsx` — name, email, password fields (password min 8 chars, max 128); on submit call `useAuth.register()`; handle duplicate email error with inline message; show loading state
- [ ] 6.3 On successful login/register: store JWT via `storage.setToken`, update `ShopContext.token`, call `getUserCart(token)`, navigate to `/(tabs)/`
- [ ] 6.4 Handle network errors: show "Unable to connect. Check your internet connection." toast and keep form data intact
- [ ] 6.5 Implement JWT expiry check on app launch (in root `_layout.tsx`): decode `exp` from stored token, clear if expired, redirect to login
- [ ] 6.6 Write unit tests: login success stores token and navigates home; login failure shows inline error; register duplicate email shows inline error (Property 1 partial)

**Acceptance criteria met:** Requirement 2 (all 9 criteria)

---

## Task 7: Home Screen

Build the full Home screen matching the web `NewLandingPage` layout with all 16 sections.

**Sub-tasks:**
- [ ] 7.1 Create `components/home/AnnounceBar.tsx` — horizontally scrolling marquee-style bar with rocket icon and announcement text
- [ ] 7.2 Create `components/home/HeroBanner.tsx` — hero image, eyebrow label, h1 title, subtitle, two CTA buttons (Shop Now, Explore Collection), three trust icons (Premium Quality, Fast Delivery, 100% Secure)
- [ ] 7.3 Create `components/home/CategoryPills.tsx` — horizontally scrollable row of 8 icon+label pill buttons, each navigating to `/collections`
- [ ] 7.4 Create `components/home/ShopCategoriesGrid.tsx` — `FlatList numColumns={2}` (or 3 on wide screens) rendering `shopCategories` as tappable cards with image, icon, name, "Explore Now →"; empty state if no categories
- [ ] 7.5 Create `components/home/PremiumAlbums.tsx` — two tappable image cards (Wedding Albums, Birthday Albums) navigating to `/collections`
- [ ] 7.6 Build `app/(tabs)/index.tsx` as a `ScrollView` composing all sections in order: AnnounceBar → HeroBanner → CategoryPills → SectionHeader+PopularProducts FlatList → SectionHeader+OfferProducts FlatList → StatsStrip → ShopCategoriesGrid → SectionHeader+LatestProducts FlatList → static banner image → SectionHeader+DeskDecoratives FlatList → SectionHeader+WallDecoratives FlatList → PremiumAlbums → SectionHeader+CarDecoratives FlatList → SectionHeader+BusinessNeeds FlatList → CountdownBanner → SectionHeader+GoogleReviews FlatList
- [ ] 7.7 All horizontal product `FlatList`s: `horizontal`, `showsHorizontalScrollIndicator={false}`, `keyExtractor={item => item._id}`, renders `ProductCard` with `horizontal` prop; shows `SkeletonLoader` while data is loading; shows nothing (section hidden) if empty
- [ ] 7.8 Each section wrapped in individual `try/catch` so one section failure does not crash the screen (Property 3)
- [ ] 7.9 Write property test: Home screen renders without crash when any combination of ShopContext collections is empty (Property 3)

**Acceptance criteria met:** Requirement 3 (all 11 criteria), Requirement 12.5


---

## Task 8: Collections Screen (Product Browse + Filter)

Build the Collections screen with search, filter, and sort.

**Sub-tasks:**
- [ ] 8.1 Build `app/(tabs)/collections.tsx` with a sticky search bar (controlled `TextInput`), category filter chips, sub-category filter chips, sort picker (price asc/desc, newest)
- [ ] 8.2 Implement in-memory filtering: `products.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query))` applied for search; additional `category` and `subCategory` filters chained
- [ ] 8.3 Implement in-memory sorting (no network calls): price-asc, price-desc, newest by `p.date`
- [ ] 8.4 Render filtered+sorted list as `FlatList numColumns={2}` with `ProductCard`; each card navigates to `/product/${item._id}`
- [ ] 8.5 Show keyword chips (from `ShopContext.keywords`) above the product grid; tapping a keyword sets it as the search query
- [ ] 8.6 Show `EmptyState` with "No products found" message when filtered list is empty
- [ ] 8.7 Show `SkeletonLoader` grid while `ShopContext.products` is empty (initial load)
- [ ] 8.8 Accept optional route param `?category=<name>` to pre-filter when navigated from Home (ShopCategory tap)
- [ ] 8.9 Write property test: filtered results all match the query; no matching product is missing (Property 4)
- [ ] 8.10 Write property test: category filter — all results have `product.category === selectedCategory` (Property 5)
- [ ] 8.11 Write property test: price-asc sort produces non-decreasing price sequence; price-desc produces non-increasing; newest produces non-increasing date sequence (Property 6)
- [ ] 8.12 Write property test: discount percentage = `Math.round((1 - price/originalPrice) * 100)` when `originalPrice > price > 0`; no badge when originalPrice absent or ≤ price (Property 7)

**Acceptance criteria met:** Requirement 4 (all 8 criteria)

---

## Task 9: Product Detail Screen

Build the Product Detail screen with media gallery, size selection, and add-to-cart.

**Sub-tasks:**
- [ ] 9.1 Build `app/product/[id].tsx`: read `id` from route params; resolve product from `ShopContext.products` first (cache-first, no network if found); fallback to `GET /api/product/:id` with 5s timeout and retry button on failure
- [ ] 9.2 Create `components/product/ProductGallery.tsx` — horizontal `FlatList` of `expo-image` items; `expo-av` `<Video>` for video items with native controls; thumbnail row below; selected thumbnail highlighted; image load failure shows placeholder image
- [ ] 9.3 Create `components/product/SizeSelector.tsx` — horizontal row of `TouchableOpacity` chips; selected size: `#e8157e` background; unselected: border-only; renders nothing if `sizes` array is empty
- [ ] 9.4 "Add to Cart" button: disabled (grey, 0.5 opacity) when `sizes.length > 0 && !selectedSize`; enabled when size selected OR no sizes exist; on press calls `ShopContext.addToCart(id, selectedSize)`; shows `SkeletonLoader` spinner on press during async call
- [ ] 9.5 Show inline error "Please select a size" if user taps Add to Cart without selecting size; error disappears after size is selected
- [ ] 9.6 "Customize Now" button: navigates to `/contact?product=<productName>`
- [ ] 9.7 Create `components/product/RelatedProducts.tsx` — horizontal `FlatList` of `ProductCard`s filtered by same `category` or `subCategory`, max 20 items; empty if no related products
- [ ] 9.8 Description/Reviews toggle tabs below the main info section
- [ ] 9.9 Write property test: product detail renders all required fields for any valid Product object (Property 8)
- [ ] 9.10 Write property test: cache-first resolution — product in ShopContext.products is used without API call (Property 9)
- [ ] 9.11 Write property test: Add to Cart disabled when sizes non-empty and no size selected; enabled after selection (Property 10)
- [ ] 9.12 Write property test: related products all share category or subCategory with the source product (Property 12)

**Acceptance criteria met:** Requirement 5 (all 9 criteria), Requirement 14 (all 5 criteria)


---

## Task 10: Cart Screen

Build the Cart screen with quantity management and server sync.

**Sub-tasks:**
- [ ] 10.1 Build `app/(tabs)/cart.tsx`: map `ShopContext.cartItems` entries, resolve each product from `ShopContext.products`, render `CartItem` rows
- [ ] 10.2 Create `components/cart/CartItem.tsx` — product image (`expo-image`), name, size, qty stepper (`-` / `+` buttons, min 1 max 99), line-item price (price × qty), remove icon; qty change calls `updateQuantity`; remove calls `updateQuantity(id, size, 0)`; updates reflected within 300ms
- [ ] 10.3 Create `components/cart/CartSummary.tsx` — subtotal from `getCartAmount()`, delivery "FREE", total; "Proceed to Checkout" `TouchableOpacity` disabled when `getCartCount() === 0`
- [ ] 10.4 Show `EmptyState` (cart illustration, "Shop Now" → `/collections`) when cart is empty
- [ ] 10.5 On screen focus (not just mount): call `ShopContext.getUserCart()` to sync with server; server quantities take precedence on conflict; show `ErrorBanner` on sync failure but preserve local state
- [ ] 10.6 Cart tab badge: `tabBarBadge={getCartCount() || undefined}` updates within 300ms of any cart change
- [ ] 10.7 Write property test: `addToCart(id, size)` increments `cartItems[id][size]` by 1 (Property 11)
- [ ] 10.8 Write property test: `getCartAmount()` equals sum of price × qty for all cart entries (Property 13 — runtime)
- [ ] 10.9 Write property test: `updateQuantity(id, size, 0)` removes entry and decrements count (Property 14 — runtime)

**Acceptance criteria met:** Requirement 6 (all 8 criteria)

---

## Task 11: Checkout Screen

Build the Checkout/Place Order screen with all three payment methods.

**Sub-tasks:**
- [ ] 11.1 Build `app/checkout.tsx` with auth guard (redirect to `/login` if no token; cart retained)
- [ ] 11.2 Delivery form: nine `TextInput` fields (firstName, lastName, email, street, city, state, zipcode, country, phone); client-side validation on submit: all required, email format check, phone numeric
- [ ] 11.3 Show inline validation errors below each invalid field; block API call until all fields valid
- [ ] 11.4 `CartSummary` panel (read-only): subtotal, "FREE" shipping, total
- [ ] 11.5 Payment method radio group: COD | UPI | Razorpay
- [ ] 11.6 COD flow: `POST /api/order/place` with `{ address, items, amount, paymentMethod: 'COD' }`; on success → clear cart → success toast → navigate to `/orders`
- [ ] 11.7 Razorpay flow: `POST /api/order/razorpay` → call `RazorpayCheckout.open(options)` from `react-native-razorpay` → on payment success `POST /api/order/verifyRazorpay` → clear cart → navigate to `/orders`
- [ ] 11.8 UPI flow: render `react-native-qrcode-svg` QR code from `upi://pay?pa=<upi_id>&am=<amount>&tn=<order_id>`; confirmation checkbox; on confirm `POST /api/order/place` with `paymentMethod: 'UPI'` → clear cart → navigate to `/orders`
- [ ] 11.9 On any order API failure: show error toast with backend `message` field; stay on Checkout screen
- [ ] 11.10 Play success sound using `expo-av` on successful order placement
- [ ] 11.11 Write property test: form submission blocked when any required field is empty (Property 18)
- [ ] 11.12 Write property test: successful order clears cart (cartCount === 0 after mock 2xx) (Property 17)

**Acceptance criteria met:** Requirement 7 (all 9 criteria)


---

## Task 12: Orders Screen

Build the Orders history screen.

**Sub-tasks:**
- [ ] 12.1 Build `app/(tabs)/orders.tsx` with auth guard: if no token show "Please login to see your orders" message + Login button; no API call made
- [ ] 12.2 `POST /api/order/userorders` with `Authorization: Bearer <token>` header; 10s timeout
- [ ] 12.3 `FlatList` of order items sorted newest-first by `order.date`; each row shows: product name (max 100 chars), price, quantity, size, date (DD/MM/YYYY format), payment method, `StatusBadge`
- [ ] 12.4 Loading state: `SkeletonLoader` rows while fetching; Retry button disabled during load
- [ ] 12.5 Error state: `ErrorBanner` with "Retry" button that re-triggers `POST /api/order/userorders`
- [ ] 12.6 Empty state: `EmptyState` with "Start Shopping" button → `/collections`
- [ ] 12.7 Write unit test: auth guard shows login message and does not call API when token is empty

**Acceptance criteria met:** Requirement 8 (all 7 criteria)

---

## Task 13: Profile Screen and Legal Screens

Build the Profile screen and three policy content screens.

**Sub-tasks:**
- [ ] 13.1 Build `app/(tabs)/profile.tsx` with auth guard; display user name and email (decoded from JWT payload)
- [ ] 13.2 Navigation links on Profile: My Orders (→ `/orders`), Privacy Policy (→ `/privacy-policy`), Terms & Conditions (→ `/terms`), Payment Policy (→ `/payment-policy`)
- [ ] 13.3 Logout button: calls `useAuth.logout()` → `storage.removeToken()` → `setToken('')` → clear cartItems → navigate to `/login`
- [ ] 13.4 Build `app/privacy-policy.tsx` with same content as web `/privacy-policy` page (import text from a shared constants file)
- [ ] 13.5 Build `app/terms.tsx` with same content as web `/terms-and-conditions` page
- [ ] 13.6 Build `app/payment-policy.tsx` with same content as web `/payment-policy` page
- [ ] 13.7 All three policy screens accessible from Profile and linked from the Checkout screen footer

**Acceptance criteria met:** Requirement 13.4, Requirement 17 (all 4 criteria)

---

## Task 14: About and Contact / Enquiry Screens

Build the About and Contact screens.

**Sub-tasks:**
- [ ] 14.1 Build `app/about.tsx`: brand story, mission, values (Premium Quality, Fast Delivery, 100% Secure Payments, Easy Returns), trust stats (5000+ happy customers, 4.8 rating, 100+ unique products), social media links (Instagram, Facebook)
- [ ] 14.2 Build `app/contact.tsx`: form with name (required), email (required), phone (optional, 7–15 digits), subject (optional, max 150 chars), message (required, max 1000 chars)
- [ ] 14.3 Client-side validation on submit: show inline per-field errors for invalid fields; block submission
- [ ] 14.4 On submit: `POST /api/enquiries` with form data; show "Message sent successfully" confirmation; clear form on success
- [ ] 14.5 On failure: show error message; preserve all form data so user can retry; allow max 3 retries
- [ ] 14.6 Static contact info section: phone, email, Instagram handle, Facebook link, physical address (Gullapalli, Andhra Pradesh)
- [ ] 14.7 Embedded map: `expo-location`-free static map image or `react-native-maps` `MapView` centered on business coordinates with a location marker
- [ ] 14.8 If navigated with `?product=<name>` param, pre-fill subject with "Customize: <name>"

**Acceptance criteria met:** Requirement 10 (all 5 criteria), Requirement 11 (all 3 criteria)


---

## Task 15: Push Notifications (Firebase FCM)

Integrate Firebase push notifications on native and web.

**Sub-tasks:**
- [ ] 15.1 Create `hooks/useFCM.ts`: on native, use `@react-native-firebase/messaging`; on web, use Firebase JS SDK `getToken(messaging, { vapidKey })`
- [ ] 15.2 Request notification permission on first app launch (using `messaging().requestPermission()` on native, `Notification.requestPermission()` on web); request only once — track permission state in AsyncStorage
- [ ] 15.3 After permission granted and user authenticated: retrieve FCM token within 5s; `POST /api/user/save-fcm` with `{ fcmToken, token: jwt }`; retry up to 3 times with 2s interval on failure
- [ ] 15.4 Foreground notification handler: show `react-native-toast-message` with notification `title` and `body` (title max 100 chars, body max 250 chars, displayed for min 3s)
- [ ] 15.5 Background/terminated: OS handles notification display natively (no code needed beyond Firebase setup)
- [ ] 15.6 Notification tap handler: read `notification.data.screen`; if `'order_update'` → `router.push('/orders')`; if `'promotion'` → navigate to relevant screen; if screen requires auth and no token → `router.push('/login')` first
- [ ] 15.7 If user denies permission: set a flag in AsyncStorage; never prompt again in-app (user must go to device settings); all other app features continue working normally
- [ ] 15.8 Add `@react-native-firebase/app` and `@react-native-firebase/messaging` to `app.json` plugins and `package.json`; configure `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) placeholder instructions in README

**Acceptance criteria met:** Requirement 9 (all 7 criteria)

---

## Task 16: Offline Handling and Error Resilience

Add network monitoring, offline banner, and ensure graceful degradation.

**Sub-tasks:**
- [ ] 16.1 Install `@react-native-community/netinfo`; in root `_layout.tsx` subscribe to connectivity changes; when offline set `isOnline: false` in a global context flag
- [ ] 16.2 Show `ErrorBanner` ("No internet connection. Some data may be outdated.") at the top of every tab screen when `isOnline === false`; dismiss automatically when connectivity restored
- [ ] 16.3 When offline, all screens continue to render using cached data (products from ShopContext state loaded at last online session, cart from AsyncStorage, token from SecureStore)
- [ ] 16.4 Verify `fetchWithRetry` (from Task 3.2) covers all ShopContext initial fetches with 3 retries + exponential back-off
- [ ] 16.5 Write property test: API error response containing `message` field is displayed verbatim in toast/error UI (Property 19)
- [ ] 16.6 Write property test: retry count never exceeds 3 for any initial fetch (Property 20)

**Acceptance criteria met:** Requirement 15 (all 5 criteria)

---

## Task 17: Performance and Accessibility

Apply performance optimizations and accessibility attributes across all screens.

**Sub-tasks:**
- [ ] 17.1 Replace all horizontal `ScrollView` product lists with `FlatList` (horizontal) with `keyExtractor`, `getItemLayout`, `windowSize={5}`, `maxToRenderPerBatch={8}` to enable virtualization
- [ ] 17.2 Replace all vertical product grids with `FlatList numColumns={2}` (Collections, category screens) with same virtualization props
- [ ] 17.3 Add `accessibilityLabel` and `accessibilityRole` to all interactive elements: product cards, buttons, form inputs, tab bar items, wishlist heart, qty stepper buttons
- [ ] 17.4 Ensure all `TouchableOpacity` / `Pressable` elements have `minHeight: 44` and `minWidth: 44` (44dp touch targets per platform guidelines)
- [ ] 17.5 Implement dark mode: wrap theme in `useColorScheme()`; background switches between `#fff` (light) and `#121212` (dark); text and surface colors adapt; brand primary `#e8157e` unchanged in both modes
- [ ] 17.6 All `expo-image` components: set `contentFit="cover"`, `transition={200}`, `placeholder` prop with a low-res blur placeholder or brand-colored box; on `onError` show grey placeholder
- [ ] 17.7 Verify Home screen initial render (first visible viewport) completes within 3s on simulated mid-range device (document in README how to measure with Expo DevTools)

**Acceptance criteria met:** Requirement 16 (all 6 criteria)


---

## Task 18: Web Platform Verification

Ensure the app runs correctly as a web app via React Native Web, complementing the existing `frontend/`.

**Sub-tasks:**
- [ ] 18.1 Run `npx expo export --platform web` and verify the output loads in a browser with all tabs navigable
- [ ] 18.2 Verify JWT storage on web falls back to `AsyncStorage` (localStorage adapter) since `expo-secure-store` is not available on web
- [ ] 18.3 Verify Razorpay on web: when `Platform.OS === 'web'`, use `Linking.openURL(razorpayCheckoutUrl)` instead of native SDK; document this in code comment
- [ ] 18.4 Verify Firebase push notifications on web: `useFCM` hook uses `firebase/messaging` JS SDK on web platform; test with `Platform.OS === 'web'` check
- [ ] 18.5 Verify all screens render without `View`/`Text`/`StyleSheet` web compatibility warnings in the browser console
- [ ] 18.6 Document in `mobile/README.md`: how to run on Android emulator, iOS simulator, web browser, and how to build with EAS for Play Store

**Acceptance criteria met:** Requirement 1.2, 1.4, 9.7

---

## Task Dependency Order

Tasks can be executed in this order (later tasks depend on earlier ones):

```
Task 1 (Scaffold)
    └── Task 2 (Services + Storage)
            └── Task 3 (ShopContext)
                    ├── Task 4 (Shared UI Components)
                    │       └── Task 5 (Navigation)
                    │               ├── Task 6 (Auth Screens)
                    │               ├── Task 7 (Home Screen)
                    │               ├── Task 8 (Collections Screen)
                    │               ├── Task 9 (Product Detail)
                    │               ├── Task 10 (Cart Screen)
                    │               ├── Task 11 (Checkout Screen)
                    │               ├── Task 12 (Orders Screen)
                    │               ├── Task 13 (Profile + Legal)
                    │               └── Task 14 (About + Contact)
                    └── Task 15 (Push Notifications)   [parallel with 6–14]

Task 16 (Offline Handling)    [after Tasks 3, 4, 5]
Task 17 (Performance + A11y)  [after all screen tasks complete]
Task 18 (Web Verification)    [after Task 17]
```

Tasks 6 through 15 can all be worked in parallel once Tasks 1–5 are complete.
