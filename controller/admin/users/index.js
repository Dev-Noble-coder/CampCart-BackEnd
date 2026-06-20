import User from "../../../models/users.js";

export const getUsersList = async (req, res) => {
    try {
        const { role, page = 1, limit = 10, search = "" } = req.query;
        
        let query = {};
        if (role) {
            query.role = role === "agent" ? { $in: ["agent", "deliveryAgent"] } : role;
        }

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { businessName: { $regex: search, $options: "i" } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const users = await User.find(query)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await User.countDocuments(query);

        res.status(200).json({
            message: "Users fetched successfully",
            users,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error("Error fetching users list:", error);
        res.status(500).json({
            message: "An error occurred while fetching users",
            error: error.message
        });
    }
};

export const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !["active", "suspended", "pending"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value." });
        }

        const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({
            message: `User status updated to ${status} successfully.`,
            user
        });
    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({
            message: "An error occurred while updating user status",
            error: error.message
        });
    }
};
