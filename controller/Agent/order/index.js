import Order from "../../../models/order.js";
import { sendOrderStatusEmail } from "../../../lib/email.js";

export const getAvailableOrders = async (req, res) => {
    try {
        // Find delivery orders that are ready for pickup but not yet assigned to an agent
        const orders = await Order.find({ status: "Ready for Pickup", agent: { $exists: false }, deliveryType: "delivery" })
            .populate("user", "fullName email phoneNumber address")
            .populate("vendor", "businessName address")
            .sort({ createdAt: 1 }); // Oldest first

        res.status(200).json({
            message: "Available orders fetched successfully",
            orders
        });
    } catch (error) {
        console.error("Error fetching available orders:", error);
        res.status(500).json({
            message: "An error occurred while fetching available orders",
            error: error.message
        });
    }
};

export const acceptOrder = async (req, res) => {
    try {
        const agentid = req.user?._id || req.accessToken?.userID || req.accessToken?.id;
        const { id } = req.params;

        const order = await Order.findOneAndUpdate(
            { _id: id, status: "Ready for Pickup", agent: { $exists: false }, deliveryType: "delivery" },
            { $set: { agent: agentid } },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({ message: "Order not found, or it has already been accepted by another agent." });
        }

        res.status(200).json({
            message: "Order accepted successfully",
            order
        });
    } catch (error) {
        console.error("Error accepting order:", error);
        res.status(500).json({
            message: "An error occurred while accepting the order",
            error: error.message
        });
    }
};

export const getAssignedOrders = async (req, res) => {
    try {
        const agentid = req.user?._id || req.accessToken?.userID || req.accessToken?.id;

        const orders = await Order.find({ agent: agentid })
            .populate("user", "fullName email phoneNumber address")
            .populate("vendor", "businessName address phoneNumber")
            .sort({ updatedAt: -1 });

        res.status(200).json({
            message: "Assigned orders fetched successfully",
            orders
        });
    } catch (error) {
        console.error("Error fetching assigned orders:", error);
        res.status(500).json({
            message: "An error occurred while fetching assigned orders",
            error: error.message
        });
    }
};

export const updateDeliveryStatus = async (req, res) => {
    try {
        const agentid = req.user?._id || req.accessToken?.userID || req.accessToken?.id;
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = ["Ready for Pickup", "Picked Up", "On the Way", "Delivered"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Agents can only set: ${allowedStatuses.join(", ")}` });
        }

        const order = await Order.findOneAndUpdate(
            { _id: id, agent: agentid },
            { $set: { status } },
            { new: true, runValidators: true }
        ).populate("user", "email");

        if (!order) {
            return res.status(404).json({ message: "Order not found or access denied." });
        }

        if (order.user && order.user.email) {
            sendOrderStatusEmail(order.user.email, order._id, status);
        }

        res.status(200).json({
            message: "Delivery status updated successfully",
            order
        });
    } catch (error) {
        console.error("Error updating delivery status:", error);
        res.status(500).json({
            message: "An error occurred while updating the delivery status",
            error: error.message
        });
    }
};
