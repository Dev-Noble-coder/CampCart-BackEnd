# CampCart BackEnd

## Overview

CampCart is a centralized, hyper-local multi-vendor marketplace and intelligent last-mile delivery platform designed specifically for Redemption City. The platform aims to solve the growing difficulties residents, visitors, and vendors face when trying to buy, sell, and distribute goods efficiently across the camp, especially during high-density church programs.

## Problem Statement

Residents, visitors, and vendors in Redemption City experience difficulties accessing and distributing essential goods due to the concentration of commercial activities around areas such as the Old Auditorium and Canaanland market axis. As the city expands and population density increases during major church programs, people often travel long distances through heavy traffic and overcrowded routes just to purchase basic necessities.

Current solutions are largely informal, fragmented, and inefficient. Most vendors rely on physical visibility, WhatsApp status updates, or word-of-mouth marketing, while customers struggle to locate products, compare options, or arrange reliable delivery services.

This creates logistical inefficiencies, wasted time, reduced convenience, traffic congestion, and limited business reach for local vendors.

There is a need for a centralized smart marketplace and last-mile delivery platform that enables vendors to showcase products digitally while allowing users to conveniently order items and receive reliable doorstep delivery anywhere within Redemption City.

## Proposed Solution

Our solution is a centralized, hyper-local multi-vendor marketplace and intelligent last-mile delivery platform. It provides a unified digital ecosystem where:

- **Vendors** can showcase products, receive payments, manage inventory, and coordinate deliveries through a simple platform.
- **Customers** can conveniently browse products, compare prices, place orders, and track deliveries in real time.
- **Dispatch Riders** (tricycle riders alongside vetted student and resident dispatch volunteers) are matched with deliveries efficiently.

The system supports multiple categories of businesses including food vendors, grocery stores, pharmacies, fashion and lifestyle brands, household suppliers, and digital/electronic equipment sellers.

## Core Operational Components

1. **Vendor Portal:** Enables merchants to quickly digitize their stores, upload products, process payments, and manage customer orders.
2. **Consumer Application:** Allows residents and visitors to discover nearby vendors, order products seamlessly, and monitor deliveries.
3. **Adaptive Dispatch System:** Connects with Redemption City’s existing transportation structure, integrating tricycle riders alongside vetted volunteers to handle both cross-zone and pedestrian-friendly deliveries.

## API Endpoints Documentation

The backend exposes the following RESTful API routes under the `/api/v1` base path:

### User & Authentication Routes (`/api/v1`)
- `POST /signup` - Register a new user
- `POST /login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/forgot-password` - Request a password reset
- `POST /auth/reset-password/:token` - Reset password
- `GET /auth/me` - Get current user profile (Protected)
- `POST /users/profile` - Update user profile (Protected)
- `POST /users/become-vendor` - Apply or upgrade to vendor status (Protected)
- `POST /orders` - Create a new order (Protected)
- `GET /orders` - Get user's order history (Protected)
- `GET /orders/:id` - Get specific order details (Protected)
- `GET /wishlist` - Get user's wishlist (Protected)
- `POST /wishlist/add` - Add product to wishlist (Protected)
- `DELETE /wishlist/remove/:productId` - Remove product from wishlist (Protected)

### Public Product Routes (`/api/v1`)
- `GET /products` - Get a list of active products, supports search, category, and flash sale filters
- `GET /products/:id` - Get details of a specific product
- `GET /categories` - Get all available product categories

### Review Routes (`/api/v1/reviews`)
- `GET /products/:productId` - Get all reviews for a specific product
- `POST /products/:productId` - Add a review to a product (Protected)
- `PUT /:id` - Update an existing review (Protected)
- `DELETE /:id` - Delete a review (Protected)

### Vendor Routes (`/api/v1/vendor`)
- `GET /auth/me` - Get vendor profile details (Protected)
- `GET /getCatigotries` - Get categories for vendor product listing (Protected)
- `POST /products` - Create a new product (Vendor only)
- `GET /products` - Get vendor's products (Vendor only)
- `GET /products/:id` - Get a specific vendor product (Vendor only)
- `PUT /products/:id` - Update a vendor product (Vendor only)
- `DELETE /products/:id` - Delete a vendor product (Vendor only)
- `GET /orders` - Get all orders placed to the vendor (Vendor only)
- `GET /orders/recent` - Get recent orders (Vendor only)
- `GET /orders/:id` - Get specific order details for vendor (Vendor only)
- `PUT /orders/:id/status` - Update order status (Vendor only)
- `PUT /profile` - Update vendor profile (Vendor only)
- `GET /dashboard` - Get vendor dashboard statistics (Vendor only)
- `GET /dashboard/insights` - Get detailed vendor dashboard insights (Vendor only)
- `GET /wallet` - Get vendor wallet balance and details (Vendor only)
- `GET /inventory/insights` - Get vendor inventory analytics (Vendor only)

### Agent / Delivery Routes (`/api/v1/agent`)
- `POST /signup` - Register as a delivery agent
- `GET /auth/me` - Get agent profile details (Protected)
- `GET /orders/available` - Get available orders for pickup (Agent only)
- `PUT /orders/:id/accept` - Accept a delivery order (Agent only)
- `PUT /orders/:id/reject` - Reject a delivery order (Agent only)
- `GET /orders/assigned` - Get orders assigned to the agent (Agent only)
- `PUT /orders/:id/status` - Update delivery status (Agent only)
- `PUT /toggle-online` - Toggle agent's online/offline status for receiving orders (Agent only)
- `PUT /profile` - Update agent profile (Agent only)

### Admin Routes (`/api/v1/admin`)
- `POST /signup` - Register a new admin (Protected setup)
- `GET /auth/me` - Get admin profile details (Protected)
- `POST /category` - Create a new product category (Admin only)
- `GET /category` - List all categories
- `GET /agents/:agentId/orders` - Get orders completed/assigned to a specific agent (Admin only)
- `GET /dashboard/insights` - Platform-wide insights and statistics (Admin only)
- `GET /users` - Get a list of all users, vendors, and agents (Admin only)
- `PUT /users/:id/status` - Update a user's status (Active/Suspended) (Admin only)
- `GET /orders` - Get platform-wide order details (Admin only)
- `GET /products` - Get all platform products (Admin only)
- `DELETE /products/:id` - Delete any product globally (Admin only)

---

## Features to be Integrated Soon

While the core functionality of the marketplace and delivery tracking is established, there are several advanced, intelligent, and scalable features highlighted in our proposed solution that are **not yet integrated but will be integrated very soon**:

1. **Smart Order Batching:** Grouping multiple orders heading toward similar destinations to reduce delivery time, lower transportation costs, and improve dispatch efficiency during peak demand.
2. **Optimized Dispatch Matching:** Automatically assigning orders to the nearest and most suitable rider or volunteer based on location, delivery type, and traffic conditions.
3. **AI-Assisted Vendor Onboarding:** Helping local merchants quickly set up digital storefronts by automatically generating product descriptions and organizing inventory from uploaded images or text lists.
4. **Intelligent Location Interpretation:** Using natural language processing to interpret informal landmark-based addresses commonly used within Redemption City and converting them into precise delivery directions for dispatch agents.
5. **Secure Unified Payment Gateways:** Direct integration with major local payment processors (e.g., Paystack, Flutterwave) to automate in-app payments, escrows, and split payments between vendors and delivery agents.
6. **Offline SMS Fallback System:** Ensuring that dispatch coordination and essential order updates continue seamlessly even during internet instability or network congestion, typical during massive camp programs.

## Running the Application

1. Clone the repository
2. Install dependencies with `npm install`
3. Setup environment variables (`.env` file)
4. Run the server using `npm start` or `npm run dev` for development.
