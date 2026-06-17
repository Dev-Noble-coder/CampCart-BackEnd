import User from "../../../models/users.js";

export const updateProfile = async (req,res) => {
    try {
        const userid = req.accessToken.userID || req.accessToken.id;
        const {phoneNumber,address,businessName} =  req.body 

        const updateUserInfo = await User.findByIdAndUpdate(
             userid,
            { phoneNumber, address },
            { new: true } 
        );
        if(!updateUserInfo){
            return res.status(400).json({
                message : "An error occurred"
            })
        }
        res.status(200).json({
            message : "Info added successfully",
            info: updateUserInfo
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'An error occurred',
            error: error.message
        });
    }
}