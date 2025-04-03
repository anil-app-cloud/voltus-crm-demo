export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  company_name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  address: {
    street: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
  };
  created_at: string;
  updated_at: string;
  total_spent: number;
  total_orders: number;
  notes: string;
  company_logo: string;
}

export interface Contact {
  id: number;
  customer_id: number;
  first_name: string;
  last_name: string;
  title: string;
  email: string;
  phone: string;
  initials: string;
  last_contacted_at: string;
}

export interface OrderItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  customer_id: string;
  order_number: string;
  status: 'processing' | 'completed' | 'cancelled';
  total_amount: number;
  origin: string;
  destination: string;
  transport_mode: 'sea' | 'air' | 'road' | 'rail';
  created_at: string;
  delivery_date: string;
  items: OrderItem[];
  tracking_number: string;
  notes: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  customer_id: string;
  order_id: string | null;
  invoice_number: string;
  status: 'paid' | 'due' | 'overdue' | 'due_soon';
  total_amount: number;
  issue_date: string;
  due_date: string;
  payment_date: string | null;
  items: InvoiceItem[];
  notes: string;
}

export interface Communication {
  id: string;
  customer_id: string;
  type: 'email' | 'call' | 'note';
  subject: string;
  content: string;
  date: string;
  status: 'sent' | 'completed' | 'internal';
  sender_name: string;
  sender_email?: string;
  recipient_name?: string;
  recipient_email?: string;
  duration?: number;
  duration_minutes?: number;
  call_notes?: string;
  summary?: string;
  from_name: string;
  from_title?: string;
  to_name?: string;
  to_title?: string;
  contact_id?: string;
  user_id?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  booking_number: string;
  customer_id: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'lost';
  origin: string;
  destination: string;
  transport_mode: 'sea' | 'air' | 'road' | 'rail';
  container_size: string;
  cargo_type: string;
  quantity: number;
  weight: number;
  volume: number;
  ready_date: string;
  delivery_date: string;
  quote_amount: number;
  created_at: string;
  special_instructions: string;
  order_reference?: string | null;
  reason_lost?: string | null;
}

export interface Activity {
  id: number;
  customer_id: number;
  date: string;
  type: string;
  description: string;
  reference_id?: number;
  reference_type?: string;
}

export interface DashboardStats {
  total_customers: number;
  total_orders: number;
  total_revenue: number;
  pending_bookings: number;
  recent_activity: Array<{
    id: string;
    type: string;
    action: string;
    user: string;
    timestamp: number;
  }>;
}

export interface FinancialSummary {
  total_orders: number;
  total_orders_change: number;
  accounts_receivable: number;
  accounts_receivable_change: number;
  average_days_to_pay: number;
  average_days_to_pay_change: number;
  average_order_value: number;
  average_order_value_change: number;
  total_lifetime_value: number;
  total_lifetime_value_change: number;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'sales' | 'finance' | 'customer_service';
  title: string;
  phone: string;
  created_at: string;
  last_login: string;
  avatar: string;
}

export interface CustomerDetails {
  customer: Customer;
  contacts: Contact[];
  recentOrders: Order[];
  recentCommunications: Communication[];
  keyContacts: Contact[];
  currentBookingEnquiries: Booking[];
  recentActivities: Activity[];
  orderHistory: Order[];
  allBookingEnquiries: Booking[];
  allCommunications: Communication[];
  allContacts: Contact[];
  financialSummary: FinancialSummary;
  invoices: Invoice[];
} 