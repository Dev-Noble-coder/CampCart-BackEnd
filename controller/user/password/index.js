import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../../../models/users.js";
import { sendPasswordResetEmail } from "../../../lib/email.js";

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Please provide your email address." });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "No user found with that email address." });
        }

        // Generate a random token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Hash the token before saving to the database for security
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        // Set token and expiration (1 hour from now)
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        // Construct reset URL pointing to the frontend
        // Assuming the frontend routes /reset-password/:token
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        // Send email
        await sendPasswordResetEmail(user.email, resetUrl);

        res.status(200).json({
            message: "Password reset email sent. Please check your inbox."
        });

    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({
            message: "An error occurred while processing your request",
            error: error.message
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ message: "Please provide a new password." });
        }

        // Hash the token from the URL to compare with the one in the DB
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        // Find user with matching token that hasn't expired yet
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Token is invalid or has expired." });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear the reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({
            message: "Password has been successfully reset. You can now log in."
        });

    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({
            message: "An error occurred while resetting your password",
            error: error.message
        });
    }
};
