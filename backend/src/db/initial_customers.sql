-- Insert initial customers
INSERT INTO customers (id, first_name, last_name, company_name, email, phone, status, street, city, state, zipcode, country, total_spent, total_orders)
VALUES 
(UUID(), 'John', 'Smith', 'Global Logistics Inc.', 'john.smith@globallogistics.com', '+1-555-123-4567', 'Active', '123 Business Ave', 'New York', 'NY', '10001', 'USA', 125000.00, 45),
(UUID(), 'Sarah', 'Johnson', 'SkyWay Shipping', 'sarah.j@skywayshipping.com', '+1-555-234-5678', 'Active', '456 Transport Rd', 'Los Angeles', 'CA', '90012', 'USA', 98000.00, 32),
(UUID(), 'Michael', 'Brown', 'OceanBreeze Transport', 'michael.b@oceanbreeze.com', '+1-555-345-6789', 'Active', '789 Harbor Dr', 'Miami', 'FL', '33101', 'USA', 156000.00, 58),
(UUID(), 'Emma', 'Davis', 'Express Freight Services', 'emma.d@expressfreight.com', '+1-555-456-7890', 'Active', '321 Delivery Lane', 'Chicago', 'IL', '60601', 'USA', 78000.00, 25),
(UUID(), 'David', 'Wilson', 'Continental Cargo', 'david.w@continentalcargo.com', '+1-555-567-8901', 'Active', '654 Shipping Blvd', 'Houston', 'TX', '77001', 'USA', 112000.00, 41);

-- Store customer IDs in a temporary table for reference
CREATE TEMPORARY TABLE IF NOT EXISTS temp_customer_ids AS
SELECT id FROM customers ORDER BY created_at DESC LIMIT 5; 