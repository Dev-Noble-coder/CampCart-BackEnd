const fs = require('fs');
const path = require('path');

const endpoints = [
    // --- AUTHENTICATION ---
    {
        id: 'user-signup',
        section: 'Authentication',
        method: 'POST',
        path: '/api/v1/signup',
        shortDesc: 'Create user',
        isSecure: false,
        description: 'Registers a new user account in the CampCart database.',
        requestBody: [
            { field: 'email', type: 'string', requirement: 'Required', desc: 'Valid email address' },
            { field: 'password', type: 'string', requirement: 'Required', desc: 'Secure password' },
            { field: 'fullName', type: 'string', requirement: 'Required', desc: 'Full name' }
        ],
        payloadExample: `{\n  "email": "user@example.com",\n  "password": "securePass123!",\n  "fullName": "John Doe"\n}`,
        successResponse: `{\n  "message": "Account created successfully",\n  "role": "user"\n}`
    },
    {
        id: 'login',
        section: 'Authentication',
        method: 'POST',
        path: '/api/v1/login',
        shortDesc: 'Login & get tokens',
        isSecure: false,
        description: 'Authenticates credentials and establishes a session.',
        requestBody: [
            { field: 'email', type: 'string', requirement: 'Required', desc: 'Registered email' },
            { field: 'password', type: 'string', requirement: 'Required', desc: 'Password' }
        ],
        payloadExample: `{\n  "email": "user@example.com",\n  "password": "securePass123!"\n}`,
        successResponse: `{\n  "message": "Logged in successfully",\n  "userRole": "user",\n  "accessToken": "ey..."\n}`
    },
    {
        id: 'logout',
        section: 'Authentication',
        method: 'POST',
        path: '/api/v1/auth/logout',
        shortDesc: 'Logout user',
        isSecure: false,
        description: 'Clears the access and refresh tokens from cookies.',
        successResponse: `{\n  "message": "Logged out successfully"\n}`
    },
    {
        id: 'forgot-password',
        section: 'Authentication',
        method: 'POST',
        path: '/api/v1/auth/forgot-password',
        shortDesc: 'Forgot password',
        isSecure: false,
        description: 'Sends a password reset token to the user email.',
        requestBody: [{ field: 'email', type: 'string', requirement: 'Required', desc: 'Registered email' }],
        payloadExample: `{\n  "email": "user@example.com"\n}`,
        successResponse: `{\n  "message": "Password reset token generated"\n}`
    },
    {
        id: 'reset-password',
        section: 'Authentication',
        method: 'POST',
        path: '/api/v1/auth/reset-password/:token',
        shortDesc: 'Reset password',
        isSecure: false,
        description: 'Resets the password using the token.',
        requestBody: [{ field: 'password', type: 'string', requirement: 'Required', desc: 'New password' }],
        payloadExample: `{\n  "password": "newSecurePass123!"\n}`,
        successResponse: `{\n  "message": "Password reset successful"\n}`
    },

    // --- USER SERVICES ---
    {
        id: 'auth-me',
        section: 'User Services',
        method: 'GET',
        path: '/api/v1/auth/me',
        shortDesc: 'Get active user',
        isSecure: true,
        description: 'Retrieves verified user data for the active session.',
        successResponse: `{\n  "message": "Information pulled",\n  "info": { "_id": "...", "fullName": "John", "role": "user" }\n}`
    },
    {
        id: 'update-profile',
        section: 'User Services',
        method: 'POST',
        path: '/api/v1/users/profile',
        shortDesc: 'Update profile',
        isSecure: true,
        description: 'Updates phone number, address.',
        requestBody: [
            { field: 'phoneNumber', type: 'string', requirement: 'Optional', desc: 'Phone number' },
            { field: 'address', type: 'string', requirement: 'Optional', desc: 'Address' }
        ],
        payloadExample: `{\n  "phoneNumber": "+123456789",\n  "address": "123 Main St"\n}`,
        successResponse: `{\n  "message": "Profile updated successfully",\n  "user": { ... }\n}`
    },
    {
        id: 'become-vendor',
        section: 'User Services',
        method: 'POST',
        path: '/api/v1/users/become-vendor',
        shortDesc: 'Become a vendor',
        isSecure: true,
        description: 'Upgrades a standard user to a vendor by setting their business name.',
        requestBody: [
            { field: 'businessName', type: 'string', requirement: 'Required', desc: 'Business name' }
        ],
        payloadExample: `{\n  "businessName": "Camp Gear Co."\n}`,
        successResponse: `{\n  "message": "Successfully became a vendor",\n  "user": { "role": "vendor", "businessName": "Camp Gear Co." }\n}`
    },
    {
        id: 'user-orders-create',
        section: 'User Services',
        method: 'POST',
        path: '/api/v1/orders',
        shortDesc: 'Create order',
        isSecure: true,
        description: 'Creates a new order from user items.',
        requestBody: [
            { field: 'items', type: 'array', requirement: 'Required', desc: 'Array of item objects' },
            { field: 'shippingAddress', type: 'string', requirement: 'Required', desc: 'Address' }
        ],
        payloadExample: `{\n  "items": [{ "product": "id", "quantity": 1 }],\n  "shippingAddress": "123 Main St"\n}`,
        successResponse: `{\n  "message": "Order created successfully",\n  "order": { ... }\n}`
    },
    {
        id: 'user-orders-get',
        section: 'User Services',
        method: 'GET',
        path: '/api/v1/orders',
        shortDesc: 'Get user orders',
        isSecure: true,
        description: 'Gets all orders for the current user.',
        successResponse: `{\n  "message": "Orders fetched",\n  "orders": []\n}`
    },
    {
        id: 'user-orders-id',
        section: 'User Services',
        method: 'GET',
        path: '/api/v1/orders/:id',
        shortDesc: 'Get order by ID',
        isSecure: true,
        description: 'Gets a specific order details.',
        successResponse: `{\n  "message": "Order details",\n  "order": { ... }\n}`
    },
    {
        id: 'user-wishlist',
        section: 'User Services',
        method: 'GET',
        path: '/api/v1/wishlist',
        shortDesc: 'Get wishlist',
        isSecure: true,
        description: 'Gets user wishlist items.',
        successResponse: `{\n  "message": "Wishlist fetched",\n  "wishlist": []\n}`
    },
    {
        id: 'user-wishlist-add',
        section: 'User Services',
        method: 'POST',
        path: '/api/v1/wishlist/add',
        shortDesc: 'Add to wishlist',
        isSecure: true,
        requestBody: [{ field: 'productId', type: 'string', requirement: 'Required', desc: 'Product ID' }],
        payloadExample: `{\n  "productId": "64f8b..."\n}`,
        description: 'Adds a product to user wishlist.',
        successResponse: `{\n  "message": "Added to wishlist"\n}`
    },
    {
        id: 'user-wishlist-remove',
        section: 'User Services',
        method: 'DELETE',
        path: '/api/v1/wishlist/remove/:productId',
        shortDesc: 'Remove from wishlist',
        isSecure: true,
        description: 'Removes a product from user wishlist.',
        successResponse: `{\n  "message": "Removed from wishlist"\n}`
    },

    // --- VENDOR SERVICES ---
    {
        id: 'vendor-auth-me',
        section: 'Vendor Services',
        method: 'GET',
        path: '/api/v1/vendor/auth/me',
        shortDesc: 'Get active vendor',
        isSecure: true,
        description: 'Retrieves verified vendor data.',
        successResponse: `{\n  "message": "Information pulled",\n  "info": { ... }\n}`
    },
    {
        id: 'vendor-categories',
        section: 'Vendor Services',
        method: 'GET',
        path: '/api/v1/vendor/getCatigotries',
        shortDesc: 'Get categories',
        isSecure: true,
        description: 'Gets categories for vendor product creation.',
        successResponse: `{\n  "categories": []\n}`
    },
    {
        id: 'vendor-products-create',
        section: 'Vendor Services',
        method: 'POST',
        path: '/api/v1/vendor/products',
        shortDesc: 'Create product',
        isSecure: true,
        description: 'Creates a new product (Vendor only).',
        requestBody: [
            { field: 'name', type: 'string', requirement: 'Required', desc: 'Product name' },
            { field: 'price', type: 'number', requirement: 'Required', desc: 'Price' },
            { field: 'category', type: 'string', requirement: 'Required', desc: 'Category ID' }
        ],
        payloadExample: `{\n  "name": "Tent",\n  "price": 100,\n  "category": "..."\n}`,
        successResponse: `{\n  "message": "Product created",\n  "product": { ... }\n}`
    },
    {
        id: 'vendor-products-get',
        section: 'Vendor Services',
        method: 'GET',
        path: '/api/v1/vendor/products',
        shortDesc: 'Get vendor products',
        isSecure: true,
        description: 'Retrieves paginated products for the vendor.',
        successResponse: `{\n  "products": [],\n  "total": 10\n}`
    },
    {
        id: 'vendor-products-id',
        section: 'Vendor Services',
        method: 'GET',
        path: '/api/v1/vendor/products/:id',
        shortDesc: 'Get product by ID',
        isSecure: true,
        description: 'Retrieves a single product for the vendor.',
        successResponse: `{\n  "product": { ... }\n}`
    },
    {
        id: 'vendor-products-update',
        section: 'Vendor Services',
        method: 'PUT',
        path: '/api/v1/vendor/products/:id',
        shortDesc: 'Update product',
        isSecure: true,
        requestBody: [{ field: 'price', type: 'number', requirement: 'Optional', desc: 'New price' }],
        payloadExample: `{\n  "price": 120\n}`,
        description: 'Updates a product.',
        successResponse: `{\n  "message": "Product updated"\n}`
    },
    {
        id: 'vendor-products-delete',
        section: 'Vendor Services',
        method: 'DELETE',
        path: '/api/v1/vendor/products/:id',
        shortDesc: 'Delete product',
        isSecure: true,
        description: 'Deletes a product.',
        successResponse: `{\n  "message": "Product deleted"\n}`
    },
    {
        id: 'vendor-orders',
        section: 'Vendor Services',
        method: 'GET',
        path: '/api/v1/vendor/orders',
        shortDesc: 'Get vendor orders',
        isSecure: true,
        description: 'Gets orders containing vendor products.',
        successResponse: `{\n  "orders": []\n}`
    },
    {
        id: 'vendor-orders-id',
        section: 'Vendor Services',
        method: 'GET',
        path: '/api/v1/vendor/orders/:id',
        shortDesc: 'Get vendor order ID',
        isSecure: true,
        description: 'Gets details of a vendor order.',
        successResponse: `{\n  "order": { ... }\n}`
    },
    {
        id: 'vendor-orders-status',
        section: 'Vendor Services',
        method: 'PUT',
        path: '/api/v1/vendor/orders/:id/status',
        shortDesc: 'Update order status',
        isSecure: true,
        description: 'Updates order status (e.g. processing, shipped).',
        requestBody: [{ field: 'status', type: 'string', requirement: 'Required', desc: 'Order status' }],
        payloadExample: `{\n  "status": "shipped"\n}`,
        successResponse: `{\n  "message": "Status updated"\n}`
    },
    {
        id: 'vendor-profile',
        section: 'Vendor Services',
        method: 'PUT',
        path: '/api/v1/vendor/profile',
        shortDesc: 'Update profile',
        isSecure: true,
        description: 'Updates vendor profile.',
        requestBody: [{ field: 'businessName', type: 'string', requirement: 'Optional', desc: 'Business name' }],
        payloadExample: `{\n  "businessName": "New Name"\n}`,
        successResponse: `{\n  "message": "Profile updated"\n}`
    },
    {
        id: 'vendor-dashboard',
        section: 'Vendor Services',
        method: 'GET',
        path: '/api/v1/vendor/dashboard',
        shortDesc: 'Get dashboard stats',
        isSecure: true,
        description: 'Gets vendor dashboard statistics.',
        successResponse: `{\n  "stats": { "totalSales": 1000 }\n}`
    },
    {
        id: 'vendor-dashboard-insights',
        section: 'Vendor Services',
        method: 'GET',
        path: '/api/v1/vendor/dashboard/insights',
        shortDesc: 'Get dashboard insights',
        isSecure: true,
        description: 'Gets overview metrics and top products for the dashboard.',
        successResponse: `{\n  "metrics": {\n    "totalRevenue": 124500,\n    "activeOrders": 12,\n    "totalInventory": 45\n  },\n  "topProducts": [\n    { \n      "id": "...", \n      "name": "...", \n      "price": 1500, \n      "sales": 124, \n      "image": "..." \n    }\n  ]\n}`
    },
    {
        id: 'vendor-orders-recent',
        section: 'Vendor Services',
        method: 'GET',
        path: '/api/v1/vendor/orders/recent',
        shortDesc: 'Get recent orders',
        isSecure: true,
        description: 'Gets recent orders formatted for dashboard display.',
        successResponse: `[\n  {\n    "id": "...",\n    "name": "Sarah Williams",\n    "item": "Jollof Rice Pack",\n    "status": "Delivered",\n    "time": "10 mins ago",\n    "avatar": ""\n  }\n]`
    },
    {
        id: 'vendor-wallet',
        section: 'Vendor Services',
        method: 'GET',
        path: '/api/v1/vendor/wallet',
        shortDesc: 'Get vendor wallet',
        isSecure: true,
        description: 'Gets wallet balance.',
        successResponse: `{\n  "wallet": {\n    "availableBalance": 124500.00\n  },\n  "history": []\n}`
    },
    {
        id: 'vendor-inventory-insights',
        section: 'Vendor Services',
        method: 'GET',
        path: '/api/v1/vendor/inventory/insights',
        shortDesc: 'Get inventory insights',
        isSecure: true,
        description: 'Gets quick stats, revenue chart data, and top selling units for the inventory page.',
        successResponse: `{\n  "quickStats": {\n    "totalRevenue": 845200,\n    "unitsSold": 1204\n  },\n  "chartData": {\n    "Today": [\n      { "day": "6AM", "amount": "₦ 5k", "height": 10 }\n    ]\n  },\n  "topSellingUnits": [\n    { "name": "Fresh Tomatoes", "sold": 450, "color": "bg-orange-500" }\n  ]\n}`
    },

    // --- AGENT SERVICES ---
    {
        id: 'agent-signup',
        section: 'Agent Services',
        method: 'POST',
        path: '/api/v1/agent/signup',
        shortDesc: 'Create agent',
        isSecure: false,
        description: 'Registers a new agent account.',
        requestBody: [
            { field: 'email', type: 'string', requirement: 'Required', desc: 'Email' },
            { field: 'password', type: 'string', requirement: 'Required', desc: 'Password' },
            { field: 'fullName', type: 'string', requirement: 'Required', desc: 'Full Name' }
        ],
        payloadExample: `{\n  "email": "agent@example.com",\n  "password": "pass",\n  "fullName": "Agent Smith"\n}`,
        successResponse: `{\n  "message": "Agent created"\n}`
    },
    {
        id: 'agent-me',
        section: 'Agent Services',
        method: 'GET',
        path: '/api/v1/agent/auth/me',
        shortDesc: 'Get active agent',
        isSecure: true,
        description: 'Retrieves agent profile.',
        successResponse: `{\n  "info": { ... }\n}`
    },
    {
        id: 'agent-orders-available',
        section: 'Agent Services',
        method: 'GET',
        path: '/api/v1/agent/orders/available',
        shortDesc: 'Get available orders',
        isSecure: true,
        description: 'Gets orders available for delivery.',
        successResponse: `{\n  "orders": []\n}`
    },
    {
        id: 'agent-orders-accept',
        section: 'Agent Services',
        method: 'PUT',
        path: '/api/v1/agent/orders/:id/accept',
        shortDesc: 'Accept order',
        isSecure: true,
        description: 'Agent accepts an order for delivery.',
        successResponse: `{\n  "message": "Order accepted"\n}`
    },
    {
        id: 'agent-orders-reject',
        section: 'Agent Services',
        method: 'PUT',
        path: '/api/v1/agent/orders/:id/reject',
        shortDesc: 'Reject order',
        isSecure: true,
        description: 'Agent rejects an order, preventing them from being pinged again for this specific order.',
        successResponse: `{\n  "message": "Order rejected successfully"\n}`
    },
    {
        id: 'agent-orders-assigned',
        section: 'Agent Services',
        method: 'GET',
        path: '/api/v1/agent/orders/assigned',
        shortDesc: 'Get assigned orders',
        isSecure: true,
        description: 'Gets orders assigned to the agent.',
        successResponse: `{\n  "message": "Assigned orders fetched successfully",\n  "ongoingOrders": [],\n  "completedOrders": [],\n  "totalEarnings": 0,\n  "pendingEarnings": 0\n}`
    },
    {
        id: 'agent-orders-status',
        section: 'Agent Services',
        method: 'PUT',
        path: '/api/v1/agent/orders/:id/status',
        shortDesc: 'Update delivery status',
        isSecure: true,
        description: 'Updates delivery status (e.g. delivered).',
        requestBody: [{ field: 'deliveryStatus', type: 'string', requirement: 'Required', desc: 'Delivery Status' }],
        payloadExample: `{\n  "deliveryStatus": "delivered"\n}`,
        successResponse: `{\n  "message": "Status updated"\n}`
    },
    {
        id: 'agent-toggle-online',
        section: 'Agent Services',
        method: 'PUT',
        path: '/api/v1/agent/toggle-online',
        shortDesc: 'Toggle online status',
        isSecure: true,
        description: 'Toggles the agent online/offline status.',
        requestBody: [{ field: 'isOnline', type: 'boolean', requirement: 'Required', desc: 'Online status' }],
        payloadExample: `{\n  "isOnline": true\n}`,
        successResponse: `{\n  "message": "Agent is now online",\n  "isOnline": true\n}`
    },
    {
        id: 'agent-profile',
        section: 'Agent Services',
        method: 'PUT',
        path: '/api/v1/agent/profile',
        shortDesc: 'Update agent profile',
        isSecure: true,
        description: 'Updates agent profile (address, vehicleName, phoneNumber).',
        requestBody: [
            { field: 'address', type: 'string', requirement: 'Optional', desc: 'Agent address' },
            { field: 'vehicleName', type: 'string', requirement: 'Optional', desc: 'Vehicle name' },
            { field: 'phoneNumber', type: 'string', requirement: 'Optional', desc: 'Phone number' }
        ],
        payloadExample: `{\n  "address": "123 Delivery Ln",\n  "vehicleName": "Toyota Corolla",\n  "phoneNumber": "08012345678"\n}`,
        successResponse: `{\n  "message": "Profile updated successfully",\n  "agent": { ... }\n}`
    },

    // --- ADMIN SERVICES ---
    {
        id: 'admin-signup',
        section: 'Admin Services',
        method: 'POST',
        path: '/api/v1/admin/signup',
        shortDesc: 'Create admin',
        isSecure: false,
        description: 'Registers a new admin.',
        requestBody: [
            { field: 'email', type: 'string', requirement: 'Required', desc: 'Email' },
            { field: 'password', type: 'string', requirement: 'Required', desc: 'Password' }
        ],
        payloadExample: `{\n  "email": "admin@example.com",\n  "password": "pass"\n}`,
        successResponse: `{\n  "message": "Admin created"\n}`
    },
    {
        id: 'admin-me',
        section: 'Admin Services',
        method: 'GET',
        path: '/api/v1/admin/auth/me',
        shortDesc: 'Get active admin',
        isSecure: true,
        description: 'Retrieves admin profile.',
        successResponse: `{\n  "info": { ... }\n}`
    },
    {
        id: 'admin-category',
        section: 'Admin Services',
        method: 'POST',
        path: '/api/v1/admin/category',
        shortDesc: 'Create category',
        isSecure: true,
        description: 'Creates a new category.',
        requestBody: [
            { field: 'name', type: 'string', requirement: 'Required', desc: 'Category name' }
        ],
        payloadExample: `{\n  "name": "Camping"\n}`,
        successResponse: `{\n  "message": "Category created"\n}`
    },
    {
        id: 'admin-category-get',
        section: 'Admin Services',
        method: 'GET',
        path: '/api/v1/admin/category',
        shortDesc: 'Get categories',
        isSecure: false,
        description: 'Gets all categories.',
        successResponse: `{\n  "categories": []\n}`
    },
    {
        id: 'admin-dashboard-insights',
        section: 'Admin Services',
        method: 'GET',
        path: '/api/v1/admin/dashboard/insights',
        shortDesc: 'Get platform insights',
        isSecure: true,
        description: 'Gets platform-wide statistics for the admin dashboard.',
        successResponse: `{\n  "message": "Platform insights fetched successfully",\n  "insights": { "totalUsers": 10, "totalVendors": 5, "totalAgents": 2, "activeOrders": 3, "totalRevenue": 45000 }\n}`
    },
    {
        id: 'admin-users-list',
        section: 'Admin Services',
        method: 'GET',
        path: '/api/v1/admin/users?role=vendor&page=1&limit=10',
        shortDesc: 'Get users list',
        isSecure: true,
        description: 'Gets paginated list of users, filterable by role (user, vendor, agent) and searchable by name/email/businessName.',
        successResponse: `{\n  "message": "Users fetched successfully",\n  "users": [],\n  "total": 5,\n  "totalPages": 1,\n  "currentPage": 1\n}`
    },
    {
        id: 'admin-user-status',
        section: 'Admin Services',
        method: 'PUT',
        path: '/api/v1/admin/users/:id/status',
        shortDesc: 'Update user status',
        isSecure: true,
        description: 'Updates a user status (e.g. active, suspended).',
        requestBody: [{ field: 'status', type: 'string', requirement: 'Required', desc: 'User status' }],
        payloadExample: `{\n  "status": "suspended"\n}`,
        successResponse: `{\n  "message": "User status updated to suspended successfully."\n}`
    },
    {
        id: 'admin-platform-orders',
        section: 'Admin Services',
        method: 'GET',
        path: '/api/v1/admin/orders?page=1&limit=10&status=Pending',
        shortDesc: 'Get platform orders',
        isSecure: true,
        description: 'Gets paginated list of all orders across the platform.',
        successResponse: `{\n  "message": "Orders fetched successfully",\n  "orders": [],\n  "total": 12,\n  "totalPages": 2,\n  "currentPage": 1\n}`
    },
    {
        id: 'admin-platform-products',
        section: 'Admin Services',
        method: 'GET',
        path: '/api/v1/admin/products?page=1&limit=10',
        shortDesc: 'Get platform products',
        isSecure: true,
        description: 'Gets paginated list of all products across the platform.',
        successResponse: `{\n  "message": "Products fetched successfully",\n  "products": [],\n  "total": 50,\n  "totalPages": 5,\n  "currentPage": 1\n}`
    },
    {
        id: 'admin-product-delete',
        section: 'Admin Services',
        method: 'DELETE',
        path: '/api/v1/admin/products/:id',
        shortDesc: 'Delete platform product',
        isSecure: true,
        description: 'Allows admin to delete any product.',
        successResponse: `{\n  "message": "Product deleted successfully."\n}`
    },

    // --- PUBLIC PRODUCT SERVICES ---
    {
        id: 'public-products',
        section: 'Product Services',
        method: 'GET',
        path: '/api/v1/products',
        shortDesc: 'Get public products',
        isSecure: false,
        description: 'Gets all products with optional filters (search, category, etc).',
        successResponse: `{\n  "products": [],\n  "totalProducts": 100\n}`
    },
    {
        id: 'public-products-id',
        section: 'Product Services',
        method: 'GET',
        path: '/api/v1/products/:id',
        shortDesc: 'Get product',
        isSecure: false,
        description: 'Gets a single product by ID.',
        successResponse: `{\n  "product": { ... }\n}`
    },
    {
        id: 'public-categories',
        section: 'Product Services',
        method: 'GET',
        path: '/api/v1/categories',
        shortDesc: 'Get categories',
        isSecure: false,
        description: 'Gets all public categories.',
        successResponse: `{\n  "categories": []\n}`
    },

    // --- REVIEW SERVICES ---
    {
        id: 'reviews-get',
        section: 'Review Services',
        method: 'GET',
        path: '/api/v1/reviews/products/:productId',
        shortDesc: 'Get product reviews',
        isSecure: false,
        description: 'Gets reviews for a specific product.',
        successResponse: `{\n  "reviews": []\n}`
    },
    {
        id: 'reviews-post',
        section: 'Review Services',
        method: 'POST',
        path: '/api/v1/reviews/products/:productId',
        shortDesc: 'Create review',
        isSecure: true,
        description: 'Adds a review for a product.',
        requestBody: [
            { field: 'rating', type: 'number', requirement: 'Required', desc: 'Rating 1-5' },
            { field: 'comment', type: 'string', requirement: 'Required', desc: 'Review text' }
        ],
        payloadExample: `{\n  "rating": 5,\n  "comment": "Great!"\n}`,
        successResponse: `{\n  "message": "Review submitted"\n}`
    },
    {
        id: 'reviews-put',
        section: 'Review Services',
        method: 'PUT',
        path: '/api/v1/reviews/:id',
        shortDesc: 'Update review',
        isSecure: true,
        description: 'Updates a user review.',
        requestBody: [
            { field: 'rating', type: 'number', requirement: 'Optional', desc: 'Rating' },
            { field: 'comment', type: 'string', requirement: 'Optional', desc: 'Review text' }
        ],
        payloadExample: `{\n  "rating": 4\n}`,
        successResponse: `{\n  "message": "Review updated"\n}`
    },
    {
        id: 'reviews-delete',
        section: 'Review Services',
        method: 'DELETE',
        path: '/api/v1/reviews/:id',
        shortDesc: 'Delete review',
        isSecure: true,
        description: 'Deletes a user review.',
        successResponse: `{\n  "message": "Review deleted"\n}`
    }
];

const sections = [...new Set(endpoints.map(e => e.section))];

// Generate Nav Sidebar
let navHtml = '';
for (const sec of sections) {
    navHtml += `
    <div class="nav-section">
        <div class="nav-section-title">${sec}</div>`;
    const secEndpoints = endpoints.filter(e => e.section === sec);
    for (const e of secEndpoints) {
        navHtml += `
        <a href="#route-${e.id}" class="nav-link" onclick="setActiveLink(this)">
            ${e.method} ${e.path}
            <span class="badge ${e.method.toLowerCase()}">${e.method}</span>
        </a>`;
    }
    navHtml += `</div>`;
}

// Generate Endpoint Cards
let cardsHtml = '';
for (const sec of sections) {
    cardsHtml += `
    <div class="section-title">
        ${sec}
    </div>`;
    
    const secEndpoints = endpoints.filter(e => e.section === sec);
    for (const e of secEndpoints) {
        let reqBodyHtml = '';
        if (e.requestBody && e.requestBody.length > 0) {
            reqBodyHtml += `
            <div class="detail-title">Request Body Fields</div>
            <table class="params-table">
                <thead><tr><th>Field</th><th>Type</th><th>Requirement</th><th>Description</th></tr></thead>
                <tbody>`;
            for (const r of e.requestBody) {
                reqBodyHtml += `
                <tr>
                    <td class="param-name">${r.field}</td>
                    <td class="param-type">${r.type}</td>
                    <td class="param-req ${r.requirement.toLowerCase()}">${r.requirement}</td>
                    <td>${r.desc}</td>
                </tr>`;
            }
            reqBodyHtml += `</tbody></table>`;
        }

        let payloadHtml = '';
        if (e.payloadExample) {
            payloadHtml = `
            <div class="detail-title">Request Payload Example</div>
            <div class="code-container">
                <pre class="code-block">${e.payloadExample}</pre>
            </div>`;
        }

        cardsHtml += `
        <div class="endpoint-card" id="route-${e.id}">
            <div class="endpoint-header" onclick="toggleCard(this)">
                <span class="badge-method ${e.method.toLowerCase()}">${e.method}</span>
                ${e.isSecure ? '<span class="badge-method auth-tag" style="background-color: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3);">SECURE</span>' : ''}
                <span class="endpoint-path">${e.path}</span>
                <span class="endpoint-short-desc">${e.shortDesc}</span>
                <span class="chevron-icon">▼</span>
            </div>
            <div class="endpoint-details">
                <p class="detail-description">${e.description}</p>
                ${reqBodyHtml}
                ${payloadHtml}
                <div class="detail-title">Success Response Example</div>
                <div class="code-container">
                    <pre class="code-block">${e.successResponse}</pre>
                </div>
            </div>
        </div>`;
    }
}

navHtml += `<a href="#section-websockets" class="nav-link" style="color: #f59e0b; font-weight: bold; margin-top: 1rem;">Real-Time WebSockets</a>`;

cardsHtml += `
    <div class="section-title" id="section-websockets">Real-Time WebSockets</div>
    <div class="endpoint-card">
        <div class="endpoint-header" onclick="toggleCard(this)">
            <span class="badge-method" style="background-color: #f59e0b; color: #fff;">SOCKET</span>
            <span class="endpoint-path">Socket.io Connection</span>
            <span class="endpoint-short-desc">Agent Dispatching</span>
            <span class="chevron-icon">▼</span>
        </div>
        <div class="endpoint-details">
            <p class="detail-description">Real-time socket connection for agent dispatching. Clients must connect using Socket.io and join the active pool.</p>
            
            <div class="detail-title">Events to Emit (Client -> Server)</div>
            <ul>
                <li><code>join_online_agents</code>: Emitted by the frontend when an agent goes online. Places them in the active delivery pool.</li>
            </ul>

            <div class="detail-title">Events to Listen For (Server -> Client)</div>
            <ul>
                <li><code>new_delivery_request</code>: Fired when an order is ready for pickup and broadcasting to all online agents.</li>
            </ul>
            <div class="code-container">
                <pre class="code-block">{
  "order": {
    "_id": "60d5ec...",
    "user": { "fullName": "John", "email": "..." },
    "vendor": { "businessName": "Store" },
    "items": [...],
    "status": "Ready for Pickup"
  },
  "orderId": "60d5ec...",
  "pickupAddress": "Vendor Address",
  "dropoffAddress": "Customer Address",
  "earnings": 250,
  "vendorName": "Store Name"
}</pre>
            </div>

            <ul>
                <li><code>remove_delivery_request</code>: Fired when an order is claimed by an agent. Used to dismiss the popup for runner-up agents.</li>
            </ul>
            <div class="code-container">
                <pre class="code-block">{
  "orderId": "60d5ec..."
}</pre>
            </div>
        </div>
    </div>
`;

const templatePath = path.join(__dirname, '../template.html');
const outPath = path.join(__dirname, '../index.html');
let html = fs.readFileSync(templatePath, 'utf8');
html = html.replace('${navHtml}', navHtml);
html = html.replace('${cardsHtml}', cardsHtml);
fs.writeFileSync(outPath, html);
console.log('Successfully built index.html from template.html with all ' + endpoints.length + ' endpoints.');
