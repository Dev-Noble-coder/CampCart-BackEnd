import jwt from "jsonwebtoken";

const authorization = async (req, res, next) => {
    try {
        const accessToken = req.cookies?.Accesstoken || req.cookies?.accessToken
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

export default authorization;