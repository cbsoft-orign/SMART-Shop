# SMART-Shop: Intelligent Shop Management System

![SMART-Shop Logo](https://via.placeholder.com/150x150?text=SMART-Shop) <!-- Replace with actual logo URL if available -->

[![GitHub license](https://img.shields.io/github/license/yourusername/smart-shop.svg)](https://github.com/yourusername/smart-shop/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/smart-shop.svg)](https://github.com/yourusername/smart-shop/issues)
[![GitHub stars](https://img.shields.io/github/stars/yourusername/smart-shop.svg)](https://github.com/yourusername/smart-shop/stargazers)
[![Node.js Version](https://img.shields.io/badge/node.js-v18.0%2B-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-v18.0%2B-blue)](https://reactjs.org/)

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Online/Offline Functionality](#onlineoffline-functionality)
- [Installation](#installation)
- [Usage](#usage)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Payment Integration](#payment-integration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview

SMART-Shop is a comprehensive web-based shop management system designed to empower shopkeepers with tools to efficiently manage and monitor their daily operations. The system focuses on streamlining product category management, product inventory (in/out tracking), and generating insightful reports on a daily, weekly, monthly, or yearly basis. 

To sustain the platform, shopkeepers subscribe via flexible payment modes: per day, per week, or per month. The system supports multiple shopkeepers, each managing their independent shops, while a central admin oversees shop registrations, user management, transaction validations, and system accessibility.

Built as a Progressive Web App (PWA), SMART-Shop operates seamlessly online and offline, ensuring uninterrupted access even in areas with unreliable internet. This project adheres strictly to the development prompt: a dual-user system (Admin and Shopkeeper) using Node.js for the backend, SQLite for lightweight database storage, React.js for the frontend, and Tailwind CSS for responsive styling.

**Project Goals:**
- Enhance shop efficiency through intuitive management tools.
- Provide secure, role-based access for multiple users.
- Enable subscription-based monetization with transaction validation.
- Ensure reliability with offline capabilities.

## Key Features

- **Product Category Management**: Create, update, delete, and organize product categories.
- **Product Management**: Add, edit, remove products with details like name, price, stock levels, and descriptions.
- **Inventory Tracking (In/Out Management)**: Log product inflows (purchases/restocks) and outflows (sales/returns) with timestamps.
- **Reporting**: Generate customizable reports for sales, inventory, and activities filtered by day, week, month, or year. Export options include PDF/CSV.
- **Subscription Payments**: Shopkeepers select payment modes (daily/weekly/monthly) and process payments. Admin validates transactions.
- **Multi-Shop Support**: Each shopkeeper manages their own isolated shop data.
- **Admin Dashboard**: Manage shops, shopkeepers, accessibility, and system processes.
- **Security**: Role-based authentication, data encryption, and validation checks.
- **Offline Mode**: Cache data locally for core operations; sync when online.
- **Responsive UI**: Mobile-friendly design for on-the-go management.
- **Notifications**: Real-time alerts for low stock, payment due dates, and reports.

## User Roles

### Shopkeeper
- Manage personal shop: Categories, products, inventory.
- View and generate reports.
- Select and pay for subscription plans.
- Access limited to their own shop data.

### Admin
- Register and manage shops/shopkeepers.
- Validate payment transactions based on chosen modes.
- Control user accessibility (e.g., suspend accounts).
- Oversee system-wide processes like backups and audits.
- Full access to all shops for oversight (read-only for shop data).

## Technology Stack

- **Backend**: Node.js (with Express.js for API routing).
- **Database**: SQLite (lightweight, file-based for easy offline support).
- **Frontend**: React.js (with React Router for navigation).
- **Styling**: Tailwind CSS v3 (utility-first for rapid, responsive design).
- **Offline Support**: Service Workers, IndexedDB (via libraries like Dexie.js), and PWA manifest.
- **Other Libraries**:
  - Authentication: JWT (JSON Web Tokens).
  - Payments: Integration with Stripe/PayPal APIs (simulated in dev mode).
  - Charts/Reports: Chart.js for visualizations.
  - State Management: Redux or Context API.
  - Build Tools: Vite (for faster React development).

## Architecture

SMART-Shop follows a client-server architecture with a focus on modularity:

- **Frontend (React)**: Handles UI components, state management, and API calls. Components are organized by feature (e.g., `/src/components/ProductManagement`).
- **Backend (Node.js/Express)**: Exposes RESTful APIs for CRUD operations, authentication, and reports. Middleware for validation and error handling.
- **Database (SQLite)**: Normalized schema for efficiency. Migrations handled via Knex.js or raw SQL.
- **Offline Layer**: Uses service workers to cache assets and API responses. Local storage for unsynced data; sync queue for online reconciliation.
- **Data Flow**: Shopkeeper actions → API → Database → Response. Admin actions include additional validation steps.

High-level diagram (ASCII art):

```
[User (Browser)] <-> [React Frontend + Service Worker] <-> [Node.js Backend] <-> [SQLite DB]
                   | (Offline: IndexedDB Cache)
                   v
                 [Payment Gateway (External)]
```

## Online/Offline Functionality

- **Online Mode**: Real-time data sync with the server.
- **Offline Mode**: 
  - Core features (view/manage inventory, generate local reports) work via cached data.
  - Changes queued in IndexedDB; auto-synced on reconnection.
  - Implemented using Workbox (Google's PWA library) for precaching and runtime caching.
- **PWA Installation**: Users can install the app on desktop/mobile for native-like experience.

## Installation

### Prerequisites
- Node.js v18+ and npm.
- Git.

### Steps
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/smart-shop.git
   cd smart-shop
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

4. Set up environment variables:
   - Create `.env` in `/backend`:
     ```
     PORT=5000
     JWT_SECRET=your_secret_key
     DATABASE_URL=./smartshop.db  # SQLite file path
     STRIPE_SECRET_KEY=sk_test_...  # For payments
     ```

5. Initialize database:
   ```
   cd ../backend
   npm run migrate  # If using migrations
   # Or manually create tables via SQL scripts in /db/schema.sql
   ```

6. Build and start:
   - Backend: `npm start`
   - Frontend: `npm run dev` (uses Vite for hot reloading)

The app will be available at `http://localhost:3000` (frontend) and `http://localhost:5000` (API).

## Usage

1. **Register/Login**:
   - Admin: Default credentials (change in production): admin@smartshop.com / password123.
   - Shopkeeper: Sign up via /register endpoint.

2. **Dashboard Navigation**:
   - Shopkeeper: Access inventory, reports, and payments from sidebar.
   - Admin: Manage users/shops from admin panel.

3. **Example Workflow**:
   - Add a product: Navigate to Products > Add > Fill form > Submit.
   - Generate Report: Reports > Select period > Export.
   - Pay Subscription: Payments > Choose mode > Process via gateway.

For detailed user guides, see [docs/user-guide.md](docs/user-guide.md).

## Database Schema

Key tables (SQLite):

- **users**: id (PK), username, email, password_hash, role (admin/shopkeeper), shop_id (FK).
- **shops**: id (PK), name, owner_id (FK to users), created_at.
- **categories**: id (PK), name, shop_id (FK).
- **products**: id (PK), name, price, stock, category_id (FK), shop_id (FK).
- **inventory_logs**: id (PK), product_id (FK), type (in/out), quantity, timestamp, shop_id (FK).
- **payments**: id (PK), user_id (FK), amount, mode (day/week/month), status (pending/validated), transaction_id.
- **reports**: id (PK), type (day/week/etc.), data_json, generated_at, shop_id (FK).

Full schema in `/backend/db/schema.sql`.

## API Endpoints

Base URL: `/api/v1`

- **Auth**:
  - POST `/auth/register`: Create shopkeeper account.
  - POST `/auth/login`: JWT token generation.

- **Products**:
  - GET `/products`: List products (shop-specific).
  - POST `/products`: Add product.

- **Inventory**:
  - POST `/inventory/in`: Log inflow.
  - POST `/inventory/out`: Log outflow.

- **Reports**:
  - GET `/reports?period=day`: Generate report.

- **Payments**:
  - POST `/payments/subscribe`: Initiate payment.
  - GET `/payments/validate/:id`: Admin validation (protected).

- **Admin**:
  - GET `/admin/shops`: List all shops (admin-only).

Use Postman for testing; collection in `/docs/api.postman_collection.json`.

## Payment Integration

- Supports Stripe for real transactions (sandbox in dev).
- Modes: Daily ($1), Weekly ($5), Monthly ($15) – configurable.
- Admin validates via dashboard after gateway callback.

## Testing

- Unit Tests: Jest for backend/frontend.
- E2E Tests: Cypress for UI flows.
- Run: `npm test` in respective folders.
- Coverage: Aim for 80%+.

## Deployment

- **Hosting**: Vercel/Netlify for frontend; Heroku/Render for backend.
- **Database**: Use SQLite for dev; migrate to PostgreSQL for prod if scaling.
- **CI/CD**: GitHub Actions workflow in `.github/workflows/deploy.yml`.
- **PWA**: Ensure `manifest.json` and service worker registration.

## Contributing

Contributions welcome! Follow these steps:
1. Fork the repo.
2. Create a feature branch: `git checkout -b feature/new-feature`.
3. Commit changes: `git commit -m 'Add new feature'`.
4. Push: `git push origin feature/new-feature`.
5. Open a Pull Request.

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- Maintainer: CBS (nizeyimanaplacide2@gmail.com)
- Issues: [GitHub Issues](https://github.com/yourusername/smart-shop/issues)
- Discussions: [GitHub Discussions](https://github.com/yourusername/smart-shop/discussions)
