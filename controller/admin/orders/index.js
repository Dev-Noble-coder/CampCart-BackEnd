import Order from "../../../models/order.js";

export const getPlatformOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = "" } = req.query;
        
        let query = {};
        if (status) {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const orders = await Order.find(query)
            .populate("user", "fullName email phoneNumber")
            .populate("vendor", "businessName fullName phoneNumber")
            .populate("agent", "fullName phoneNumber")
            .populate("items.product", "name price images")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Order.countDocuments(query);

        res.status(200).json({
            message: "Orders fetched successfully",
            orders,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error("Error fetching platform orders:", error);
        res.status(500).json({
            message: "An error occurred while fetching orders",
            error: error.message
        });
    }
};
