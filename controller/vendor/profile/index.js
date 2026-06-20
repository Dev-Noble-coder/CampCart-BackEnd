import User from "../../../models/users.js";
import Product from "../../../models/product.js";
import Order from "../../../models/order.js";

export const updateVendorProfile = async (req, res) => {
    try {
        const userid = req.user?._id || req.accessToken?.userID || req.accessToken?.id;
        const { businessName, address, phoneNumber, businessHours, storeDescription } = req.body;

        const updateData = { businessName, address, phoneNumber, };
        if (businessHours) updateData.businessHours = businessHours;
        if (storeDescription !== undefined) updateData.storeDescription = storeDescription;

        const updatedUser = await User.findByIdAndUpdate(
            userid,
            { $set: updateData },
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

export const getVendorDashboardInsights = async (req, res) => {
    try {
        const userid = req.user?._id || req.accessToken?.userID || req.accessToken?.id;

        const orders = await Order.find({ vendor: userid });
        const activeOrders = orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").length;
        
        let totalRevenue = 0;
        orders.forEach(o => {
            if (o.status === "Delivered" || o.paymentStatus === "Completed") {
                o.items.forEach(item => {
                    totalRevenue += (item.price * item.quantity);
                });
            }
        });

        const products = await Product.find({ vendor: userid });
        const totalInventory = products.length;

        const topProducts = await Product.find({ vendor: userid })
            .sort({ sales: -1 })
            .limit(3)
            .select("name price sales images");

        const formattedTopProducts = topProducts.map((p, index) => ({
            id: p._id,
            name: p.name,
            price: p.price,
            sales: p.sales || 0,
            image: p.images && p.images.length > 0 ? p.images[0] : ""
        }));

        res.status(200).json({
            metrics: {
                totalRevenue,
                activeOrders,
                totalInventory
            },
            topProducts: formattedTopProducts
        });
    } catch (error) {
        console.error("Error fetching dashboard insights:", error);
        res.status(500).json({
            message: "An error occurred",
            error: error.message
        });
    }
};

export const getVendorWallet = async (req, res) => {
    try {
        const userid = req.user?._id || req.accessToken?.userID || req.accessToken?.id;

        const orders = await Order.find({ vendor: userid, $or: [{status: "Delivered"}, {paymentStatus: "Completed"}] });
        
        let availableBalance = 0;
        orders.forEach(o => {
            o.items.forEach(item => {
                availableBalance += (item.price * item.quantity);
            });
        });

        res.status(200).json({
            wallet: {
                availableBalance
            },
            history: [] 
        });
    } catch (error) {
        console.error("Error fetching wallet:", error);
        res.status(500).json({
            message: "An error occurred",
            error: error.message
        });
    }
};

export const getVendorInventoryInsights = async (req, res) => {
    try {
        const userid = req.user?._id || req.accessToken?.userID || req.accessToken?.id;

        const orders = await Order.find({ vendor: userid, $or: [{status: "Delivered"}, {paymentStatus: "Completed"}] });
        
        let totalRevenue = 0;
        let unitsSold = 0;
        
        orders.forEach(o => {
            o.items.forEach(item => {
                totalRevenue += (item.price * item.quantity);
                unitsSold += item.quantity;
            });
        });

        const chartData = {
            "Today": [
                { day: "6AM", amount: "₦ 0", height: 0 },
                { day: "9AM", amount: "₦ 0", height: 0 },
                { day: "12PM", amount: "₦ 0", height: 0 },
                { day: "3PM", amount: "₦ 0", height: 0 },
                { day: "6PM", amount: "₦ 0", height: 0 },
                { day: "9PM", amount: "₦ 0", height: 0 }
            ],
            "This Week": [
                { day: "Mon", amount: "₦ 0", height: 0 },
                { day: "Tue", amount: "₦ 0", height: 0 },
                { day: "Wed", amount: "₦ 0", height: 0 },
                { day: "Thu", amount: "₦ 0", height: 0 },
                { day: "Fri", amount: "₦ 0", height: 0 },
                { day: "Sat", amount: "₦ 0", height: 0 },
                { day: "Sun", amount: "₦ 0", height: 0 }
            ],
            "This Month": [
                { day: "Wk 1", amount: "₦ 0", height: 0 },
                { day: "Wk 2", amount: "₦ 0", height: 0 },
                { day: "Wk 3", amount: "₦ 0", height: 0 },
                { day: "Wk 4", amount: "₦ 0", height: 0 }
            ]
        };

        const topProducts = await Product.find({ vendor: userid })
            .sort({ sales: -1 })
            .limit(4)
            .select("name sales");

        const colors = ["bg-orange-500", "bg-green-500", "bg-blue-500", "bg-purple-500"];
        const topSellingUnits = topProducts.map((p, index) => ({
            name: p.name,
            sold: p.sales || 0,
            color: colors[index % colors.length]
        }));

        res.status(200).json({
            quickStats: {
                totalRevenue,
                unitsSold
            },
            chartData,
            topSellingUnits
        });
    } catch (error) {
        console.error("Error fetching inventory insights:", error);
        res.status(500).json({
            message: "An error occurred",
            error: error.message
        });
    }
};
