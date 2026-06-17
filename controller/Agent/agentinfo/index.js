import User from "../../../models/users.js";

export const userinfo = async (req, res) => {
    try {
        const userid = req.accessToken.userID || req.accessToken.id; // Check both in case login is using a different key
        const validateID = await User.findById(userid).select("-password");
        
        if (!validateID) { 
            return res.status(404).json({
                message: "Agent with this info does not exist"
            });
        }
        
        return res.status(200).json({
            message: "Information pulled",
            info: validateID
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'An error occurred',
            error: error.message
        });
    }
};
