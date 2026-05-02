# AutoShop

AutoShop is a Next.js dealership web app with:

- admin login and dashboard
- client login and dashboard
- car inventory with brand, model, type, price, and description
- admin management for cars, car types, users, and transactions
- MySQL database support for XAMPP / phpMyAdmin

## Tech Stack

- Next.js App Router
- React
- TypeScript
- MySQL with `mysql2`
- JWT cookie authentication
- Tailwind CSS

## XAMPP Setup

1. Start `Apache` and `MySQL` in XAMPP.
2. Open phpMyAdmin.
3. Import [database/schema.sql](/C:/AutoShop/database/schema.sql).
4. Copy `.env.example` to `.env.local` if needed and update the database settings.
5. Install dependencies with `npm install`.
6. Start the app with `npm run dev`.
7. Open [http://localhost:3000](http://localhost:3000).

## Default Admin Login

- Email: `admin@autoshop.com`
- Password: `admin123`

## Main Routes

- `/` public landing page
- `/login` shared login form
- `/register` client registration
- `/admin/dashboard` admin overview
- `/admin/cars` manage cars
- `/admin/types` manage vehicle categories
- `/admin/transactions` review client orders
- `/admin/users` view registered users
- `/user/dashboard` client dashboard
- `/user/cars` browse inventory
- `/user/transactions` see personal transaction history

## Notes

- Admins can create car types like `SUV`, `Van`, `Pickup`, and more before adding cars.
- Clients can browse available cars and submit transactions.
- Admins approve, reject, or complete transactions from the admin panel.
