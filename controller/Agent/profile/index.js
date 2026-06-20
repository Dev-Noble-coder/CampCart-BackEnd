import User from "../../../models/users.js";

export const toggleOnlineStatus = async (req, res) => {
    try {
        const userid = req.accessToken.userID || req.accessToken.id;
        const { isOnline } = req.body;

        if (typeof isOnline !== 'boolean') {
            return res.status(400).json({ message: "isOnline must be a boolean value." });
        }

        const user = await User.findByIdAndUpdate(
            userid,
            { isOnline },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "Agent not found" });
        }

        res.status(200).json({
            message: `Agent is now ${isOnline ? 'online' : 'offline'}`,
            isOnline: user.isOnline
        });

    } catch (error) {
        console.error("Error toggling online status:", error);
        res.status(500).json({
            message: "An error occurred while updating status",
            error: error.message
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userid = req.accessToken.userID || req.accessToken.id;
        const { address, vehicleName, phoneNumber } = req.body;

        const updateData = {};
        if (address !== undefined) updateData.address = address;
        if (vehicleName !== undefined) updateData.vehicleName = vehicleName;
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No valid fields provided for update." });
        }

        const user = await User.findByIdAndUpdate(
            userid,
            updateData,
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "Agent not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            agent: user
        });

    } catch (error) {
        console.error("Error updating agent profile:", error);
        res.status(500).json({
            message: "An error occurred while updating profile",
            error: error.message
        });
    }
};
