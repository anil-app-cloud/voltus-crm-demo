// // Mock data for WorldZoneCRM application

// // Customer data
// const customer = {
//   id: 1,
//   company_name: "Acme Global Logistics",
//   customer_type: "Enterprise",
//   status: "active",
//   address: "123 Commerce St, Business City, BC 12345",
//   website: "www.acmeglobal.com",
//   phone: "+1 (555) 123-4567",
//   email: "info@acmeglobal.com",
//   active_since: "2020-01-15"
// };

// // Contact data
// const contacts = [
//   {
//     id: 1,
//     customer_id: 1,
//     first_name: "John",
//     last_name: "Smith",
//     title: "Logistics Manager",
//     email: "john.smith@acmeglobal.com",
//     phone: "+1 (555) 123-4567",
//     initials: "JS",
//     last_contacted_at: "2023-07-15T14:30:00Z"
//   },
//   {
//     id: 2,
//     customer_id: 1,
//     first_name: "Emily",
//     last_name: "Johnson",
//     title: "Procurement Director",
//     email: "emily.johnson@acmeglobal.com",
//     phone: "+1 (555) 987-6543",
//     initials: "EJ",
//     last_contacted_at: "2023-07-10T09:15:00Z"
//   },
//   {
//     id: 3,
//     customer_id: 1,
//     first_name: "Michael",
//     last_name: "Brown",
//     title: "CEO",
//     email: "michael.brown@acmeglobal.com",
//     phone: "+1 (555) 555-1234",
//     initials: "MB",
//     last_contacted_at: "2023-06-28T16:45:00Z"
//   }
// ];

// // Order data
// const orders = [
//   {
//     id: 1,
//     order_number: "ORD-2023-001",
//     customer_id: 1,
//     amount: 12500.00,
//     status: "completed",
//     payment_terms: "Net 30",
//     origin: "Shanghai, China",
//     destination: "Los Angeles, USA",
//     order_date: "2023-06-15"
//   },
//   {
//     id: 2,
//     order_number: "ORD-2023-002",
//     customer_id: 1,
//     amount: 8750.00,
//     status: "processing",
//     payment_terms: "Net 30",
//     origin: "Hamburg, Germany",
//     destination: "New York, USA",
//     order_date: "2023-07-02"
//   },
//   {
//     id: 3,
//     order_number: "ORD-2023-003",
//     customer_id: 1,
//     amount: 15000.00,
//     status: "processing",
//     payment_terms: "Net 45",
//     origin: "Rotterdam, Netherlands",
//     destination: "Miami, USA",
//     order_date: "2023-07-10"
//   },
//   {
//     id: 4,
//     order_number: "ORD-2023-004",
//     customer_id: 1,
//     amount: 6300.00,
//     status: "completed",
//     payment_terms: "Net 30",
//     origin: "Singapore",
//     destination: "Seattle, USA",
//     order_date: "2023-05-20"
//   }
// ];

// // Communications data
// const communications = [
//   {
//     id: 1,
//     customer_id: 1,
//     contact_id: 1,
//     user_id: 2,
//     type: "email",
//     date: "2023-07-15T09:30:00Z",
//     subject: "Order Status Update for ORD-2023-002",
//     content: "Dear John,\n\nI wanted to provide you with an update on your recent order ORD-2023-002. The shipment has cleared customs and is currently in transit to New York. Estimated arrival is July 25th.\n\nPlease let me know if you have any questions.\n\nBest regards,\nSarah Williams",
//     from_name: "Sarah Williams",
//     from_title: "Account Manager",
//     to_name: "John Smith",
//     to_title: "Logistics Manager"
//   },
//   {
//     id: 2,
//     customer_id: 1,
//     contact_id: 2,
//     user_id: 3,
//     type: "call",
//     date: "2023-07-12T14:15:00Z",
//     duration_minutes: 22,
//     summary: "Discussed upcoming shipping needs for Q3. Emily mentioned they're planning to increase their shipping volume by approximately 30%. They're particularly interested in our new expedited service between Asia and North America.",
//     from_name: "David Chen",
//     from_title: "Sales Director",
//     to_name: "Emily Johnson",
//     to_title: "Procurement Director"
//   },
//   {
//     id: 3,
//     customer_id: 1,
//     contact_id: null,
//     user_id: 2,
//     type: "note",
//     date: "2023-07-08T11:00:00Z",
//     content: "Acme Global is potentially looking to expand into European markets by Q4. Should prepare some solutions for their anticipated needs in this region.",
//     from_name: "Sarah Williams",
//     from_title: "Account Manager"
//   }
// ];

// // Booking Enquiries data
// const bookingEnquiries = [
//   {
//     id: 1,
//     booking_number: "BKG-2023-001",
//     customer_id: 1,
//     status: "won",
//     origin: "Shenzhen, China",
//     destination: "Chicago, USA",
//     cargo_type: "Electronics",
//     transport_mode: "Sea-Air",
//     container_size: "40ft HQ",
//     quantity: 3,
//     weight: 15000,
//     volume: 120,
//     ready_date: "2023-06-25",
//     delivery_date: "2023-07-15",
//     quote_amount: 18750.00,
//     order_reference: "ORD-2023-002"
//   },
//   {
//     id: 2,
//     booking_number: "BKG-2023-002",
//     customer_id: 1,
//     status: "quoted",
//     origin: "Busan, South Korea",
//     destination: "Dallas, USA",
//     cargo_type: "Machinery",
//     transport_mode: "Sea",
//     container_size: "20ft Standard",
//     quantity: 2,
//     weight: 12000,
//     volume: 70,
//     ready_date: "2023-07-20",
//     delivery_date: "2023-08-30",
//     quote_amount: 9500.00
//   },
//   {
//     id: 3,
//     booking_number: "BKG-2023-003",
//     customer_id: 1,
//     status: "lost",
//     origin: "Mumbai, India",
//     destination: "Toronto, Canada",
//     cargo_type: "Textiles",
//     transport_mode: "Air",
//     weight: 2500,
//     volume: 15,
//     ready_date: "2023-06-10",
//     delivery_date: "2023-06-20",
//     quote_amount: 8200.00,
//     reason_lost: "Customer found a cheaper option with another carrier. Our quote was approximately 12% higher than competitor."
//   }
// ];

// // Activities data
// const activities = [
//   {
//     id: 1,
//     customer_id: 1,
//     date: "2023-07-15T09:30:00Z",
//     type: "Email Sent",
//     description: "Order status update for ORD-2023-002"
//   },
//   {
//     id: 2,
//     customer_id: 1,
//     date: "2023-07-12T14:15:00Z",
//     type: "Call",
//     description: "Quarterly business review with Emily Johnson"
//   },
//   {
//     id: 3,
//     customer_id: 1,
//     date: "2023-07-10T11:20:00Z",
//     type: "Order Placed",
//     description: "New order ORD-2023-003 created"
//   },
//   {
//     id: 4,
//     customer_id: 1,
//     date: "2023-07-08T11:00:00Z",
//     type: "Note Added",
//     description: "Account manager added note about European expansion"
//   }
// ];

// // Financial Summary data
// const financialSummary = {
//   total_orders: 42500.00,
//   total_orders_change: 15,
//   accounts_receivable: 23750.00,
//   accounts_receivable_change: -5,
//   average_days_to_pay: 28,
//   average_days_to_pay_change: -2,
//   current_orders: 23750.00,
//   current_orders_change: 2,
//   total_lifetime_value: 350000.00,
//   total_lifetime_value_change: 22,
//   average_order_value: 10625.00,
//   average_order_value_change: 5
// };

// // Invoice data
// const invoices = [
//   {
//     id: 1,
//     invoice_number: "INV-2023-001",
//     order_id: 1,
//     customer_id: 1,
//     amount: 12500.00,
//     date_issued: "2023-06-15",
//     date_due: "2023-07-15",
//     date_paid: "2023-07-10",
//     status: "paid"
//   },
//   {
//     id: 2,
//     invoice_number: "INV-2023-002",
//     order_id: 2,
//     customer_id: 1,
//     amount: 8750.00,
//     date_issued: "2023-07-02",
//     date_due: "2023-08-01",
//     date_paid: null,
//     status: "current"
//   },
//   {
//     id: 3,
//     invoice_number: "INV-2023-003",
//     order_id: 3,
//     customer_id: 1,
//     amount: 15000.00,
//     date_issued: "2023-07-10",
//     date_due: "2023-08-24",
//     date_paid: null,
//     status: "current"
//   },
//   {
//     id: 4,
//     invoice_number: "INV-2023-004",
//     order_id: 4,
//     customer_id: 1,
//     amount: 6300.00,
//     date_issued: "2023-05-20",
//     date_due: "2023-06-19",
//     date_paid: "2023-06-25",
//     status: "paid"
//   }
// ];

// module.exports = {
//   customer,
//   contacts,
//   orders,
//   communications,
//   bookingEnquiries,
//   activities,
//   financialSummary,
//   invoices
// }; 