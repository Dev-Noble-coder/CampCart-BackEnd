import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: false
    },
    type: {
        type: String,
        required: false
    },
    extras: [{
        name: String,
        price: Number
    }],
    extrasTotal: {
        type: Number,
        default: 0
    }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    items: [orderItemSchema],
    subTotal: {
        type: Number,
        required: true
    },
    deliveryCharge: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Processing", "Ready for Pickup", "Picked Up", "On the Way", "Delivered"],
        default: "Pending"
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: false // some items could be from different vendors, or if it's a multi-vendor order we might need to handle this differently. Assuming single vendor for simplicity or multiple orders per checkout.
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: false // assigned delivery agent
    },
    type: {
        type: String,
        enum: ["pickup", "delivery", "Pickup", "Delivery"],
        required: true
    },
    deliveryAddress: {
        type: String,
        required: false
    },
    paymentMethod: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Completed", "Failed"],
        default: "Pending"
    }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
