import Order from "../../../models/order.js";
import Product from "../../../models/product.js";
import User from "../../../models/users.js";
import { sendOrderConfirmationEmail } from "../../../lib/email.js";

export const createOrder = async (req, res) => {
    try {
        const userid = req.accessToken.userID || req.accessToken.id;
        const { items, deliveryAddress, paymentMethod, type, deliveryCharge: clientDeliveryCharge } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Order items cannot be empty." });
        }

        if (!paymentMethod) {
            return res.status(400).json({ message: "Payment method is required." });
        }

        if (!type || !["pickup", "delivery", "Pickup", "Delivery"].includes(type)) {
            return res.status(400).json({ message: "Invalid or missing type. Must be 'Pickup' or 'Delivery'." });
        }

        const normalizedType = type.toLowerCase() === "delivery" ? "Delivery" : "Pickup";

        if (normalizedType === "Delivery" && !deliveryAddress) {
            return res.status(400).json({ message: "Delivery address is required for delivery orders." });
        }

        const stockUpdates = [];
        const vendorGroups = {}; // { vendorId: { items: [], subTotal: 0 } }

        // Validate products and group by vendor
        for (const item of items) {
            const quantity = parseInt(item.quantity) || 1;
            const product = await Product.findById(item.product);
            
            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.product} not found.` });
            }

            if (product.stock < quantity) {
                return res.status(400).json({ message: `Insufficient stock for product ${product.name}. Available: ${product.stock}` });
            }

            let extrasTotal = 0;
            const extras = item.extras || [];
            extras.forEach(extra => {
                extrasTotal += Number(extra.price) || 0;
            });

            const itemPrice = product.price;
            const itemSubTotal = (itemPrice * quantity) + extrasTotal;

            const vendorId = product.vendor.toString();

            if (!vendorGroups[vendorId]) {
                vendorGroups[vendorId] = {
                    items: [],
                    subTotal: 0
                };
            }

            vendorGroups[vendorId].items.push({
                product: product._id,
                quantity: quantity,
                price: itemPrice,
                vendor: product.vendor,
                type: item.type,
                extras: extras,
                extrasTotal: extrasTotal
            });
            vendorGroups[vendorId].subTotal += itemSubTotal;

            // Queue stock deduction
            stockUpdates.push({ productId: product._id, quantity });
        }

        const savedOrders = [];
        let overallTotal = 0;
        const totalVendors = Object.keys(vendorGroups).length;

        for (const [vendorId, group] of Object.entries(vendorGroups)) {
            const vendorDeliveryCharge = normalizedType === "Delivery" ? ((Number(clientDeliveryCharge) || 500) / totalVendors) : 0;
            const vendorTotal = group.subTotal + vendorDeliveryCharge;
            overallTotal += vendorTotal;

            const newOrder = new Order({
                user: userid,
                vendor: vendorId,
                items: group.items,
                subTotal: group.subTotal,
                deliveryCharge: vendorDeliveryCharge,
                total: vendorTotal,
                type: normalizedType,
                deliveryAddress: normalizedType === "Delivery" ? deliveryAddress : undefined,
                paymentMethod,
                status: "Pending",
                paymentStatus: "Pending"
            });

            const savedOrder = await newOrder.save();
            savedOrders.push(savedOrder);
        }

        // Safely deduct stock now that orders are confirmed saved
        for (const update of stockUpdates) {
            await Product.findByIdAndUpdate(update.productId, { $inc: { stock: -update.quantity } });
        }

        // Send order confirmation email asynchronously
        const user = await User.findById(userid);
        if (user && user.email && savedOrders.length > 0) {
            sendOrderConfirmationEmail(user.email, savedOrders[0]._id, overallTotal);
        }

        res.status(201).json({
            message: "Orders placed successfully",
            orders: savedOrders
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
            .populate("vendor", "businessName fullName address role")
            .populate("agent", "fullName phoneNumber")
            .sort({ createdAt: -1 })
            .lean();

        const formattedOrders = orders.map(o => {
            if (!o.agent) {
                o.agent = (o.type && o.type.toLowerCase() === "delivery") ? "Agent is yet to collect" : "Pickup Order";
            }
            return o;
        });

        res.status(200).json({
            message: "Orders fetched successfully",
            orders: formattedOrders
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
            .populate("vendor", "businessName fullName address role")
            .populate("agent", "fullName phoneNumber")
            .lean();

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (!order.agent) {
            order.agent = (order.type && order.type.toLowerCase() === "delivery") ? "Agent is yet to collect" : "Pickup Order";
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
