-- 🥐 NEW-ERA PASTRIES ORDERING SYSTEM - DATABASE SCHEMA
-- MySQL Database Schema with full business logic support

CREATE DATABASE IF NOT EXISTS pastries_db;
USE pastries_db;

-- ⭐ IMPORTANT: Categories table (Cakes, Cookies, Bread, Seasonal)
-- Comment: Categories are predefined but can be extended
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ⭐ IMPORTANT: Pastries table with stock control
-- Comment: in_stock field is critical for auto-reduction when order status → "baking"
CREATE TABLE pastries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category_id INT NOT NULL,
    image_url VARCHAR(500),
    in_stock INT DEFAULT 0,  -- ⭐ Auto-decrease when order status changes to "baking"
    min_stock_alert INT DEFAULT 5,  -- Alert admin when stock below this
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- ⭐ IMPORTANT: Customers table for order tracking & notifications
-- Comment: phone field is used for OTP auth + WhatsApp notifications
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,  -- ⭐ Used for OTP & WhatsApp messaging
    email VARCHAR(255),
    address TEXT,
    preferred_delivery_type ENUM('pickup', 'delivery') DEFAULT 'pickup',
    otp_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone)
);

-- ⭐ IMPORTANT: OTP verification table
-- Comment: Store OTP for phone authentication flow
CREATE TABLE otp_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(20) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (phone) REFERENCES customers(phone) ON DELETE CASCADE
);

-- ⭐ IMPORTANT: Orders table with delivery & payment tracking
-- Comment: delivery_type field determines delivery_fee calculation
-- Comment: status field triggers stock reduction when status = "baking"
-- Comment: order_channel field tracks: "website", "whatsapp", or "both"
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'baking', 'ready', 'delivered', 'picked_up', 'cancelled') DEFAULT 'pending',  -- ⭐ "baking" triggers stock reduction
    delivery_type ENUM('pickup', 'delivery') NOT NULL,  -- ⭐ Determines delivery_fee
    payment_method ENUM('mtn_momo', 'pay_on_pickup') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    order_channel ENUM('website', 'whatsapp', 'both') DEFAULT 'website',  -- ⭐ Track ordering channel
    delivery_address TEXT,  -- For delivery orders
    delivery_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- ⭐ IMPORTANT: OrderItems table
-- Comment: price_at_order stores historical price (protects against price changes)
-- Comment: qty is used with pastry.in_stock for inventory deduction
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    pastry_id INT NOT NULL,
    qty INT NOT NULL,
    price_at_order DECIMAL(10, 2) NOT NULL,  -- ⭐ Historical price snapshot
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (pastry_id) REFERENCES pastries(id) ON DELETE RESTRICT
);

-- ⭐ IMPORTANT: Payment transactions table
-- Comment: Track all payment attempts for debugging & reconciliation
CREATE TABLE payment_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),  -- "mtn_momo", "pay_on_pickup"
    transaction_reference VARCHAR(255),
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id)
);

-- ⭐ IMPORTANT: Notifications log table
-- Comment: Track all WhatsApp/SMS notifications for debugging & compliance
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    order_id INT,
    notification_type ENUM('order_confirmation', 'status_update', 'ready_for_pickup', 'delivery_alert') NOT NULL,
    channel ENUM('whatsapp', 'sms', 'email') NOT NULL,
    message TEXT,
    status ENUM('queued', 'sent', 'failed') DEFAULT 'queued',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- ⭐ IMPORTANT: Stock history table
-- Comment: Audit trail for stock changes (helps debug auto-reduction)
CREATE TABLE stock_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pastry_id INT NOT NULL,
    old_stock INT,
    new_stock INT,
    change_reason VARCHAR(100),  -- "baking_order", "manual_adjustment", "purchase"
    order_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pastry_id) REFERENCES pastries(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- ⭐ IMPORTANT: Admin users table
-- Comment: JWT token authentication for admin dashboard
CREATE TABLE admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'baker') DEFAULT 'manager',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- ⭐ IMPORTANT: Delivery fee configuration
-- Comment: Store delivery fees by location/zone
CREATE TABLE delivery_zones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    zone_name VARCHAR(100) NOT NULL UNIQUE,
    delivery_fee DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== SAMPLE DATA ====================

-- Insert Categories
INSERT INTO categories (name, description) VALUES
('Cakes', 'Delicious cakes for all occasions'),
('Cookies', 'Fresh baked cookies daily'),
('Bread', 'Artisan breads and rolls'),
('Seasonal', 'Limited edition seasonal treats');

-- Insert Sample Pastries
INSERT INTO pastries (name, description, price, category_id, image_url, in_stock) VALUES
('Chocolate Cake', 'Rich chocolate layered cake', 45.00, 1, '/images/chocolate-cake.jpg', 10),
('Vanilla Cupcakes', 'Sweet vanilla frosted cupcakes', 15.00, 1, '/images/cupcakes.jpg', 20),
('Chocolate Chip Cookies', 'Classic cookies with chocolate chips', 5.00, 2, '/images/cookies.jpg', 50),
('Croissants', 'Buttery French croissants', 8.00, 3, '/images/croissants.jpg', 30),
('Seasonal Pumpkin Pie', 'Limited edition pumpkin pie', 35.00, 4, '/images/pumpkin-pie.jpg', 5);

-- Insert Delivery Zones
INSERT INTO delivery_zones (zone_name, delivery_fee, min_order_amount) VALUES
('Zone A (Central)', 5.00, 20.00),
('Zone B (Suburban)', 10.00, 30.00),
('Zone C (Outskirts)', 15.00, 40.00);

-- ==================== VIEWS FOR EASY QUERYING ====================

-- View: Active Orders with Customer Details
CREATE VIEW active_orders_view AS
SELECT 
    o.id,
    o.customer_id,
    c.name AS customer_name,
    c.phone,
    o.total,
    o.status,
    o.delivery_type,
    o.created_at,
    COUNT(oi.id) AS item_count
FROM orders o
JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.status != 'cancelled'
GROUP BY o.id;

-- View: Low Stock Alerts
CREATE VIEW low_stock_alerts_view AS
SELECT 
    p.id,
    p.name,
    c.name AS category,
    p.in_stock,
    p.min_stock_alert,
    CASE 
        WHEN p.in_stock <= 0 THEN 'OUT OF STOCK'
        WHEN p.in_stock <= p.min_stock_alert THEN 'LOW STOCK'
        ELSE 'SUFFICIENT'
    END AS stock_status
FROM pastries p
JOIN categories c ON p.category_id = c.id
WHERE p.in_stock <= p.min_stock_alert;

-- ==================== STORED PROCEDURES ====================

-- ⭐ IMPORTANT: Procedure to auto-reduce stock when order status = "baking"
DELIMITER $$
CREATE PROCEDURE reduce_stock_for_baking(IN order_id INT)
BEGIN
    DECLARE cur_item_id INT;
    DECLARE cur_pastry_id INT;
    DECLARE cur_qty INT;
    DECLARE cur_stock INT;
    DECLARE done INT DEFAULT FALSE;
    DECLARE cur CURSOR FOR SELECT id, pastry_id, qty FROM order_items WHERE order_id = order_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO cur_item_id, cur_pastry_id, cur_qty;
        IF done THEN LEAVE read_loop; END IF;
        
        SELECT in_stock INTO cur_stock FROM pastries WHERE id = cur_pastry_id;
        
        UPDATE pastries SET in_stock = in_stock - cur_qty WHERE id = cur_pastry_id;
        
        INSERT INTO stock_history (pastry_id, old_stock, new_stock, change_reason, order_id)
        VALUES (cur_pastry_id, cur_stock, cur_stock - cur_qty, 'baking_order', order_id);
    END LOOP;
    CLOSE cur;
END$$
DELIMITER ;

-- ==================== INDEXES FOR PERFORMANCE ====================

CREATE INDEX idx_order_customer ON orders(customer_id);
CREATE INDEX idx_order_status_date ON orders(status, created_at);
CREATE INDEX idx_pastry_category ON pastries(category_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_notifications_customer ON notifications(customer_id);
CREATE INDEX idx_stock_history_pastry ON stock_history(pastry_id);
