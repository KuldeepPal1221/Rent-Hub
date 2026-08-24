# RentHub - Modern Product Rental Marketplace Platform 🌟

A complete, production-ready, peer-to-peer product rental marketplace platform built with **React**, **Vite**, **Tailwind CSS**, **Node.js/Express**, and **SQLite**.

RentHub enables users to both list items they own for rent (tools, cameras, steam presses, electronics, appliances, camping gear) and browse, filter, favorite, and contact owners to rent items for short or long terms.

---

## ✨ Key Features

1. **Dual-Role User Model**:
   - Every registered user can list products to rent out and search to rent items from others with the same account.
2. **Product Management**:
   - Rich multi-image uploads and live preview thumbnails.
   - Pricing by period: **Per Day**, **Per Week**, or **Per Month**.
   - Optional refundable security deposits.
   - Condition ratings: *Brand New*, *Like New*, *Good*, *Fair*.
   - Location & pickup neighborhood details.
   - Listing status toggle: *Active* vs *Inactive / Paused*.
3. **Privacy-Controlled Direct Contact**:
   - **WhatsApp Chat**: Opens `https://wa.me/{number}` with pre-filled product inquiry message.
   - **Phone Call**: Direct `tel:` link.
   - **Email**: Pre-filled `mailto:` client link.
   - **In-App Rental Inquiries**: Structured booking request form with start/end date calculation and owner acceptance workflow.
   - **Owner Privacy Toggles**: Owners can independently turn Phone, WhatsApp, or Email visibility ON/OFF.
4. **Marketplace Discovery & Search**:
   - Keyword search across titles, descriptions, and locations.
   - Category filtering across 13 rich product categories.
   - City and neighborhood filtering.
   - Price range min/max sliders and pricing period filters.
   - Sorting: *Newest First*, *Price: Low to High*, *Price: High to Low*, *Most Viewed*.
   - Grid and List view modes.
5. **Dashboard & Analytics**:
   - Real-time stats: Total listings, active listings, received inquiries, sent inquiries, favorites count.
   - Inquiry status manager: *Pending* &rarr; *Accepted* / *Declined* / *Completed*.
   - Favorite items quick manager.
   - Profile editor and password update security.
6. **Security & Data Integrity**:
   - `bcryptjs` password hashing with salt rounds (no plain-text passwords).
   - JWT authentication tokens with middleware route guards.
   - Parameterized SQLite queries preventing SQL injections.
   - Privacy masking: Private owner contact information is NEVER sent to the frontend unless enabled.
7. **Mobile-First Responsive Design**:
   - Custom Tailwind CSS styling with emerald accents and glassmorphism.
   - Slide-out mobile navigation drawer and mobile filter modal.
   - One-click demo login buttons on the Login page for instant reviewer testing.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM v6, Lucide React Icons, Axios.
- **Backend**: Node.js, Express.js, native `node:sqlite` (high performance, zero native compile dependencies), `bcryptjs`, `jsonwebtoken`, `multer`.
- **Database**: SQLite (`rental_marketplace.db`) with full relational constraints and indexes.

---

## 🚀 Quick Start & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed the Database
Populate 13 rich categories, 3 demo users, and 12 sample rental listings with high-resolution photos:
```bash
npm run seed
```

### 3. Run Development Server
Run both Express backend (Port 5000) and Vite frontend (Port 3000) concurrently:
```bash
npm run dev
```

Visit the website at: **`http://localhost:3000`** (or backend at `http://localhost:5000`).

---

## 🔑 Demo Accounts (Pre-Seeded)

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Seller (Owner)** | `alex@example.com` | `Password123!` | Has Sony A7 IV, DJI Drone, Epson Projector |
| **Owner / Renter** | `sarah@example.com` | `Password123!` | Has Philips Steam Iron Press, DeWalt Drill, Herman Miller Chair |
| **Renter / Owner** | `david@example.com` | `Password123!` | Has Coleman Tent, Yamaha PA Sound System, Trek Mountain Bike |

*You can also test 1-click login directly from the Login page using the **"Instant Demo Login"** buttons.*

---

## 📋 Database Schema

- **`users`**: `id`, `full_name`, `email`, `phone`, `password_hash`, `profile_image`, `city`, `whatsapp_number`, `email_contact_enabled`, `phone_contact_enabled`, `whatsapp_contact_enabled`, `account_status`, `created_at`, `updated_at`, `last_login`.
- **`categories`**: `id`, `name`, `slug`, `description`, `icon`, `image`, `display_order`, `created_at`.
- **`products`**: `id`, `owner_id`, `category_id`, `name`, `description`, `rental_price`, `price_period`, `security_deposit`, `condition`, `city`, `location`, `available_from`, `available_until`, `availability_status`, `views_count`, `created_at`, `updated_at`.
- **`product_images`**: `id`, `product_id`, `image_url`, `display_order`, `created_at`.
- **`favorites`**: `id`, `user_id`, `product_id`, `created_at`.
- **`rental_inquiries`**: `id`, `product_id`, `owner_id`, `renter_id`, `renter_name`, `renter_email`, `renter_phone`, `rental_start_date`, `rental_end_date`, `message`, `status`, `created_at`, `updated_at`.

---

## 🧪 Verified User Flow

1. **Register / Login**: Sign in as Alex or register a new user.
2. **Dashboard**: Inspect statistics, active listings, and inquiries.
3. **List Product**: Click "Rent Out Item" -> Add name, category, pricing per day/week/month, condition, upload photos, and publish.
4. **Browse & Filter**: Filter by category, price, condition, or city.
5. **Product Details**: View gallery, specs, security deposit info, and direct contact buttons.
6. **Direct Contact**: Click WhatsApp, Call, or submit a formal "Send Rental Inquiry" with desired dates.
7. **Owner Workflow**: In the Dashboard "Rental Inquiries" tab, review incoming requests and Accept or Decline.
8. **Privacy Settings**: In "Profile & Privacy Settings", toggle WhatsApp or Phone visibility and observe listing buttons update.
