import User from "../../../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }

        const validateExistence = await User.findOne({ email });

        if (!validateExistence) {
            return res.status(400).json({
                message: "User with this info does not exist"
            });
        }

        const storedPassword = validateExistence.password;
        const validatePassword = await bcrypt.compare(password, storedPassword);

        if (!validatePassword) {
            return res.status(400).json({
                message: "Incorrect password"
            });
        }

        const accessToken = jwt.sign({
            userID: validateExistence._id
        }, process.env.jwt, { expiresIn: "1d" });

        const refreshToken = jwt.sign({
            userID: validateExistence._id,
        }, process.env.refersToken, { expiresIn: '7d' });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Logged in successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'An error occurred',
            error: error.message
        });
    }
};