# Design Document: Epic Moments Mobile App

## Overview

The Epic Moments Mobile App is a cross-platform React Native application built with Expo that delivers the full Epic Moments customer shopping experience on Android, iOS, and Web (React Native Web). The app consumes the existing Node.js/Express/MongoDB REST API without any backend modifications and mirrors all customer-facing functionality of the current React/Vite web frontend.

The app is structured as a new standalone `mobile/` directory at the project root, keeping the existing web frontend (`frontend/`) and backend (`backend/`) completely untouched. It uses Expo's managed workflow to maximize platform coverage from a single codebase with minimal native configuration.

Key goals:
- One codebase, three platforms (Android, iOS, Web)
- Same data model and API surface as the web app
- Brand-identical UI: primary color `#e8157e`, currency `₹`, zero delivery fee
- JWT auth with secure native storage, cart persistence via AsyncStorage
- Firebase FCM push notifications with platform-appropriate SDK split

---

## Architecture

### System Context

```
┌─────────────────────────────────────────────────────────────┐
│                    Epic Moments Project Root                 │
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────┐  │
│  │  backend/    │   │  frontend/   │   │   mobile/      │  │
│  │  Node/Express│   │  React/Vite  │   │  Expo/RN       │  │
│  │  MongoDB     │   │  (existing)  │   │  (NEW)         │  │
│  └──────┬───────┘   └──────────────┘   └───────┬────────┘  │
│         │  REST API / Socket.IO                │            │
│         └─────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

The mobile app is a pure API client. All business logic (pricing, order creation, cart management, user authentication) remains in the backend. The mobile app only handles UI rendering, local state management, and secure credential storage.

### Architecture Patterns

- **Context + Hooks**: Global state via `ShopContext` (mirroring the web pattern) with local hooks for auth, cart, and FCM
- **Service Layer**: All HTTP calls go through a centralized `services/api.ts` axios instance with request/response interceptors
- **Storage Abstraction**: A `services/storage.ts` module wraps `expo-secure-store` (JWT) and `AsyncStorage` (cart, favorites) behind a consistent interface
- **File-Based Routing**: `expo-router` maps the `app/` directory structure directly to navigation routes
- **Platform Branching**: Platform-specific code isolated to `*.native.ts` / `*.web.ts` files or `Platform.OS` checks within shared files

### Data Flow

```
Backend API
    │
    ▼
services/api.ts (axios + interceptors)
    │
    ▼
ShopContext.tsx (global state store)
    │
    ├─► Screen components (read-only consumers via useContext)
    │
    └─► hooks/useCart.ts, hooks/useAuth.ts (write operations)
```

---

## Components and Interfaces

### Project Directory Structure

```
mobile/
├── app/                          # expo-router file-based routes
│   ├── _layout.tsx               # Root layout: ShopContext provider, Toast, theme
│   ├── (tabs)/                   # Bottom tab navigator group
│   │   ├── _layout.tsx           # Tab bar config (icons, badge, auth guards)
│   │   ├── index.tsx             # Home tab
│   │   ├── collections.tsx       # Collections/Browse tab
│   │   ├── cart.tsx              # Cart tab
│   │   ├── orders.tsx            # Orders tab
│   │   └── profile.tsx           # Profile/Account tab
│   ├── product/
│   │   └── [id].tsx              # Product Detail screen
│   ├── checkout.tsx              # Checkout / Place Order screen
│   ├── login.tsx                 # Login screen
│   ├── register.tsx              # Register screen
│   ├── about.tsx                 # About Epic Moments
│   ├── contact.tsx               # Contact / Enquiry form
│   ├── privacy-policy.tsx        # Privacy Policy
│   ├── terms.tsx                 # Terms & Conditions
│   └── payment-policy.tsx        # Payment Policy
│
├── components/
│   ├── home/                     # Home screen sub-components
│   │   ├── AnnounceBar.tsx
│   │   ├── HeroBanner.tsx
│   │   ├── CategoryPills.tsx
│   │   ├── SectionHeader.tsx
│   │   ├── ShopCategoriesGrid.tsx
│   │   ├── StatsStrip.tsx
│   │   ├── CountdownBanner.tsx
│   │   └── PremiumAlbums.tsx
│   ├── product/
│   │   ├── ProductCard.tsx       # Used in FlatLists (grid + horizontal)
│   │   ├── ProductGallery.tsx    # Swipeable media gallery (images + video)
│   │   ├── SizeSelector.tsx      # Size chip row
│   │   └── RelatedProducts.tsx
│   ├── cart/
│   │   ├── CartItem.tsx          # Row with qty stepper + remove
│   │   └── CartSummary.tsx       # Subtotal / total panel
│   └── shared/
│       ├── SkeletonLoader.tsx    # Animated placeholder for loading states
│       ├── ErrorBanner.tsx       # Network error banner
│       ├── EmptyState.tsx        # Empty list / no-results illustration
│       └── StatusBadge.tsx       # Order status chip
│
├── context/
│   └── ShopContext.tsx           # Global state (mirrors web ShopContext)
│
├── hooks/
│   ├── useCart.ts                # Cart read/write helpers
│   ├── useAuth.ts                # Login, logout, token validation
│   ├── useFCM.ts                 # Firebase FCM token retrieval + save
│   └── useCountdown.ts           # Countdown timer hook
│
├── services/
│   ├── api.ts                    # Axios instance + interceptors
│   └── storage.ts                # expo-secure-store + AsyncStorage wrappers
│
├── constants/
│   ├── colors.ts                 # Brand palette
│   └── config.ts                 # Backend URL, env vars
│
├── assets/                       # Static images, fonts, sounds
│
├── app.json                      # Expo config
├── package.json
└── tsconfig.json
```

### Core Component Interfaces

```typescript
// ProductCard props
interface ProductCardProps {
  product: Product;
  onPress: (id: string) => void;
  horizontal?: boolean;       // compact layout for horizontal lists
}

// CartItem props
interface CartItemProps {
  product: Product;
  size: string;
  quantity: number;
  onQuantityChange: (id: string, size: string, qty: number) => void;
}

// SizeSelector props
interface SizeSelectorProps {
  sizes: string[];
  selected: string | null;
  onSelect: (size: string) => void;
}

// StatusBadge props
interface StatusBadgeProps {
  status: 'Order Placed' | 'Packing' | 'Shipped' | 'Out for Delivery' | 'Delivered';
}
```

---

## Data Models

### Product

```typescript
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subCategory?: string;
  sizes: string[];
  images: string[];        // Cloudinary URLs
  video?: string;          // Cloudinary video URL
  rating?: number;
  date?: number;           // timestamp for "newest" sort
  bestseller?: boolean;
}
```

### Cart State

```typescript
// Mirrors web ShopContext exactly
type CartItems = {
  [itemId: string]: {
    [size: string]: number;  // quantity
  };
};
```

### Order

```typescript
interface OrderItem {
  _id: string;
  userId: string;
  items: Array<{
    _id: string;
    name: string;
    price: number;
    quantity: number;
    size: string;
  }>;
  address: DeliveryAddress;
  status: 'Order Placed' | 'Packing' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  payment: boolean;
  paymentMethod: 'COD' | 'Stripe' | 'Razorpay' | 'UPI';
  amount: number;
  date: number;
}
```

### DeliveryAddress

```typescript
interface DeliveryAddress {
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  phone: string;
}
```

### ShopContext State Shape

```typescript
interface ShopContextType {
  // Collections
  products: Product[];
  popularProducts: Product[];
  offerProducts: Product[];
  deskDecoratives: Product[];
  wallDecoratives: Product[];
  carDecoratives: Product[];
  businessNeeds: Product[];
  googleReviews: Review[];
  shopCategories: ShopCategory[];
  slides: Slide[];
  catagere: CatagereItem[];
  keywords: string[];

  // Cart
  cartItems: CartItems;
  addToCart: (itemId: string, size: string) => Promise<void>;
  updateQuantity: (itemId: string, size: string, quantity: number) => Promise<void>;
  getCartCount: () => number;
  getCartAmount: () => number;

  // Auth
  token: string;
  setToken: (token: string) => void;

  // Favorites
  favorites: Product[];
  toggleFavorite: (item: Product) => void;
  isFavorite: (id: string) => boolean;

  // UI helpers
  search: string;
  setSearch: (s: string) => void;
  currency: string;          // '₹'
  delivery_fee: number;      // 0
  backendUrl: string;
}
```

### Slide

```typescript
interface Slide {
  _id: string;
  image: { url: string; public_id: string };
  title?: string;
  subtitle?: string;
}
```

### ShopCategory

```typescript
interface ShopCategory {
  _id: string;
  name: string;
  image: { url: string; public_id: string };
  iconType: string;       // maps to icon component
  navigateTo: string;     // route path or filter key
}
```

### Review

```typescript
interface Review {
  _id: string;
  name: string;
  rating: number;
  review: string;
  image?: { url: string };
}
```

---

## Screen-by-Screen Design

### Home Screen (`app/(tabs)/index.tsx`)

Data sources: all ShopContext collections (pre-fetched on app mount).

Sections (mirror `NewLandingPage.jsx` exactly):

| # | Section | Component | Data |
|---|---------|-----------|------|
| 1 | Announce Bar | `AnnounceBar` | static text |
| 2 | Hero Banner | `HeroBanner` | `slides` (auto-playing FlatList) |
| 3 | Category Pills | `CategoryPills` | static icon + label array |
| 4 | Best Sellers | `SectionHeader` + horizontal `FlatList<ProductCard>` | `popularProducts` |
| 5 | Combo Offers | `SectionHeader` + horizontal `FlatList<ProductCard>` | `offerProducts` |
| 6 | Stats Strip | `StatsStrip` | static numbers |
| 7 | Shop by Category | `ShopCategoriesGrid` | `shopCategories` |
| 8 | New Arrivals | `SectionHeader` + horizontal `FlatList<ProductCard>` | `products` (latest 20) |
| 9 | Epic Banner | `<Image>` | static asset |
| 10 | Desk Decoratives | `SectionHeader` + horizontal `FlatList<ProductCard>` | `deskDecoratives` |
| 11 | Wall Decoratives | `SectionHeader` + horizontal `FlatList<ProductCard>` | `wallDecoratives` |
| 12 | Premium Albums | `PremiumAlbums` | static images |
| 13 | Car Decoratives | `SectionHeader` + horizontal `FlatList<ProductCard>` | `carDecoratives` |
| 14 | Business Needs | `SectionHeader` + horizontal `FlatList<ProductCard>` | `businessNeeds` |
| 15 | Offer Countdown Banner | `CountdownBanner` | `useCountdown` hook |
| 16 | Customer Reviews | horizontal `FlatList<ReviewCard>` | `googleReviews` |

The entire screen is wrapped in a single `ScrollView` or `FlatList` with `ListHeaderComponent` / `ListFooterComponent` to enable virtualization of the most data-heavy sections. Countdown runs in `useCountdown` hook via `setInterval` inside `useEffect`, cleared on unmount.

Navigation: tapping any product card → `router.push('/product/' + id)`. Tapping category cards → `router.push(cat.navigateTo)`. "View All" buttons → `router.push('/collections')`.

### Collections Screen (`app/(tabs)/collections.tsx`)

Data sources: `ShopContext.products`, `ShopContext.keywords`.

- Controlled search input → in-memory filter: `products.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query))`
- Category chip row → further filters by `p.category === selectedCategory`
- Sub-category chip row → further filters by `p.subCategory === selectedSub`
- Sort selector: price-asc, price-desc, newest (all pure in-memory sorts, no API calls)
- `FlatList numColumns={2}` with `ProductCard` components
- Keyword chips (from `ShopContext.keywords`) apply as search terms
- Empty state: `EmptyState` component with "No products found" message

### Product Detail Screen (`app/product/[id].tsx`)

Data sources: resolve from `ShopContext.products` first; fallback to `GET /api/product/:id`.

- `ProductGallery`: horizontal `FlatList` of `expo-image` items + `expo-av` for video items; thumbnails row below
- `SizeSelector`: horizontal row of `TouchableOpacity` chips; selected size highlighted in `#e8157e`; disabled/unselected in border-only style
- "Add to Cart" `TouchableOpacity`: disabled (grey) when no size selected; calls `ShopContext.addToCart(id, size)` on press
- "Customize Now" button: navigates to `/contact?product=<name>`
- Related products: `FlatList` filtered to same `category` or `subCategory`, max 20 items, horizontal layout
- Tabs: Description / Reviews (toggle state, renders different content below fold)

### Cart Screen (`app/(tabs)/cart.tsx`)

Data sources: `ShopContext.cartItems`, `ShopContext.products`.

- Maps `cartItems` entries → resolves `Product` from `products` array → renders `CartItem` rows
- `CartItem` qty stepper: `-` button (min 1), quantity display, `+` button (max 99); tap remove icon → `updateQuantity(id, size, 0)`
- Real-time subtotal via `getCartAmount()`; delivery fee displayed as "FREE"
- "Proceed to Checkout" disabled when `getCartCount() === 0`
- Empty state: `EmptyState` with cart illustration + "Shop Now" button → `/collections`
- On screen focus: fetch server cart via `getUserCart()` and merge with local

### Checkout Screen (`app/checkout.tsx`)

Auth guard: redirect to `/login` if `!token`.

Delivery form fields (all required, validated on submit):
`firstName`, `lastName`, `email`, `street`, `city`, `state`, `zipcode`, `country`, `phone`

Payment method selection (radio-style):
1. **COD** — POST `/api/order/place` with `{address, items, amount, paymentMethod: 'COD'}`
2. **UPI** — render `react-native-qrcode-svg` QR from `upi://pay?pa=<upi_id>&am=<amount>` → confirmation checkbox → POST `/api/order/place` with `paymentMethod: 'UPI'`
3. **Razorpay** — POST `/api/order/razorpay` → open `RazorpayCheckout.open(options)` → on success POST `/api/order/verifyRazorpay`

On success: clear cart, play success sound (expo-av), show toast, navigate to `/orders`.

Order summary panel: subtotal = `getCartAmount()`, shipping = "FREE" (delivery_fee = 0), total = subtotal.

### Orders Screen (`app/(tabs)/orders.tsx`)

Auth guard: show "Please login" message + Login button if `!token`.

- POST `/api/order/userorders` with `{ headers: { Authorization: 'Bearer ' + token } }`
- `FlatList` sorted newest-first by `order.date`
- Each row: product name, price, qty, size, order date, payment method, `StatusBadge`
- Status badge colors: Order Placed (grey) → Packing (blue) → Shipped (orange) → Out for Delivery (purple) → Delivered (green)
- Error state: `ErrorBanner` with Retry button
- Empty state: `EmptyState` with "Start Shopping" → `/collections`

### Login / Register Screens

Standard form screens. On success: store JWT via `storage.setToken(jwt)`, call `setToken(jwt)` on ShopContext, call `getUserCart(jwt)`, navigate to `/(tabs)/`.

### Profile Screen (`app/(tabs)/profile.tsx`)

Auth guard: redirect to `/login` if `!token`.

- User name/email display
- Navigation links: My Orders, Privacy Policy, Terms, Payment Policy
- Logout: clear JWT via `storage.removeToken()`, clear cart state, `setToken('')`, navigate to `/login`

---

## API Service Layer

### `services/api.ts`

```typescript
import axios from 'axios';
import { BACKEND_URL } from '../constants/config';
import { storage } from './storage';
import { router } from 'expo-router';

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 15000,
});

// Request interceptor: attach JWT if present
api.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 → clear auth + redirect
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const code = error.response?.data?.code;
      if (code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN') {
        await storage.removeToken();
        // ShopContext clears cart via token change effect
        router.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### `services/storage.ts`

```typescript
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const TOKEN_KEY = 'em_jwt';
const CART_KEY = 'em_cart';
const FAVORITES_KEY = 'em_favorites';

export const storage = {
  // JWT — SecureStore on native, AsyncStorage on web (no SecureStore on web)
  async getToken(): Promise<string | null> {
    if (Platform.OS === 'web') return AsyncStorage.getItem(TOKEN_KEY);
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async setToken(value: string): Promise<void> {
    if (Platform.OS === 'web') return AsyncStorage.setItem(TOKEN_KEY, value);
    return SecureStore.setItemAsync(TOKEN_KEY, value);
  },
  async removeToken(): Promise<void> {
    if (Platform.OS === 'web') return AsyncStorage.removeItem(TOKEN_KEY);
    return SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  // Cart — AsyncStorage on all platforms
  async getCart(): Promise<CartItems | null> {
    const raw = await AsyncStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  async setCart(cart: CartItems): Promise<void> {
    return AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
  },

  // Favorites
  async getFavorites(): Promise<Product[]> {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  },
  async setFavorites(favs: Product[]): Promise<void> {
    return AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  },
};
```

### `context/ShopContext.tsx` — Key Differences from Web

| Concern | Web (ShopContext.jsx) | Mobile (ShopContext.tsx) |
|---|---|---|
| JWT storage | `localStorage.getItem('token')` | `storage.getToken()` (async) |
| JWT write | `localStorage.setItem('token', t)` | `storage.setToken(t)` |
| JWT remove | `localStorage.removeItem('token')` | `storage.removeToken()` |
| Cart persistence | none (in-memory only) | `useEffect` → `storage.setCart(cartItems)` |
| Favorites persistence | `localStorage` | `storage.setFavorites(favorites)` |
| Navigation | `useNavigate()` from react-router-dom | `useRouter()` from expo-router |
| Toast | `react-toastify` | `react-native-toast-message` |
| Backend URL | `import.meta.env.VITE_BACKEND_URL` | `Constants.expoConfig.extra.backendUrl` |
| fetchData | `axios.get` | `api.get` (shared axios instance) |

All data fields, cart functions (`addToCart`, `updateQuantity`, `getCartCount`, `getCartAmount`), and business logic are **identical** to the web version.

---

## Navigation Structure

```
app/
├── _layout.tsx               # Root: ShopContextProvider, Toast, ThemeProvider
└── (tabs)/
    ├── _layout.tsx            # Bottom tab bar
    │   ├── Home     (index)   ← default
    │   ├── Collections
    │   ├── Cart               ← badge = getCartCount()
    │   ├── Orders             ← auth guard
    │   └── Profile            ← auth guard
    └── [each tab has its own Stack for nested navigation]

Stack routes (accessible from any tab):
  /product/[id]
  /checkout
  /login
  /register
  /contact
  /about
  /privacy-policy
  /terms
  /payment-policy
```

### Bottom Tab Configuration

```typescript
// app/(tabs)/_layout.tsx (conceptual)
<Tabs
  screenOptions={({ route }) => ({
    tabBarIcon: ({ color, size }) => <TabIcon route={route} color={color} size={size} />,
    tabBarBadge: route.name === 'cart' ? getCartCount() || undefined : undefined,
    tabBarActiveTintColor: '#e8157e',
    tabBarInactiveTintColor: '#888',
  })}
>
  <Tabs.Screen name="index"       options={{ title: 'Home' }} />
  <Tabs.Screen name="collections" options={{ title: 'Collections' }} />
  <Tabs.Screen name="cart"        options={{ title: 'Cart' }} />
  <Tabs.Screen name="orders"      options={{ title: 'Orders' }} />
  <Tabs.Screen name="profile"     options={{ title: 'Profile' }} />
</Tabs>
```

Auth guards are implemented as `useEffect` hooks in the Orders and Profile screens:

```typescript
useEffect(() => {
  if (!token) router.replace('/login');
}, [token]);
```

Deep link configuration (in `app.json`):

```json
{
  "expo": {
    "scheme": "epicmoments",
    "web": { "bundler": "metro" },
    "plugins": [["expo-router", { "origin": "https://epicmoments.in" }]]
  }
}
```

Push notification tap → navigate to `/orders` via `router.push('/orders')` in the notification handler.

---

## Platform Differences

| Feature | Android / iOS | Web |
|---|---|---|
| JWT storage | `expo-secure-store` (hardware-backed) | `AsyncStorage` (localStorage adapter) |
| Push notifications | `@react-native-firebase/messaging` (native FCM) | Firebase Web SDK (`firebase/messaging`) |
| Payment — Razorpay | `react-native-razorpay` native SDK sheet | Redirect to Razorpay checkout URL via `Linking.openURL` |
| Video playback | `expo-av` / `expo-video` native player | `expo-av` web fallback (`<video>`) |
| Navigation animations | Native stack transitions | CSS-based web transitions |
| Notification permission | `messaging().requestPermission()` | `Notification.requestPermission()` |
| App icon + splash | `app.json` native assets | Web manifest |

### Push Notifications Flow

```
1. App launch
       │
       ▼
2. Request permission
   (iOS: system prompt; Android 13+: system prompt; Web: browser prompt)
       │
       ▼ granted
3. Get FCM device token
   Native: messaging().getToken()
   Web:    getToken(messaging, { vapidKey: VAPID_KEY })
       │
       ▼
4. POST /api/user/save-fcm  { fcmToken, userId }
       │
       ▼
5. Foreground notification received
   → show react-native-toast-message banner (title + body)
       │
   Background / terminated
   → OS system notification tray
       │
       ▼
6. User taps notification
   → notification.data.screen determines route
   → router.push(notification.data.screen ?? '/orders')
```

### Socket.IO Integration

```typescript
// hooks/useAuth.ts
import io from 'socket.io-client';

useEffect(() => {
  if (!token) return;
  const socket = io(BACKEND_URL);
  const { id: userId } = decodeJwt(token);
  socket.emit('user_online', userId);

  return () => {
    socket.disconnect();  // marks user offline on background/close
  };
}, [token]);
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: JWT Expiry Clearing

*For any* JWT token string whose decoded `exp` claim is less than the current Unix timestamp, the app's token validation logic SHALL return an empty string and clear storage, while for any JWT whose `exp` is greater than or equal to the current time, the token SHALL be returned unchanged.

**Validates: Requirements 2.4, 15.5**

---

### Property 2: Countdown Decomposition Correctness

*For any* non-negative integer representing total seconds `T`, the `useCountdown` decomposition into days `d`, hours `h`, minutes `m`, and seconds `s` SHALL satisfy: `d * 86400 + h * 3600 + m * 60 + s === T`, with `0 ≤ h < 24`, `0 ≤ m < 60`, and `0 ≤ s < 60`.

**Validates: Requirements 3.10**

---

### Property 3: Home Screen Renders Without Crash on Partial Failure

*For any* combination of API endpoints that return errors (mocked failures), the Home screen SHALL render the remaining available sections without throwing an uncaught exception or displaying a blank screen, and SHALL NOT crash.

**Validates: Requirements 3.11, 15.1**

---

### Property 4: Product Search Filter Correctness

*For any* product list and any non-empty search query string, every item in the filtered result SHALL have its `name` or `category` contain the query string (case-insensitive), and no product whose `name` or `category` contains the query string SHALL be absent from the result.

**Validates: Requirements 4.2, 4.8**

---

### Property 5: Category Filter Soundness

*For any* product list and any selected category value, every product in the filtered result SHALL have `product.category === selectedCategory`, and the filter SHALL never include a product from a different category.

**Validates: Requirements 4.3**

---

### Property 6: Sort Order Invariant

*For any* product list, after applying a sort:
- Price ascending: for every consecutive pair `(a, b)`, `a.price ≤ b.price`
- Price descending: for every consecutive pair `(a, b)`, `a.price ≥ b.price`
- Newest: for every consecutive pair `(a, b)`, `a.date ≥ b.date`

**Validates: Requirements 4.4**

---

### Property 7: Discount Percentage Calculation

*For any* product where `originalPrice > price > 0`, the rendered product card SHALL display a discount percentage equal to `Math.round((1 - price / originalPrice) * 100)`, and no discount indicator SHALL appear when `originalPrice` is absent or `originalPrice ≤ price`.

**Validates: Requirements 4.5**

---

### Property 8: Product Detail Renders All Required Fields

*For any* valid `Product` object, rendering the Product Detail screen SHALL produce a view containing the product's `name`, `category`, `price`, `originalPrice` (when present), `rating` (when present), `description`, and at least one image from `images`. All required UI elements (size selector when `sizes` is non-empty, Add to Cart button, Customize Now button) SHALL be present.

**Validates: Requirements 5.1, 5.9**

---

### Property 9: Product Resolution Cache-First

*For any* product ID that exists in `ShopContext.products`, rendering the Product Detail screen SHALL resolve the product from local state without triggering a network request to `/api/product/:id`.

**Validates: Requirements 5.2**

---

### Property 10: Add to Cart Size Requirement

*For any* product with a non-empty `sizes` array, the "Add to Cart" button SHALL be in a disabled state when no size is selected, and SHALL become enabled after any size from the `sizes` array is selected. Tapping "Add to Cart" without a selected size SHALL display an inline error message and SHALL NOT modify `cartItems`.

**Validates: Requirements 5.5, 5.7**

---

### Property 11: Add to Cart Round-Trip

*For any* product ID and valid size string, after calling `addToCart(productId, size)`, the resulting `cartItems` SHALL contain `cartItems[productId][size] >= 1`. Calling `addToCart` again with the same arguments SHALL increment the quantity by exactly 1.

**Validates: Requirements 5.6, 6.3**

---

### Property 12: Related Products Category Invariant

*For any* product `P`, every item in the Related Products list SHALL satisfy `item.category === P.category || item.subCategory === P.subCategory`, and no item with a different category AND different subCategory SHALL appear in the list.

**Validates: Requirements 5.8**

---

### Property 13: Cart Total Accuracy

*For any* `cartItems` state and corresponding `products` array, `getCartAmount()` SHALL equal the sum of `product.price * quantity` for every `(productId, size, quantity)` triple in `cartItems` where a matching product exists.

**Validates: Requirements 6.5, 7.9**

---

### Property 14: Cart Item Removal

*For any* product ID and size present in `cartItems`, calling `updateQuantity(id, size, 0)` SHALL result in `cartItems[id][size]` being `0` or the key being absent, and `getCartCount()` SHALL decrease by the prior quantity for that `(id, size)` pair.

**Validates: Requirements 6.4**

---

### Property 15: Cart Persistence Round-Trip

*For any* `cartItems` state, serializing it to `AsyncStorage` via `storage.setCart(cartItems)` and then deserializing via `storage.getCart()` SHALL produce a structurally equivalent object with identical product IDs, sizes, and quantities.

**Validates: Requirements 15.4, 15.1**

---

### Property 16: Auth Guard Redirect

*For any* app state where `token` is an empty string or `null`, navigating to the Orders screen or Profile screen SHALL redirect to the Login screen, and the user SHALL NOT reach the protected screen content.

**Validates: Requirements 7.8, 13.4**

---

### Property 17: Order Placement Clears Cart

*For any* non-empty `cartItems` state, after a successful order placement API response (mocked 2xx), `getCartCount()` SHALL return `0` and `cartItems` SHALL be an empty object.

**Validates: Requirements 7.6**

---

### Property 18: Checkout Form Validation

*For any* delivery form submission where at least one of the nine required fields (`firstName`, `lastName`, `email`, `street`, `city`, `state`, `zipcode`, `country`, `phone`) is empty or whitespace-only, the form submission SHALL be blocked, no API call SHALL be made, and at least one validation error SHALL be displayed.

**Validates: Requirements 7.1**

---

### Property 19: API Error Message Display

*For any* API error response object that contains a `message` string field, the displayed toast or error UI SHALL show text that matches the `message` field from the response, ensuring users receive the backend's error description verbatim.

**Validates: Requirements 15.2**

---

### Property 20: Retry Count Bound

*For any* initial data fetch call (products, slides, categories) that returns an error, the retry logic SHALL attempt the call at most 3 additional times before surfacing an error state to the UI, with each retry delay following an exponential back-off pattern (base delay × 2^attemptNumber).

**Validates: Requirements 15.3**

---

## Error Handling

### Network Errors

- **No connectivity**: `NetInfo` from `@react-native-community/netinfo` monitors connectivity. When offline, `ErrorBanner` is shown at the top of the screen. Locally cached data (cart from AsyncStorage, token from SecureStore) remains available.
- **Timeout** (> 15s): axios timeout fires → treated as a network error → same `ErrorBanner` display.

### API Errors

- **2xx with `success: false`**: The `fetchData` helper treats this as an empty result; no crash, no toast.
- **4xx / 5xx**: Response interceptor catches these. Error `message` field is extracted from `error.response.data.message` and passed to `react-native-toast-message`.
- **401**: Interceptor clears JWT, cart state, shows "Session expired" toast, redirects to `/login`.

### Retry Logic

Initial data fetches (products, slides, categories, etc.) wrap `fetchData` in a retry helper:

```typescript
async function fetchWithRetry(url: string, setter: Function, key?: string, maxRetries = 3) {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      await fetchData(url, setter, key);
      return;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await delay(1000 * Math.pow(2, attempt));
      attempt++;
    }
  }
}
```

### Form Validation

All form submissions (checkout delivery form, login, register, contact) validate required fields client-side before any API call. Errors are displayed inline below each field using a red helper text component.

### Empty States

Every list screen and section handles empty data gracefully:
- Empty products after filter → "No products found" with search illustration
- Empty cart → cart illustration with "Shop Now" CTA
- Empty orders → order illustration with "Start Shopping" CTA
- Empty category section → "Coming Soon" placeholder (no crash)

---

## Testing Strategy

### Dual Testing Approach

Both unit/example tests and property-based tests are used together for comprehensive coverage.

**Unit/example tests** target specific scenarios:
- Login success and failure flows (mocked API responses)
- Navigation from product card to detail screen
- Razorpay/UPI/COD order placement flows
- FCM token registration
- Empty state rendering
- Auth guard redirects with specific token states

**Property-based tests** target universal invariants (see Correctness Properties section above):
- All 20 correctness properties are implemented as property-based tests

### Property-Based Testing

**Library**: [fast-check](https://github.com/dubzzz/fast-check) — works in Jest/Vitest environments used with Expo, no native dependencies, well-maintained.

**Configuration**: minimum 100 iterations per property test (fast-check default is 100 runs; set explicitly via `{ numRuns: 100 }`).

**Tag format**: each property test includes a comment:
```typescript
// Feature: epic-moments-mobile-app, Property N: <property_text>
```

**Example — Property 2 (Countdown Decomposition)**:

```typescript
import fc from 'fast-check';
import { decomposeSeconds } from '../hooks/useCountdown';

// Feature: epic-moments-mobile-app, Property 2: countdown decomposition correctness
test('countdown decomposition: d*86400 + h*3600 + m*60 + s === totalSeconds', () => {
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 10_000_000 }), (totalSecs) => {
      const { d, h, m, s } = decomposeSeconds(totalSecs);
      expect(d * 86400 + h * 3600 + m * 60 + s).toBe(totalSecs);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(24);
      expect(m).toBeGreaterThanOrEqual(0);
      expect(m).toBeLessThan(60);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThan(60);
    }),
    { numRuns: 100 }
  );
});
```

**Example — Property 4 (Search Filter Correctness)**:

```typescript
import fc from 'fast-check';
import { filterProducts } from '../context/ShopContext';

// Feature: epic-moments-mobile-app, Property 4: product search filter correctness
test('filtered products all match the search query', () => {
  const productArb = fc.record({
    _id: fc.uuid(),
    name: fc.string(),
    category: fc.string(),
    price: fc.integer({ min: 1 }),
    sizes: fc.array(fc.string()),
    images: fc.array(fc.webUrl()),
  });

  fc.assert(
    fc.property(fc.array(productArb), fc.string({ minLength: 1 }), (products, query) => {
      const results = filterProducts(products, query);
      const lq = query.toLowerCase();
      // All results must match
      results.forEach(p => {
        expect(
          p.name.toLowerCase().includes(lq) || p.category.toLowerCase().includes(lq)
        ).toBe(true);
      });
      // No matches should be missing
      const matchingIds = new Set(
        products
          .filter(p => p.name.toLowerCase().includes(lq) || p.category.toLowerCase().includes(lq))
          .map(p => p._id)
      );
      expect(new Set(results.map(p => p._id))).toEqual(matchingIds);
    }),
    { numRuns: 100 }
  );
});
```

### Test Structure

```
mobile/
└── __tests__/
    ├── unit/
    │   ├── auth.test.ts          # Login, register, JWT expiry
    │   ├── navigation.test.ts    # Route guards, deep links
    │   ├── cart.test.ts          # Cart operations (unit examples)
    │   ├── checkout.test.ts      # Form validation, payment flows
    │   └── screens/              # Screen rendering example tests
    └── property/
        ├── cart.property.ts      # Properties 11, 13, 14, 15
        ├── auth.property.ts      # Property 1
        ├── countdown.property.ts # Property 2
        ├── home.property.ts      # Property 3
        ├── search.property.ts    # Properties 4, 5, 6, 7
        ├── product.property.ts   # Properties 8, 9, 10, 12
        ├── checkout.property.ts  # Properties 16, 17, 18
        └── error.property.ts     # Properties 19, 20
```

### Integration Tests

Integration tests use mocked axios (via `jest-mock-axios`) and mocked `expo-secure-store` / `AsyncStorage`. They verify:
- Home screen API wiring (all 8 data fetches called on mount)
- Cart sync with server (`GET /api/cart/get` called on authenticated Cart screen open)
- Order placement API calls for each payment method
- FCM token save after auth

No real network calls or native SDK calls in test suite.

### Running Tests

```bash
cd mobile
npx jest --runInBand          # single run, no watch mode
npx jest --testPathPattern=property  # property tests only
npx jest --testPathPattern=unit      # unit tests only
```

---

## Tech Stack Summary

| Concern | Library | Rationale |
|---|---|---|
| Framework | Expo SDK 51+ (managed) | Zero native config, OTA updates, EAS Build |
| Navigation | expo-router v3 | File-based routing, deep links, web URL parity |
| State | React Context (ShopContext) | Direct port of working web pattern; no new concepts |
| HTTP client | axios | Same as web; interceptors pattern already proven |
| JWT storage | expo-secure-store | Hardware-backed on device; falls back to AsyncStorage on web |
| Cart / favorites storage | @react-native-async-storage/async-storage | Cross-platform, widely tested |
| Images | expo-image | Lazy loading, caching, Cloudinary URL support |
| Video | expo-av | Works on all three platforms |
| Styling | NativeWind (Tailwind for RN) + StyleSheet | Familiar class names; close to existing web CSS utility classes |
| Toast notifications | react-native-toast-message | Drop-in replacement for react-toastify |
| QR code | react-native-qrcode-svg | SVG-based, works on all platforms |
| Razorpay | react-native-razorpay | Official native SDK for Android + iOS |
| Push notifications (native) | @react-native-firebase/messaging | Full FCM support |
| Push notifications (web) | firebase (JS SDK) | Matches existing web frontend setup |
| Socket.IO | socket.io-client | Same as web |
| Property testing | fast-check | Works in Jest, no native deps, excellent TypeScript support |
| Unit testing | Jest + @testing-library/react-native | Standard Expo test setup |

---

## Design Decisions and Rationale

1. **Separate `mobile/` directory (not a monorepo merge)**: The existing `frontend/` is a mature Vite + React app. Merging it with an Expo project would require significant toolchain changes with high regression risk. A separate directory with its own `package.json` isolates the mobile build pipeline completely.

2. **ShopContext pattern (not Zustand)**: The web frontend already has a well-tested ShopContext pattern. Reusing the same pattern in the mobile app means the team only needs to learn one new concept (the storage layer swap) rather than adopting a new state management library. Zustand can be introduced later as a performance optimization if context re-renders become an issue.

3. **NativeWind over plain StyleSheet**: NativeWind lets the team reuse Tailwind class knowledge from the web codebase and write styles that look visually close to the web CSS utility classes already in use. The brand palette is centralized in `constants/colors.ts` and mapped to NativeWind theme tokens.

4. **`expo-image` over `Image` from React Native core**: Expo Image provides automatic caching, better Cloudinary URL support (width transforms), lazy loading, and a `placeholder` prop for blur-up previews — all needed given the product catalog uses Cloudinary-hosted media.

5. **fast-check for property testing**: Fast-check is a pure JavaScript library with no native dependencies, making it compatible with Expo's Jest environment. It has first-class TypeScript support and the widest set of built-in arbitraries for generating product-like data.

6. **Retry with exponential back-off**: The home screen fetches 12 API endpoints in parallel. On slow or unstable connections, without retry logic, a single transient failure could leave an entire section empty. Three retries with exponential back-off (1s, 2s, 4s) handles most transient errors without hammering the server.

7. **Cart badge uses `getCartCount()`**: The badge value is derived from the same `getCartCount()` function used everywhere else in the app, ensuring the badge never shows a stale count. It re-renders whenever `cartItems` changes via the ShopContext value.
