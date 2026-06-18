import Order from "../../../models/order.js";
import User from "../../../models/users.js";

export const getAgentOrders = async (req, res) => {
    try {
        const { agentId } = req.params;

        // Verify the user is actually an agent
        const agent = await User.findOne({ _id: agentId, role: "deliveryAgent" });
        if (!agent) {
            return res.status(404).json({ message: "Delivery agent not found." });
        }

        const orders = await Order.find({ agent: agentId })
            .populate("user", "fullName email phoneNumber address")
            .populate("vendor", "businessName address phoneNumber")
            .sort({ updatedAt: -1 });

        res.status(200).json({
            message: "Agent orders fetched successfully",
            agent: {
                fullName: agent.fullName,
                email: agent.email,
                phoneNumber: agent.phoneNumber
            },
            orders
        });
    } catch (error) {
        console.error("Error fetching agent orders:", error);
        res.status(500).json({
            message: "An error occurred while fetching agent orders",
            error: error.message
        });
    }
};
