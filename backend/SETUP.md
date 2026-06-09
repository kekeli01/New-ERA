# Backend Setup Instructions

## 📦 Installation

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## 🗄️ Database Setup

1. Create MySQL database:
```bash
mysql -u root -p
CREATE DATABASE pastries_db;
```

2. Update `.env` with database credentials:
```
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/pastries_db
JWT_SECRET_KEY=your-secret-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
MTN_MOMO_API_KEY=your-mtn-key
```

## 🚀 Running the Server

```bash
python run.py
```

Server will run on `http://localhost:5000`

## ✅ Health Check

```bash
curl http://localhost:5000/api/health
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP & get session
- `POST /api/auth/admin/login` - Admin login

### Pastries (Public)
- `GET /api/pastries` - List all pastries
- `GET /api/pastries/:id` - Get pastry details
- `GET /api/pastries/categories` - Get categories

### Pastries (Admin)
- `POST /api/pastries` - Create pastry
- `PUT /api/pastries/:id` - Update pastry
- `DELETE /api/pastries/:id` - Delete pastry
- `PATCH /api/pastries/stock/:id` - Adjust stock

### Orders (Customer)
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `GET /api/orders` - Get my orders

### Orders (Admin)
- `GET /api/admin/orders` - Get all orders
- `PATCH /api/admin/orders/:id/status` - Update order status
- `DELETE /api/admin/orders/:id` - Cancel order

### Admin Dashboard
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/stock-alerts` - Low stock alerts
- `GET /api/admin/customers` - Customer list
- `GET /api/admin/analytics/revenue` - Revenue stats

## ⭐ Important Notes

1. **Stock Reduction**: When order status → "baking", stock auto-reduces
2. **OTP Authentication**: Phone-based login for customers
3. **JWT for Admin**: Token-based auth for admin dashboard
4. **Notifications**: WhatsApp/SMS integration via Twilio

## 🧪 Testing

```bash
# Run tests
pytest

# Run specific test
pytest tests/test_orders.py -v
```

## 📝 Database Migrations

```bash
# Create migration
flask db migrate -m "Description"

# Apply migration
flask db upgrade
```
