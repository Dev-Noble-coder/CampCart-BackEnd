import { Resend } from "resend";

// Initialize Resend with API Key from environment variables
// If the key is missing, it will throw an error, so we only instantiate it if it exists
// or we handle the missing key gracefully for local dev without crashing the server.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const senderEmail = process.env.SENDER_EMAIL || "onboarding@resend.dev"; // Default Resend test email

export const sendPasswordResetEmail = async (email, resetUrl) => {
    if (!resend) {
        console.warn("RESEND_API_KEY not configured. Skipping password reset email to:", email);
        console.warn("Reset URL would be:", resetUrl);
        return;
    }

    try {
        await resend.emails.send({
            from: senderEmail,
            to: email,
            subject: "Reset your CampCart Password",
            html: `
                <p>Hello,</p>
                <p>You requested to reset your password. Click the link below to set a new password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>If you didn't request this, you can safely ignore this email.</p>
                <p>This link will expire in 1 hour.</p>
            `
        });
        console.log("Password reset email sent to:", email);
    } catch (error) {
        console.error("Error sending password reset email:", error);
    }
};

export const sendOrderConfirmationEmail = async (email, orderId, totalAmount) => {
    if (!resend) {
        console.warn("RESEND_API_KEY not configured. Skipping order confirmation email to:", email);
        return;
    }

    try {
        await resend.emails.send({
            from: senderEmail,
            to: email,
            subject: `Order Confirmation - #${orderId}`,
            html: `
                <p>Thank you for your order!</p>
                <p>Your order (ID: ${orderId}) has been received successfully.</p>
                <p>Total Amount: $${totalAmount}</p>
                <p>We will notify you when the status changes.</p>
            `
        });
        console.log("Order confirmation email sent to:", email);
    } catch (error) {
        console.error("Error sending order confirmation email:", error);
    }
};

export const sendOrderStatusEmail = async (email, orderId, status) => {
    if (!resend) {
        console.warn("RESEND_API_KEY not configured. Skipping order status email to:", email);
        return;
    }

    try {
        await resend.emails.send({
            from: senderEmail,
            to: email,
            subject: `Order Status Update - #${orderId}`,
            html: `
                <p>Hello,</p>
                <p>Your order (ID: ${orderId}) status has been updated to: <strong>${status}</strong></p>
                <p>Thank you for shopping with us!</p>
            `
        });
        console.log("Order status update email sent to:", email);
    } catch (error) {
        console.error("Error sending order status email:", error);
    }
};
