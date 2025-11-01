# 🍔 Burgeražem

Fun little vibecoded app for when I make burgers at home for my friends.

**Build Your Own Burgeražem!** - A custom burger ordering application with drinks and desserts.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![Material-UI](https://img.shields.io/badge/MUI-5-007FFF)](https://mui.com/)

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Technologies](#-technologies)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Project Structure](#-project-structure)
- [Admin Panel](#-admin-panel)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)

---

## 🎯 About the Project

Burgeražem is a modern web application for ordering customized burgers, drinks, and desserts. The application allows users to:
- Build their own burger by selecting ingredients
- Choose drinks from available inventory
- Order desserts (when available)
- Track their order status in real-time

Administrators have full control over:
- Managing items (drinks, burger ingredients, desserts)
- Tracking and managing orders
- Enabling/disabling desserts
- Categorizing burger ingredients

---

## ✨ Features

### 🛍️ For Users

- **🍔 Customizable Burgers**
  - Select ingredients by categories (meats, cheeses, sauces, etc.)
  - Visual preview of selected ingredients
  - Unlimited combinations

- **🥤 Drinks**
  - View available drinks with quantities
  - Visual indicators for low stock (< 5)
  - Product images

- **🍰 Desserts**
  - Admin-controlled availability
  - Optional ordering after burger

- **📱 Order Tracking**
  - Display current orders
  - Real-time status (In Progress / Completed / Canceled)
  - Auto-refresh every 3 seconds
  - Order history (last 24h)

- **🔐 Authentication**
  - Clerk authentication
  - Automatic redirect for logged-in users
  - Protected routes

### 👨‍💼 For Administrators

- **📊 Dashboard**
  - Overview of all orders by type
  - Card display with user data
  - Change order status
  - Delete orders
  - App settings

- **🛠️ Item Management**
  - CRUD operations for all items
  - Image upload
  - Categories for burger ingredients
  - Drink inventory tracking

- **⚙️ Settings**
  - Toggle for enabling/disabling desserts
  - Real-time refresh

---

## 🛠️ Technologies

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Material-UI (MUI)](https://mui.com/)** - UI components
- **[Clerk](https://clerk.com/)** - Authentication

### Backend
- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - Server-side API
- **[MongoDB](https://www.mongodb.com/)** - NoSQL database
- **[Mongoose](https://mongoosejs.com/)** - MongoDB ODM

### Deployment
- **[Vercel](https://vercel.com/)** - Hosting (recommended)
- **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)** - Database

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or Atlas)
- Clerk account for authentication

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd burgerazem
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/burgerazem?retryWrites=true&w=majority

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/order
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/order
```

4. **Pokrenite development server**
```bash
npm run dev
```

Aplikacija će biti dostupna na `http://localhost:3000`

---

## ⚙️ Konfiguracija

### MongoDB kolekcije

Aplikacija automatski kreira sljedeće kolekcije:

1. **items** - Pića, burger sastojci i deserti
2. **orders** - Sve narudžbe
3. **categories** - Kategorije burger sastojaka
4. **settings** - Postavke aplikacije
5. **admins** - Admin korisnici

### Postavljanje prvog admina

1. Prijavite se u aplikaciju kao korisnik
2. Pronađite svoj Clerk User ID u MongoDB ili konzoli
3. Dodajte dokument u `admins` kolekciju:

```javascript
{
  "clerkUserId": "user_YOUR_CLERK_ID",
  "email": "your@email.com"
}
```

### Omogućavanje deserta

Deserti su po defaultu omogućeni. Za promjenu:
1. Idite na `/admin`
2. Toggle "Omogući naručivanje deserta"

---

## 📁 Project Structure

```
burgerazem/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin pages
│   │   │   ├── page.tsx       # Dashboard
│   │   │   └── manage/        # Item management
│   │   ├── api/               # API routes
│   │   │   └── upload/        # Image upload
│   │   ├── order/             # Ordering
│   │   │   ├── page.tsx       # Main page
│   │   │   ├── drink/         # Drink selection
│   │   │   ├── burger/        # Burger builder
│   │   │   ├── desert/        # Dessert selection
│   │   │   └── confirmation/  # Order confirmation
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   ├── models/                # Mongoose models
│   │   ├── Order.ts
│   │   ├── Item.ts
│   │   ├── Category.ts
│   │   ├── Settings.ts
│   │   └── Admin.ts
│   └── utils/                 # Utility functions
│       ├── dbConnect.ts       # MongoDB connection
│       └── adminAuth.ts       # Admin authentication
├── public/                    # Static files
│   ├── favicon.svg           # App icon
│   └── uploads/              # Uploaded images
├── scripts/                   # Maintenance scripts
└── package.json
```

---

## 👨‍💼 Admin Panel

### Access

The admin panel is available at `/admin` - automatically redirects to login if you're not signed in.

### Managing Orders

**Dashboard** (`/admin`)
- Overview by types: Burger / Drinks / Desserts
- Change status: In Progress → Completed/Canceled
- Delete orders
- Display user names (from Clerk)
- Burger ingredients displayed as chips

**Order Statuses:**
- 🟡 **In Progress** - Order is active
- 🟢 **Completed** - Order is finished
- 🔴 **Canceled** - Order is canceled

### Managing Items

**Manage Items** (`/admin/manage`)

**Drinks:**
- Name, description, quantity, image
- Inventory tracking

**Burger Parts:**
- Name, description, category, image
- Categorization (Meats, Cheeses, Sauces, etc.)

**Desserts:**
- Name, description, image
- No inventory tracking

**Categories:**
- Add/delete categories for burger ingredients

---

## 🔌 API Documentation

### Orders

**GET** `/api/orders`
- Fetches current user's orders
- Authentication: Required

**POST** `/api/orders`
- Creates a new order
- Body: `{ orderType, itemId?, burgerIngredients? }`

**PATCH** `/api/orders/:id`
- Updates order status (Admin)
- Body: `{ status: "in-progress" | "completed" | "canceled" }`

**DELETE** `/api/orders/:id`
- Deletes order (Admin)

### Items

**GET** `/api/items?type=drinks|burgerParts|deserts`
- Fetches items by type

**POST** `/api/items` (Admin)
- Creates a new item
- Body: `{ name, description, type, quantity?, imagePath, category? }`

**PATCH** `/api/items/:id` (Admin)
- Updates item

**DELETE** `/api/items/:id` (Admin)
- Deletes item

### Upload

**POST** `/api/upload`
- Upload image
- Returns: `{ imagePath: string }`

---

## 🎨 Features

### Real-time Updates

The application uses polling (3s interval) for:
- Order status on `/order`
- Dessert availability
- Drink inventory

### Duplicate Prevention

- Users cannot order the same type (drink/burger/dessert) while a previous order is in progress
- Automatic redirect if they try to access `/order/drink` with an active drink order

### Responsive Design

- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly controls

### Image Handling

- Automatic upload to `/public/uploads/items/`
- Secure filename generation (timestamp + hash)
- Supported formats: JPEG, PNG, GIF, WebP

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository with Vercel
3. Add environment variables
4. Deploy!

```bash
# Or using Vercel CLI
npm install -g vercel
vercel
```

### Environment Variables on Vercel

Add all variables from `.env.local` to Vercel dashboard:
- Settings → Environment Variables

### MongoDB Atlas

1. Whitelist Vercel IP addresses or enable access everywhere (`0.0.0.0/0`)
2. Copy connection string to `MONGODB_URI`

---

## 🐛 Troubleshooting

### "Duplicate key error" for orders

Run the fix script:
```bash
node scripts/fix-order-index.js
```

### Admin panel not accessible

1. Check if you're added to the `admins` collection
2. Verify your Clerk User ID

### Images not displaying

1. Check if `/public/uploads/items/` directory exists
2. Check write permissions

---

## 📝 License

MIT License - feel free to use and modify for your own needs.

---

## 👥 Authors

Developed with ❤️ for the best burgers!

---

## 🙏 Acknowledgments

- Next.js team for an excellent framework
- Material-UI for UI components
- Clerk for simple authentication
- MongoDB for a flexible database

---

## 📞 Contact

For questions and support, please contact the administrator.

---

**Burgeražem** - *Build Your Own Burgeražem!* 🍔


