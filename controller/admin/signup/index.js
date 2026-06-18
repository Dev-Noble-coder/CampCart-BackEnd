import User from "../../../models/users.js";
import bcrypt from "bcrypt";

export const signup = async (req, res) => {
    try {
        const { email, fullName, password} = req.body;

        if (!email || !fullName || !password) {
            return res.status(400).json({
                message: "Email, full name, or password not provided"
            });
        }

        const validateExistence = await User.findOne({ email });

        if (validateExistence) {
            return res.status(403).json({
                message: "Admin with this email already exists"
            });
        }

        const encryptPassword = await bcrypt.hash(password, 10);

        const saveNewInfo = await User.create({
            fullName,
            email,
            password: encryptPassword,
            role: "admin"
        });

        if (!saveNewInfo) {
            return res.status(400).json({
                message: "Something went wrong, please try again"
            });
        }

        res.status(201).json({
            message: "Admin account created successfully",
            role: "admin",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'An error occurred',
            error: error.message
        });
    }
};
