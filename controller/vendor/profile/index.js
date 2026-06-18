import User from "../../../models/users.js";
import Product from "../../../models/product.js";
import Order from "../../../models/order.js";

export const updateVendorProfile = async (req, res) => {
    try {
        const userid = req.user?._id || req.accessToken?.userID || req.accessToken?.id;
        const { businessName, address, phoneNumber } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userid,
            { $set: { businessName, address, phoneNumber } },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "Vendor not found." });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Error updating vendor profile:", error);
        res.status(500).json({
            message: "An error occurred while updating profile",
            error: error.message
        });
    }
};

export const getVendorDashboardStats = async (req, res) => {
    try {
        const userid = req.user?._id || req.accessToken?.userID || req.accessToken?.id;

        // Count total products
        const totalProducts = await Product.countDocuments({ vendor: userid });

        // Aggregate order stats
        const orders = await Order.find({ vendor: userid });
        
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === "Pending").length;
        const processingOrders = orders.filter(o => o.status === "Processing").length;
        
        let totalRevenue = 0;
        orders.forEach(o => {
            if (o.paymentStatus === "Completed" || o.status === "Delivered") {
                totalRevenue += o.totalAmount;
            }
        });

        res.status(200).json({
            message: "Dashboard stats fetched successfully",
            stats: {
                totalProducts,
                totalOrders,
                pendingOrders,
                processingOrders,
                totalRevenue
            }
        });
    } catch (error) {
        console.error("Error fetching vendor stats:", error);
        res.status(500).json({
            message: "An error occurred while fetching dashboard stats",
            error: error.message
        });
    }
};
