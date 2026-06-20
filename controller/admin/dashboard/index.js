import Order from "../../../models/order.js";
import User from "../../../models/users.js";

export const getPlatformInsights = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: "user" });
        const totalVendors = await User.countDocuments({ role: "vendor" });
        const totalAgents = await User.countDocuments({ role: { $in: ["agent", "deliveryAgent"] } });

        const activeOrders = await Order.countDocuments({ status: { $ne: "Delivered" } });

        // Summing the total of all delivered orders for platform volume
        const deliveredOrders = await Order.find({ status: "Delivered" }).lean();
        const totalRevenue = deliveredOrders.reduce((sum, order) => sum + (order.total || 0), 0);

        res.status(200).json({
            message: "Platform insights fetched successfully",
            insights: {
                totalUsers,
                totalVendors,
                totalAgents,
                activeOrders,
                totalRevenue
            }
        });
    } catch (error) {
        console.error("Error fetching platform insights:", error);
        res.status(500).json({
            message: "An error occurred while fetching platform insights",
            error: error.message
        });
    }
};
