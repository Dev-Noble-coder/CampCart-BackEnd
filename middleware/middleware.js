import jwt from "jsonwebtoken";
import User from "../models/users.js";

const authorization = async (req, res, next) => {
    try {
        const accessToken = req.cookies?.Accesstoken || req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
        if (!accessToken) {
            return res.status(401).json({
                message: "No access token"
            })
        }
        const verifiedToken = jwt.verify(
            accessToken,
            process.env.jwt
        )
        if (!verifiedToken) {
            return res.status(401).json({
                message: "Invalid token"
            })
        }
        req.accessToken = verifiedToken
        req.acessToken= verifiedToken
        next()
    } catch (error) {

        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                message: "Access token invalid"
            })
        }

        res.status(500).json({
            message: "Server error"
        })
    }
}
export const checkRole = (roles) => {
    return async (req, res, next) => {
        try {
            const userid = req.accessToken?.userID || req.accessToken?.id;
            if (!userid) {
                return res.status(401).json({ message: "Unauthorized. User ID missing from token." });
            }

            const user = await User.findById(userid);
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }

            if (!roles.includes(user.role)) {
                return res.status(403).json({ message: "Access denied. Insufficient permissions." });
            }

            // Optionally attach the full user object to the request for convenience
            req.user = user;
            next();
        } catch (error) {
            console.error("Role Verification Error:", error);
            res.status(500).json({ message: "Role verification failed", error: error.message });
        }
    };
};

export default authorization;