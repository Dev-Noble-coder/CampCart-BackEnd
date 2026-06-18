import User from "../../../models/users.js";

export const admininfo = async (req, res) => {
    try {
        const userid = req.accessToken.userID || req.accessToken.id;
        const admin = await User.findById(userid).select("-password");

        if (!admin) {
            return res.status(404).json({
                message: "Admin with this info does not exist"
            });
        }

        if (admin.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admin only."
            });
        }

        return res.status(200).json({
            message: "Information pulled",
            info: admin
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'An error occurred',
            error: error.message
        });
    }
};
