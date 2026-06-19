import Order from "../../../models/order.js";
import User from "../../../models/users.js";
import { sendOrderStatusEmail, sendNewDeliveryAvailableEmail } from "../../../lib/email.js";

export const getVendorOrders = async (req, res) => {
    try {
        const userid = req.user?._id || req.accessToken?.userID || req.accessToken?.id;

        const orders = await Order.find({ vendor: userid })
            .populate("user", "fullName email phoneNumber")
            .populate("items.product", "name price images")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Orders fetched successfully",
            orders
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
            .populate("items.product", "name price images category");

        if (!order) {
            return res.status(404).json({ message: "Order not found or access denied." });
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
        ).populate("user", "email").populate("vendor", "businessName");

        if (!order) {
            return res.status(404).json({ message: "Order not found or access denied." });
        }

        if (order.user && order.user.email) {
            sendOrderStatusEmail(order.user.email, order._id, status);
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
