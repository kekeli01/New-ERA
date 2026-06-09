# 🥐 New-ERA Pastries Ordering System

A modern, eye-catching pastry ordering platform with web & WhatsApp integration, featuring customer ordering, admin management, and payment integration.

## 🎯 Features

### Core Features
- ✨ Decorative pastry catalog with categories
- 🛒 Shopping cart functionality
- 📱 WhatsApp + Web ordering channels
- 💳 Payment integration (MTN MoMo + Pay on Pickup)
- 🚗 Delivery & Pickup options
- 📊 Real-time order tracking
- 🔐 Phone OTP + JWT authentication
- 📢 WhatsApp/SMS notifications
- 📦 Inventory management with auto-stock reduction
- 🎨 Admin dashboard for pastry management

## 🛠️ Tech Stack

**Backend**: Python (Flask/Django)  
**Frontend**: React  
**Database**: MySQL  
**Notifications**: WhatsApp API, SMS API  
**Payments**: MTN MoMo integration  

## 📁 Project Structure

```
New-ERA/
├── backend/           # Flask/Django API
├── frontend/          # React web interface
├── docs/             # Documentation & API specs
│   └── database-schema.sql
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- MySQL 8.0+

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 📊 Database Schema

### Core Tables
- **pastries** - Catalog of available pastries (id, name, price, description, category_id, image_url, in_stock)
- **orders** - Customer orders (id, customer_id, items[], total, status, delivery_type, created_at)
- **customers** - Customer info (id, name, phone, address, email)
- **categories** - Pastry categories (Cakes, Cookies, Bread, Seasonal)
- **order_items** - Items in orders (order_id, pastry_id, qty, price_at_order)

### Advanced Tables
- **otp_tokens** - OTP verification for phone authentication
- **payment_transactions** - Payment tracking
- **notifications** - WhatsApp/SMS log
- **stock_history** - Audit trail for stock changes
- **admin_users** - Admin dashboard authentication

⭐ **IMPORTANT**: Stock auto-reduction happens via stored procedure when order status → "baking"

See `docs/database-schema.sql` for complete schema.

## 📡 API Endpoints

### Customer Public Endpoints
- `GET /api/pastries` - List all pastries with categories
- `GET /api/pastries/:id` - Get pastry details
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP & create customer
- `POST /api/orders` - Create new order (requires auth)
- `GET /api/orders/:id` - Track order status
- `GET /api/orders` - Get customer's order history

### Admin Endpoints (JWT Protected)
- `POST /api/pastries` - Add new pastry
- `PUT /api/pastries/:id` - Update pastry
- `DELETE /api/pastries/:id` - Delete pastry
- `GET /api/admin/orders` - View all orders
- `PATCH /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/stock-alerts` - Low stock items

## 🔐 Authentication Flow

### Customer (Phone OTP)
1. Customer enters phone → `POST /api/auth/send-otp`
2. Receives OTP via SMS/WhatsApp
3. Submits OTP → `POST /api/auth/verify-otp`
4. Gets temporary session token
5. Can browse & place orders

### Admin (JWT)
1. Admin logs in with credentials
2. Receives JWT token
3. Token included in Authorization header for all requests

## 💬 Order Flow

```
1. Customer browses /pastries (categories: Cakes, Cookies, Bread, Seasonal)
   ↓
2. Adds items to cart → /api/orders POST
   ↓
3. Selects delivery_type (pickup/delivery) → Calculates delivery_fee
   ↓
4. Selects payment_method (mtn_momo/pay_on_pickup)
   ↓
5. Order created with status: "pending" → Sends confirmation notification
   ↓
6. Admin reviews order → Updates status to "baking"
   ↓
7. 🔥 IMPORTANT: Stock auto-reduces for all items in order
   ↓
8. When ready → Status → "ready" → Sends "Ready for pickup" notification
   ↓
9. Customer tracks via /api/orders/:id
   ↓
10. Pickup/Delivery → Status → "picked_up" / "delivered"
```

## 📢 Notification Channels

### WhatsApp Integration
- Order confirmation with order ID & total
- Status updates (order received, baking, ready, etc.)
- Ready for pickup/delivery alerts
- Payment reminders

### SMS Integration
- OTP delivery
- Quick status updates

## 💳 Payment Integration

### MTN MoMo
- Integration with MTN Mobile Money API
- Payment request initiated at checkout
- Webhook for payment confirmation
- Auto-update order status on successful payment

### Pay on Pickup
- Order placed with status: "pending payment"
- Payment collected at pickup location
- Admin marks as paid in dashboard

## 📦 Inventory Management

### Stock Tracking
- Each pastry has `in_stock` count
- `min_stock_alert` triggers admin notification
- Stock history logs all changes with reason

### Auto-Reduction on "Baking" Status
⭐ **CRITICAL**: When admin updates order status → "baking":
1. Stored procedure `reduce_stock_for_baking()` is triggered
2. For each item in order: `pastry.in_stock -= order_item.qty`
3. Stock change logged to `stock_history` table
4. If stock goes negative, alert admin

## 🎨 Frontend Design Notes

- **Color Palette**: Warm pastry colors (golds, creams, browns, pastels)
- **Typography**: Elegant, readable fonts
- **Cards**: Animated pastry cards with hover effects
- **Images**: High-quality pastry photos
- **Responsive**: Mobile-first design
- **Transitions**: Smooth animations for cart & checkout

## 🗂️ Branch Strategy

- `main` - Production ready code
- `develop` - Integration branch
- `backend-setup` - Backend development
- `frontend-setup` - Frontend development
- Feature branches: `feature/auth`, `feature/payments`, etc.

---

**Status**: 🔧 In Development  
**Created**: June 2026
