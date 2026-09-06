# Requirements Document

## Introduction

This document defines the requirements for the **Epic Moments Mobile App** — a cross-platform React Native application built with Expo that delivers the full Epic Moments customer shopping experience on Android, iOS, and Web. The app consumes the existing Node.js/Express/MongoDB REST API and replicates all customer-facing functionality of the current React web frontend, including browsing personalized gifts, cart management, checkout with Razorpay/UPI/COD, order tracking, push notifications via Firebase FCM, and enquiry submission.

The app is a single Expo codebase targeting Android, iOS, and React Native Web (replacing or complementing the current Vite/React web frontend for mobile users).

---

## Glossary

- **App**: The Epic Moments React Native + Expo mobile application.
- **Backend**: The existing Node.js + Express + MongoDB REST API server.
- **Auth_Service**: The JWT-based authentication layer exposed at `/api/user` endpoints.
- **Product**: A personalized gift item stored in MongoDB and served via `/api/product`.
- **Cart**: The per-user shopping cart stored server-side via `/api/cart` and mirrored in local state.
- **Order**: A placed order stored via `/api/order`, including payment status and delivery details.
- **Category**: A product grouping (e.g., Desk Decoratives, Wall Decoratives, Car Decoratives, Business Needs, Shop Categories).
- **Slide**: A banner/hero image managed via `/api/slides` and shown on the home screen.
- **Popular_Product**: A curated best-seller item served via `/api/popular`.
- **Offer_Product**: A combo/discounted product served via `/api/offer`.
- **Decorative**: A specialized product in one of the sub-collections: DeskDecoratives, WallDecoratives, or CarDecoratives.
- **BusinessNeed**: A corporate gifting product served via `/api/businessneeds`.
- **ShopCategory**: A navigable storefront category served via `/api/shopcategory`.
- **Review**: A Google Review item served via `/api/googlereviews`.
- **Enquiry**: A contact/support message submitted via `/api/enquiries`.
- **FCM_Token**: A Firebase Cloud Messaging device token used to deliver push notifications.
- **JWT**: A JSON Web Token issued by the Backend on login/register, stored securely on device.
- **Razorpay**: The primary payment gateway integrated in the Backend.
- **UPI**: A direct UPI QR-code payment flow available at checkout.
- **COD**: Cash on Delivery payment option.
- **Navigator**: The Expo Router / React Navigation stack managing screen transitions.
- **ShopContext**: The global React context providing shared state (products, cart, token, etc.) across the App.

---

## Requirements

### Requirement 1: Project Foundation and Cross-Platform Setup

**User Story:** As a developer, I want a single Expo-managed React Native codebase that runs on Android, iOS, and Web, so that I can maintain one project for all platforms.

#### Acceptance Criteria

1. THE App SHALL be initialised as an Expo managed-workflow project using the `expo` SDK with `expo-router` for file-based navigation.
2. THE App SHALL target Android (API 24+), iOS (14+), and Web via React Native Web within a single codebase.
3. THE App SHALL connect exclusively to the existing Backend REST API and SHALL NOT duplicate server-side business logic.
4. WHEN the App is built for Web, THE App SHALL produce an output that is functionally equivalent to the current React web frontend for all customer-facing screens.
5. THE App SHALL store the Backend base URL as a configurable environment variable accessible via `expo-constants` or `react-native-dotenv`.
6. THE App SHALL use TypeScript or JavaScript with ESLint configured to maintain code quality.
7. THE App SHALL use a shared `ShopContext` (or equivalent Zustand/Redux store) providing products, cart, token, and all collection data to every screen.

---

### Requirement 2: Authentication

**User Story:** As a customer, I want to register and log in with my email and password, so that I can access my cart, orders, and personalized experience.

#### Acceptance Criteria

1. THE App SHALL provide a Login screen and a Register screen reachable from the main Navigator.
2. WHEN a user submits valid credentials on the Login screen, THE Auth_Service SHALL return a JWT, and THE App SHALL store it securely using `expo-secure-store`.
3. WHEN a user submits a registration form with name, email, and password, THE Auth_Service SHALL create a new account and return a JWT that THE App stores using `expo-secure-store`.
4. IF the submitted email or password is invalid, THEN THE App SHALL display an inline error message to the user within 1 second.
5. WHEN the stored JWT is expired (checked via local exp-claim decode), THE App SHALL clear the token from `expo-secure-store`, clear the cart state, and redirect the user to the Login screen.
6. WHEN a 401 HTTP response is received from the Backend, THE App SHALL clear the JWT, clear the cart state, show a "Session expired" toast, and redirect to the Login screen.
7. WHEN a user taps "Log out", THE App SHALL remove the JWT from `expo-secure-store`, clear all user-specific state, and navigate to the Login screen.
8. WHILE a user is authenticated, THE App SHALL emit a Socket.IO `user_online` event with the user's ID to the Backend to update the user's active status.
9. WHEN the app enters the background or is closed while a user is authenticated, THE App SHALL the disconnect from the Socket.IO connection so the Backend marks the user offline.

---

### Requirement 3: Home Screen

**User Story:** As a customer, I want to see a rich home screen with banners, categories, and featured products, so that I can discover what Epic Moments offers.

#### Acceptance Criteria

1. THE App SHALL display a Home screen as the default route that renders an announcement bar, hero section, category pills, best sellers, combo offers, stats strip, shop categories grid, new arrivals, decoratives sections, business needs, and customer reviews — matching the web `NewLandingPage` layout adapted for mobile.
2. WHEN the Home screen loads, THE App SHALL fetch Slides from `/api/slides/list` and display them in an auto-playing banner carousel.
3. WHEN the Home screen loads, THE App SHALL fetch Popular_Products from `/api/popular/list` and display them in a horizontal scrollable list labelled "Best Sellers".
4. WHEN the Home screen loads, THE App SHALL fetch Offer_Products from `/api/offer/list` and display them in a horizontal scrollable list labelled "Combo Offers".
5. WHEN the Home screen loads, THE App SHALL fetch ShopCategories from `/api/shopcategory/list` and display them in a grid of tappable cards.
6. WHEN the Home screen loads, THE App SHALL fetch Decoratives from `/api/deskdecoratives/list`, `/api/walldecoratives/list`, `/api/cardecoratives/list` and display each collection in a dedicated labelled horizontal section.
7. WHEN the Home screen loads, THE App SHALL fetch BusinessNeeds from `/api/businessneeds/list` and display them in a labelled horizontal section.
8. WHEN the Home screen loads, THE App SHALL fetch Reviews from `/api/googlereviews/list` and display them in a horizontal scrollable section labelled "What Our Customers Say".
9. WHEN a user taps any category pill, product card, or "View All" button on the Home screen, THE Navigator SHALL route to the relevant Collection or Product screen.
10. THE App SHALL display a countdown timer on the limited-time offer banner that counts down from a configurable target time without blocking the UI thread.
11. IF any Home screen data fetch fails, THEN THE App SHALL display the rest of the screen with empty sections and SHALL NOT crash.

---

### Requirement 4: Product Collection and Filtering

**User Story:** As a customer, I want to browse all products with search and filter capabilities, so that I can find the product I want.

#### Acceptance Criteria

1. THE App SHALL provide a Collection screen that displays all Products fetched from `/api/product/list`.
2. WHEN a user types in the search bar on the Collection screen, THE App SHALL filter the displayed products in real time to match products whose name or category contains the search term (case-insensitive).
3. THE App SHALL provide filter controls for Category and Sub-Category that narrow the product list when selected.
4. THE App SHALL provide sort options (price low-to-high, price high-to-low, newest) that reorder the product list without a network request.
5. THE App SHALL display each product as a card showing the product image, name, price, and original price (with discount percentage if applicable).
6. WHEN a user taps a product card, THE Navigator SHALL route to the Product Detail screen for that product.
7. IF the product list is empty after filtering, THEN THE App SHALL display a "No products found" message.
8. WHEN a user taps a keyword from the keyword list (fetched from `/api/keyword`), THE App SHALL filter the Collection screen to products matching that keyword.

---

### Requirement 5: Product Detail Screen

**User Story:** As a customer, I want to view full product details including images, price, sizes, and description, so that I can make an informed purchase decision.

#### Acceptance Criteria

1. THE App SHALL display a Product Detail screen showing the product name, category, media gallery (images and video), price, original price, discount percentage, star rating, size selector, description tab, and reviews tab.
2. WHEN the Product Detail screen loads, THE App SHALL resolve the product from local state if available, otherwise fetch it from the Backend.
3. WHEN a product has multiple media items, THE App SHALL display them in a scrollable or swipeable gallery with thumbnails.
4. WHEN a product has video media, THE App SHALL render it with native playback controls using `expo-video` or `expo-av`.
5. THE App SHALL display size selection buttons when a product has sizes; THE App SHALL require a size to be selected before the "Add to Cart" button is enabled.
6. WHEN a user taps "Add to Cart" with a size selected, THE App SHALL call `/api/cart/add` (if authenticated) and update the local cart state, then display a brief confirmation feedback.
7. IF the user taps "Add to Cart" without selecting a size, THEN THE App SHALL display an inline error message "Please select a size" without navigating away.
8. THE App SHALL display a "Related Products" section at the bottom of the Product Detail screen, showing products with the same category or sub-category.
9. THE App SHALL display a "Customize Now" affordance on the Product Detail screen that opens an enquiry/contact flow pre-filled with the product name.

---

### Requirement 6: Cart

**User Story:** As a customer, I want to view and manage my cart, so that I can review my items before checkout.

#### Acceptance Criteria

1. THE App SHALL display a Cart screen showing all items in the cart with product image, name, selected size, quantity, and line-item price.
2. WHEN an authenticated user opens the Cart screen, THE App SHALL fetch the server-side cart from `/api/cart/get` and merge it with local state.
3. WHEN a user changes an item's quantity in the Cart screen, THE App SHALL call `/api/cart/update` (if authenticated) and reflect the updated totals in real time.
4. WHEN a user sets an item's quantity to zero or taps a remove button, THE App SHALL remove that item from the cart both locally and via `/api/cart/update`.
5. THE App SHALL display a running cart total (subtotal) updated in real time as quantities change.
6. THE App SHALL display a "Proceed to Checkout" button that is enabled only when the cart is non-empty.
7. IF the cart is empty, THEN THE App SHALL display an empty-cart illustration with a "Shop Now" button that navigates to the Collection screen.
8. THE App SHALL display a cart item count badge on the Cart tab icon reflecting the current total item count from `getCartCount`.

---

### Requirement 7: Checkout and Order Placement

**User Story:** As a customer, I want to enter my delivery details and pay, so that I can complete my purchase.

#### Acceptance Criteria

1. THE App SHALL provide a Checkout screen (Place Order) with a delivery information form collecting: first name, last name, email, street address, city, state, pincode, country, and phone number — all required fields validated before submission.
2. THE App SHALL present three payment method options: Cash on Delivery (COD), UPI / QR Code, and Razorpay — matching the web checkout options.
3. WHEN a user selects COD and taps "Place Order", THE App SHALL call `POST /api/order/place` with the delivery form and cart items, clear the cart on success, and navigate to the Orders screen.
4. WHEN a user selects Razorpay, THE App SHALL call `POST /api/order/razorpay` to create an order, then open the Razorpay SDK payment sheet using `react-native-razorpay`, and on payment success call `POST /api/order/verifyRazorpay`.
5. WHEN a user selects UPI, THE App SHALL display a QR code generated from the UPI deep link (using `react-native-qrcode-svg`) and a confirmation checkbox; WHEN the user confirms payment, THE App SHALL call `POST /api/order/place` with `payment_method: 'upi'`.
6. WHEN an order is placed successfully (any method), THE App SHALL clear the cart, play a brief success sound, display a success toast, and navigate to the Orders screen.
7. IF an order placement API call fails, THEN THE App SHALL display an error toast with the Backend's error message and remain on the Checkout screen.
8. IF a user reaches the Checkout screen without being logged in, THEN THE App SHALL redirect the user to the Login screen and retain the cart contents.
9. THE App SHALL display an order summary panel showing subtotal, shipping (free), and total before the user places the order.

---

### Requirement 8: Orders Screen

**User Story:** As a customer, I want to view my order history and status, so that I can track my purchases.

#### Acceptance Criteria

1. THE App SHALL provide an Orders screen that fetches order history from `POST /api/order/userorders` using the stored JWT.
2. THE App SHALL display each order item with: product name, price, quantity, size, order date, payment method, and order status.
3. WHEN the order status is "Order Placed", "Packing", "Shipped", "Out for Delivery", or "Delivered", THE App SHALL display a corresponding visual status indicator.
4. THE App SHALL display orders in reverse chronological order (most recent first).
5. IF the user is not authenticated when opening the Orders screen, THEN THE App SHALL display a "Please login to see your orders" message with a Login button.
6. IF the orders API call fails, THEN THE App SHALL display an error message with a "Retry" button.
7. IF the user has no orders, THEN THE App SHALL display an empty state with a "Start Shopping" button that navigates to the Collection screen.

---

### Requirement 9: Push Notifications (Firebase FCM)

**User Story:** As a customer, I want to receive push notifications about orders and promotions, so that I stay informed.

#### Acceptance Criteria

1. THE App SHALL initialise Firebase using `@react-native-firebase/app` or the Expo Firebase SDK and request notification permissions on first launch (Android and iOS).
2. WHEN a user is authenticated, THE App SHALL retrieve the device FCM_Token using the Firebase Messaging SDK and call `POST /api/user/save-fcm` with the token and the user's JWT.
3. WHEN the app is in the foreground and a push notification is received, THE App SHALL display an in-app toast notification with the notification title and body.
4. WHEN the app is in the background or terminated and a push notification is received, THE App SHALL display it as a system notification.
5. WHEN a user taps a push notification, THE App SHALL open and navigate to the relevant screen (e.g., Orders screen for an order update).
6. IF the user denies notification permission, THEN THE App SHALL continue to function fully without push notifications and SHALL NOT repeatedly prompt for permission.
7. WHERE the platform is Web, THE App SHALL use the existing Firebase Web SDK (as used in the current web frontend) for push notifications instead of the native Firebase SDK.

---

### Requirement 10: Contact / Enquiry

**User Story:** As a customer, I want to submit a contact message or customisation enquiry, so that I can communicate with Epic Moments.

#### Acceptance Criteria

1. THE App SHALL provide a Contact screen with a form collecting: name, email, phone (optional), subject (optional), and message.
2. WHEN a user submits the contact form, THE App SHALL call `POST /api/enquiries` with the form data and display a "Message sent successfully" confirmation on success.
3. IF the enquiry API call fails, THEN THE App SHALL display an error message and keep the form data intact so the user can retry.
4. THE Contact screen SHALL display Epic Moments' phone number, email address, Instagram handle, Facebook link, and physical address.
5. THE Contact screen SHALL include an embedded map view showing the business location (Gullapalli, Andhra Pradesh).

---

### Requirement 11: About Screen

**User Story:** As a customer, I want to read about Epic Moments, so that I can understand the brand's story and values.

#### Acceptance Criteria

1. THE App SHALL provide an About screen that displays the Epic Moments brand story, mission, and key values (premium quality, fast delivery, 100% secure payments, easy returns).
2. THE About screen SHALL display trust statistics (e.g., 5000+ happy customers, 4.8 average rating, 100+ unique products).
3. THE About screen SHALL provide links to Epic Moments' social media profiles (Instagram, Facebook).

---

### Requirement 12: Category Browsing

**User Story:** As a customer, I want to browse products by category (Desk Decoratives, Wall Decoratives, Car Decoratives, Business Needs, Shop Categories), so that I can find relevant products efficiently.

#### Acceptance Criteria

1. THE App SHALL provide dedicated list screens for: Desk Decoratives, Wall Decoratives, Car Decoratives, Business Needs, and Shop Categories, each fetching from their respective API endpoints.
2. WHEN a user taps a ShopCategory card on the Home screen, THE Navigator SHALL route to the Collection screen filtered to that category, using the category's `navigateTo` property as the filter key.
3. WHEN a user taps a Decorative item card, THE Navigator SHALL route to the Product Detail screen for that item.
4. THE App SHALL display each category collection as a vertically scrollable grid of product cards with image, name, and price.
5. WHEN a category section has no items, THE App SHALL display a "Coming Soon" placeholder and SHALL NOT crash.

---

### Requirement 13: Navigation Structure

**User Story:** As a customer, I want intuitive navigation with a bottom tab bar and stack screens, so that I can move through the app naturally.

#### Acceptance Criteria

1. THE App SHALL implement a bottom tab navigator with tabs for: Home, Collections, Cart, Orders, and Profile/Account.
2. THE App SHALL implement stack navigators within each tab for deeper navigation (e.g., Product Detail, Checkout, Category screens).
3. THE App SHALL display a badge on the Cart tab showing the current cart item count from `getCartCount`.
4. WHEN an unauthenticated user taps the Orders or Profile tab, THE Navigator SHALL redirect to the Login screen.
5. THE App SHALL support deep linking so that external URLs (e.g., from push notifications) open the correct screen.
6. THE App SHALL include a hamburger menu or drawer for supplementary screens: About, Contact, Privacy Policy, Terms & Conditions, Payment Policy.

---

### Requirement 14: Image and Media Handling

**User Story:** As a customer, I want product images and videos to load quickly and reliably, so that I can see what I'm buying.

#### Acceptance Criteria

1. THE App SHALL load all product images and media from Cloudinary URLs provided by the Backend.
2. THE App SHALL use `expo-image` for optimised image loading with lazy loading and caching on all product cards and detail screens.
3. WHEN an image fails to load, THE App SHALL display a placeholder image and SHALL NOT display a broken image icon.
4. WHEN a product has video media, THE App SHALL display it inline in the product gallery with playback controls and SHALL NOT auto-play audio without user interaction.
5. THE App SHALL respect device data-saving settings by using appropriately sized Cloudinary image transformations (e.g., width-limited URLs).

---

### Requirement 15: Offline and Error Handling

**User Story:** As a customer, I want the app to handle network errors gracefully, so that I don't lose my data or get confused.

#### Acceptance Criteria

1. WHEN the device has no network connection, THE App SHALL display a network-error banner and SHALL preserve locally cached cart and authentication state.
2. WHEN any API call returns a non-2xx response, THE App SHALL display a user-friendly toast notification with the error message from the Backend's `message` field.
3. THE App SHALL implement retry logic for initial data fetch calls (products, slides, categories) with up to 3 automatic retries using exponential back-off.
4. THE App SHALL persist the cart state to device storage (AsyncStorage or Zustand persist) so cart contents survive app restarts.
5. THE App SHALL persist the JWT to `expo-secure-store` so users remain logged in across app restarts without re-authenticating.

---

### Requirement 16: Performance and Accessibility

**User Story:** As a customer, I want the app to be fast and accessible, so that I can use it comfortably on any device.

#### Acceptance Criteria

1. THE App SHALL render the Home screen's initial visible content within 3 seconds on a mid-range Android device on a 4G connection.
2. THE App SHALL implement `FlatList` or `FlashList` with `keyExtractor` and `getItemLayout` for all product lists to enable virtualisation and prevent memory issues with large catalogs.
3. THE App SHALL provide `accessibilityLabel` and `accessibilityRole` props on all interactive elements (buttons, links, form inputs) to support screen readers.
4. THE App SHALL use a minimum touch target size of 44×44 dp for all interactive elements per platform accessibility guidelines.
5. THE App SHALL support both light and dark color schemes using React Native's `useColorScheme` hook, defaulting to the Epic Moments brand palette (primary: `#e8157e`, background: `#fff`/`#121212`).
6. THE App SHALL display loading skeleton placeholders for product lists while data is being fetched, rather than blank screens.

---

### Requirement 17: Legal and Policy Screens

**User Story:** As a customer, I want to access the privacy policy, terms & conditions, and payment policy, so that I understand my rights.

#### Acceptance Criteria

1. THE App SHALL provide a Privacy Policy screen displaying the same content as the web `/privacy-policy` page.
2. THE App SHALL provide a Terms & Conditions screen displaying the same content as the web `/terms-and-conditions` page.
3. THE App SHALL provide a Payment Policy screen displaying the same content as the web `/payment-policy` page.
4. THE App SHALL link to these policy screens from the Profile/Account screen and the checkout flow.
```
