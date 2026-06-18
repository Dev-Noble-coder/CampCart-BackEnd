import User from "../../../models/users.js";

export const becomeVendor = async (req, res) => {
    try {
        const { businessName } = req.body;
        const userid = req.accessToken.userID || req.accessToken.id; // From authorization middleware

        if (!businessName) {
            return res.status(400).json({
                message: "Business name is required to become a vendor"
            });
        }

        const user = await User.findById(userid);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.role === "vendor") {
            return res.status(400).json({
                message: "User is already a vendor"
            });
        }

        user.businessName = businessName;
        user.role = "vendor";
        await user.save();

        res.status(200).json({
            message: "Successfully became a vendor",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                businessName: user.businessName
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'An error occurred',
            error: error.message
        });
    }
};
