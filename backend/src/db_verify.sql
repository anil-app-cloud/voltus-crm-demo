-- Verify customers table and insert test record if needed
SELECT * FROM customers WHERE id = 'c1';

-- Verify dashboard_stats table
SELECT * FROM dashboard_stats LIMIT 1;

-- Verify invoices and their status counts
SELECT 
  SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_invoices,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_invoices,
  SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_invoices
FROM invoices;

-- Verify recent activities
SELECT * FROM recent_activities ORDER BY timestamp DESC LIMIT 5;

-- Verify bookings
SELECT b.*, c.company_name as customer_name 
FROM bookings b 
JOIN customers c ON b.customer_id = c.id 
ORDER BY b.created_at DESC 
LIMIT 5; 