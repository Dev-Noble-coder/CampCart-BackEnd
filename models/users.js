import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role : {
        type : String,
        enum : ["user","vendor","admin","agent","deliveryAgent"],
        default: "user",
        required: true 
    },
    phoneNumber: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    businessName: {
        type: String,
        required: false // Only for vendors
    },
    status: {
        type: String,
        enum: ["active", "suspended", "pending"],
        default: "active"
    }
}, { timestamps: true });

const User = mongoose.model("users", userSchema);
export default User;