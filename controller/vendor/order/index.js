import Order from "../../../models/order.js";
import User from "../../../models/users.js";
import { sendOrderStatusEmail, sendNewDeliveryAvailableEmail } from "../../../lib/email.js";

export const getVendorOrders = async (req, res) => {
    try {
        const userid = req.user?._id || req.accessToken?.userID || req.accessToken?.id;

        const orders = await Order.find({ vendor: userid })
            .populate("user", "fullName email phoneNumber")
            .populate("items.product", "name price images")
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
        console.error("Error fetching vendor orders:", error);
        res.status(500).json({
            message: "An error occurred while fetching orders",
            error: error.message
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const userid = req.user?._id || req.accessToken?.userID || req.accessToken?.id;
        const { id } = req.params;

        const order = await Order.findOne({ _id: id, vendor: userid })
            .populate("user", "fullName email phoneNumber address")
            .populate("items.product", "name price images category")
            .populate("agent", "fullName phoneNumber")
            .lean();

        if (!order) {
            return res.status(404).json({ message: "Order not found or access denied." });
        }

        if (!order.agent) {
            order.agent = (order.type && order.type.toLowerCase() === "delivery") ? "Agent is yet to collect" : "Pickup Order";
        }

        res.status(200).json({
            message: "Order fetched successfully",
            order
        });
    } catch (error) {
        console.error("Error fetching vendor order:", error);
        res.status(500).json({
            message: "An error occurred while fetching the order",
            error: error.message
        });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const userid = req.user?._id || req.accessToken?.userID || req.accessToken?.id;
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = ["Pending", "Processing", "Ready for Pickup"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Vendors can only set: ${allowedStatuses.join(", ")}` });
        }

        const order = await Order.findOneAndUpdate(
            { _id: id, vendor: userid },
            { $set: { status } },
            { new: true, runValidators: true }
        ).populate("user", "fullName email phoneNumber address").populate("vendor", "businessName address").populate("items.product", "name price");

        if (!order) {
            return res.status(404).json({ message: "Order not found or access denied." });
        }

        if (order.user && order.user.email) {
            sendOrderStatusEmail(order);
        }

        if (status === "Ready for Pickup" && order.type && order.type.toLowerCase() === "delivery") {
            const agents = await User.find({ role: "deliveryAgent" }).select("email");
            const agentEmails = agents.map(agent => agent.email);
            if (agentEmails.length > 0) {
                const vendorName = order.vendor ? order.vendor.businessName : "CampCart Vendor";
                sendNewDeliveryAvailableEmail(agentEmails, order._id, vendorName);
            }

            // Real-Time Socket Dispatch
            if (req.io) {
                req.io.to("online_agents").emit("new_delivery_request", {
                    order: order, // The full order object, exactly like what the /available endpoint returns!
                    orderId: order._id,
                    pickupAddress: order.vendor ? order.vendor.address : "Vendor Address",
                    dropoffAddress: order.deliveryAddress,
                    earnings: order.deliveryCharge || 0,
                    vendorName: order.vendor ? order.vendor.businessName : "CampCart Vendor"
                });
            }
        }

        res.status(200).json({
            message: "Order status updated successfully",
            order
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({
            message: "An error occurred while updating the order status",
            error: error.message
        });
    }
};

export const getRecentOrders = async (req, res) => {
    try {
        const userid = req.user?._id || req.accessToken?.userID || req.accessToken?.id;

        const orders = await Order.find({ vendor: userid })
            .populate("user", "fullName email phoneNumber")
            .populate("items.product", "name")
            .sort({ createdAt: -1 })
            .limit(3);

        const recentOrders = orders.map(o => {
            const timeDiff = Math.abs(new Date() - new Date(o.createdAt));
            const minutes = Math.floor(timeDiff / (1000 * 60));
            const hours = Math.floor(minutes / 60);
            let timeString = `${minutes} mins ago`;
            if (hours > 0) timeString = `${hours} hr${hours > 1 ? 's' : ''} ago`;
            if (hours >= 24) {
                const days = Math.floor(hours / 24);
                timeString = `${days} day${days > 1 ? 's' : ''} ago`;
            }

            return {
                id: o._id,
                name: o.user ? o.user.fullName : "Unknown Buyer",
                item: o.items && o.items.length > 0 && o.items[0].product ? o.items[0].product.name : "Unknown Item",
                status: o.status,
                time: timeString,
                avatar: ""
            };
        });

        res.status(200).json(recentOrders);
    } catch (error) {
        console.error("Error fetching recent orders:", error);
        res.status(500).json({
            message: "An error occurred",
            error: error.message
        });
    }
};
