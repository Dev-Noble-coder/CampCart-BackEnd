import Order from "../../../models/order.js";
import Product from "../../../models/product.js";
import User from "../../../models/users.js";
import { sendOrderConfirmationEmail } from "../../../lib/email.js";

export const createOrder = async (req, res) => {
    try {
        const userid = req.accessToken.userID || req.accessToken.id;
        const { items, deliveryAddress, paymentMethod, deliveryType } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Order items cannot be empty." });
        }

        if (!paymentMethod) {
            return res.status(400).json({ message: "Payment method is required." });
        }

        if (!deliveryType || !["pickup", "delivery"].includes(deliveryType)) {
            return res.status(400).json({ message: "Invalid or missing deliveryType. Must be 'pickup' or 'delivery'." });
        }

        if (deliveryType === "delivery" && !deliveryAddress) {
            return res.status(400).json({ message: "Delivery address is required for delivery orders." });
        }

        let totalAmount = 0;
        const orderItems = [];
        let orderVendorId = null;
        const stockUpdates = [];

        // Validate products and calculate total amount from DB prices
        for (const item of items) {
            const quantity = parseInt(item.quantity) || 1;
            const product = await Product.findById(item.product);
            
            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.product} not found.` });
            }

            if (product.stock < quantity) {
                return res.status(400).json({ message: `Insufficient stock for product ${product.name}. Available: ${product.stock}` });
            }

            if (!orderVendorId) {
                orderVendorId = product.vendor;
            }

            const itemPrice = product.price;
            totalAmount += itemPrice * quantity;

            orderItems.push({
                product: product._id,
                quantity: quantity,
                price: itemPrice
            });

            // Queue stock deduction to run only after order successfully saves
            stockUpdates.push({ productId: product._id, quantity });
        }

        const newOrder = new Order({
            user: userid,
            vendor: orderVendorId,
            items: orderItems,
            totalAmount,
            deliveryType,
            deliveryAddress: deliveryType === "delivery" ? deliveryAddress : undefined,
            paymentMethod,
            status: "Pending",
            paymentStatus: "Pending"
        });

        const savedOrder = await newOrder.save();

        // Safely deduct stock now that order is confirmed saved
        for (const update of stockUpdates) {
            await Product.findByIdAndUpdate(update.productId, { $inc: { stock: -update.quantity } });
        }

        // Send order confirmation email asynchronously
        const user = await User.findById(userid);
        if (user && user.email) {
            sendOrderConfirmationEmail(user.email, savedOrder._id, totalAmount);
        }

        res.status(201).json({
            message: "Order placed successfully",
            order: savedOrder
        });

    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({
            message: "An error occurred while placing the order",
            error: error.message
        });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const userid = req.accessToken.userID || req.accessToken.id;
        
        const orders = await Order.find({ user: userid })
            .populate("items.product", "name images price")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Orders fetched successfully",
            orders
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({
            message: "An error occurred while fetching orders",
            error: error.message
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const userid = req.accessToken.userID || req.accessToken.id;
        const { id } = req.params;

        const order = await Order.findOne({ _id: id, user: userid })
            .populate("items.product", "name description images price category")
            .populate("vendor", "businessName fullName");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            message: "Order fetched successfully",
            order
        });
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({
            message: "An error occurred while fetching the order",
            error: error.message
        });
    }
};
