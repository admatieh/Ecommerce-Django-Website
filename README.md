# Velora E-Commerce Platform

A modern, production-ready e-commerce platform built with React, TypeScript, TailwindCSS, Django, and Django REST Framework.

## Project Description

Velora is a fully functional e-commerce storefront. 
- **Users** can browse a catalogue of products (with variants like size and color), search, add items to their persistent cart, register/login, verify their email, and complete orders through a simulated checkout process.
- **Admins** have access to a powerful Django dashboard to manage products, categories, stock, discounts, users, contact messages, and view orders.

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Django + Django REST Framework (DRF)
- **DB**: SQLite

## Features

- **Authentication (JWT)**: Secure login/registration.
- **Email verification**: Required before placing orders (simulated via console logs in dev mode).
- **Product browsing**: Filtering, sorting, related products, and variant selection.
- **Cart system**: Backend-driven persistent cart scoped to the user.
- **Checkout & orders**: Atomic transactions, stock validation, and discount/shipping logic.
- **Admin dashboard**: Comprehensive control over the store data and configuration.

## Setup Instructions

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies (make sure you have a virtual environment active):
   ```bash
   pip install -r requirements.txt
   cd ..
   ```
3. Run migrations:
   ```bash
   python manage.py migrate
   ```
4. Seed the database with mock data:
   ```bash
   python manage.py seed_data
   ```
5. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend

1. Navigate to the project root directory:
   ```bash
   cd ./root_directory
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Demo Accounts

You can log in with the following seeded accounts.

**Admin:**
- **Username:** `admin`
- **Password:** `admin123`

**User:**
- **Email:** `user@test.com`
- **Password:** `user123`

## Notes

- Email verification uses console output in development mode. Look for the verification URL in your terminal where the backend server is running after registering a new account.
- Stripe payment integration is not implemented yet (coming soon); currently, all orders process via Cash on Delivery.
