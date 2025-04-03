# WorldZoneCRM

WorldZoneCRM is a comprehensive Customer Relationship Management system designed for logistics and shipping companies. It helps manage customers, bookings, invoices, and communications in one unified platform.

## Features

- **Dashboard** - Overview of key business metrics and recent activities
- **Customer Management** - Track and manage customer information and communication history
- **Booking Management** - Create and track shipping bookings
- **Invoice Management** - Generate and manage invoices
- **Reports** - Generate and export business reports

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MySQL

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)

## Installation

1. Clone the repository
```
git clone https://github.com/yourusername/worldzonecrm.git
cd worldzonecrm
```

2. Install dependencies
```
npm run install:all
```

3. Configure environment variables
```
cd backend
cp .env.example .env
```

4. Update the `.env` file with your database credentials

## Database Setup

1. Create a new MySQL database
```
mysql -u root -p
CREATE DATABASE worldzonecrm;
```

2. Run database schema script
```
cd backend
mysql -u root -p worldzonecrm < src/db/schema.sql
```

3. Seed the database with initial data
```
npm run seed
```

## Running the Application

1. Start both backend and frontend concurrently
```
npm run dev
```

2. Access the application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Testing

Run tests with:
```
cd backend
npm test
```

## API Documentation

API endpoints are available at http://localhost:5000/api

- `/api/customers` - Customer management
- `/api/bookings` - Booking management
- `/api/invoices` - Invoice management
- `/api/dashboard` - Dashboard data
- `/api/reports` - Reports

## License

This project is licensed under the ISC License. 