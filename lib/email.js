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
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 40px 20px; color: #1f2937;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                        <div style="background-color: #4f46e5; padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">CampCart</h1>
                        </div>
                        <div style="padding: 40px 30px;">
                            <h2 style="margin-top: 0; color: #111827; font-size: 22px; font-weight: 600;">Password Reset Request</h2>
                            <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Hello,</p>
                            <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">We received a request to reset the password for your CampCart account. Click the button below to choose a new password.</p>
                            <div style="text-align: center; margin: 35px 0;">
                                <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; transition: background-color 0.2s;">Reset Password</a>
                            </div>
                            <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-bottom: 0;">If you didn't request a password reset, you can safely ignore this email. This link will automatically expire in 1 hour.</p>
                        </div>
                        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; font-size: 13px; color: #9ca3af;">&copy; ${new Date().getFullYear()} CampCart. All rights reserved.</p>
                        </div>
                    </div>
                </div>
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
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 40px 20px; color: #1f2937;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                        <div style="background-color: #10b981; padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">CampCart</h1>
                        </div>
                        <div style="padding: 40px 30px;">
                            <h2 style="margin-top: 0; color: #111827; font-size: 22px; font-weight: 600; text-align: center;">Thank you for your order!</h2>
                            <p style="font-size: 16px; line-height: 1.6; color: #4b5563; text-align: center;">We've received your order and are currently processing it.</p>
                            
                            <div style="margin: 30px 0; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Order Details</p>
                                <p style="margin: 0 0 8px 0; font-size: 16px; color: #111827;"><strong>Order ID:</strong> #${orderId}</p>
                                <p style="margin: 0; font-size: 18px; color: #10b981; font-weight: 700;">Total Amount: $${totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                            </div>
                            
                            <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">We will notify you by email as soon as the status of your order changes. Thank you for shopping with us!</p>
                        </div>
                        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; font-size: 13px; color: #9ca3af;">&copy; ${new Date().getFullYear()} CampCart. All rights reserved.</p>
                        </div>
                    </div>
                </div>
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
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 40px 20px; color: #1f2937;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                        <div style="background-color: #f59e0b; padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">CampCart</h1>
                        </div>
                        <div style="padding: 40px 30px;">
                            <h2 style="margin-top: 0; color: #111827; font-size: 22px; font-weight: 600;">Order Status Update</h2>
                            <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Hello,</p>
                            <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">We're writing to let you know that the status of your order has changed.</p>
                            
                            <div style="margin: 30px 0; background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 0 8px 8px 0;">
                                <p style="margin: 0 0 8px 0; font-size: 14px; color: #92400e;">Order #${orderId}</p>
                                <p style="margin: 0; font-size: 20px; color: #b45309; font-weight: 700;">Status: ${status}</p>
                            </div>
                            
                            <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">You can track your order at any time from your account dashboard. If you have any questions, feel free to contact our support team.</p>
                        </div>
                        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; font-size: 13px; color: #9ca3af;">&copy; ${new Date().getFullYear()} CampCart. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            `
        });
        console.log("Order status update email sent to:", email);
    } catch (error) {
        console.error("Error sending order status email:", error);
    }
};
