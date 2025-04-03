-- WorldZoneCRM Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'manager', 'staff') NOT NULL,
    title VARCHAR(100),
    phone VARCHAR(50),
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(36) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zipcode VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    total_spent DECIMAL(15,2) DEFAULT 0,
    total_orders INT DEFAULT 0,
    notes TEXT,
    company_logo VARCHAR(255)
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    initials VARCHAR(10),
    last_contacted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('processing', 'completed', 'cancelled') NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    transport_mode ENUM('sea', 'air', 'road', 'rail') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_date DATE,
    tracking_number VARCHAR(100),
    notes TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    description TEXT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(36) PRIMARY KEY,
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(36) NOT NULL,
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'lost') NOT NULL,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    transport_mode ENUM('sea', 'air', 'road', 'rail') NOT NULL,
    container_size VARCHAR(50),
    cargo_type VARCHAR(100) NOT NULL,
    quantity INT,
    weight DECIMAL(15,2),
    volume DECIMAL(15,2),
    ready_date DATE,
    delivery_date DATE,
    quote_amount DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    special_instructions TEXT,
    order_reference VARCHAR(50),
    reason_lost TEXT,
    created_by VARCHAR(36),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(36) PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    order_id VARCHAR(36),
    customer_id VARCHAR(36) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    status ENUM('paid', 'due', 'overdue', 'due_soon') NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Invoice Items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id VARCHAR(36) PRIMARY KEY,
    invoice_id VARCHAR(36) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Communications table
CREATE TABLE IF NOT EXISTS communications (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    type ENUM('email', 'call', 'note') NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    status ENUM('sent', 'completed', 'internal') NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255),
    recipient_name VARCHAR(255),
    recipient_email VARCHAR(255),
    duration INT,
    duration_minutes INT,
    call_notes TEXT,
    summary TEXT,
    from_name VARCHAR(255) NOT NULL,
    from_title VARCHAR(255),
    to_name VARCHAR(255),
    to_title VARCHAR(255),
    contact_id INT,
    user_id INT,
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    date TIMESTAMP NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    reference_id VARCHAR(36),
    reference_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Dashboard Stats table
CREATE TABLE IF NOT EXISTS dashboard_stats (
    id VARCHAR(36) PRIMARY KEY,
    total_customers INT NOT NULL,
    total_orders INT NOT NULL,
    total_revenue DECIMAL(15,2) NOT NULL,
    pending_bookings INT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Recent Activity table for dashboard
CREATE TABLE IF NOT EXISTS recent_activities (
    id VARCHAR(36) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    user VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financial Summary table
CREATE TABLE IF NOT EXISTS financial_summary (
    id VARCHAR(36) PRIMARY KEY,
    total_orders DECIMAL(15,2) NOT NULL,
    total_orders_change DECIMAL(5,2) NOT NULL,
    accounts_receivable DECIMAL(15,2) NOT NULL,
    accounts_receivable_change DECIMAL(5,2) NOT NULL,
    average_days_to_pay INT NOT NULL,
    average_days_to_pay_change INT NOT NULL,
    average_order_value DECIMAL(15,2) NOT NULL,
    average_order_value_change DECIMAL(5,2) NOT NULL,
    total_lifetime_value DECIMAL(15,2) NOT NULL,
    total_lifetime_value_change DECIMAL(5,2) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Payment Terms table
CREATE TABLE IF NOT EXISTS payment_terms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    days INT NOT NULL,
    early_payment_discount_percent DECIMAL(5, 2),
    early_payment_days INT,
    late_payment_fee_percent DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
); 