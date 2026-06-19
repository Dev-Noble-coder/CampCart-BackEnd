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
    storeDescription: {
        type: String,
        required: false // Only for vendors
    },
    businessHours: {
        monday: { isOpen: { type: Boolean, default: true }, openTime: { type: String, default: "08:00" }, closeTime: { type: String, default: "20:00" } },
        tuesday: { isOpen: { type: Boolean, default: true }, openTime: { type: String, default: "08:00" }, closeTime: { type: String, default: "20:00" } },
        wednesday: { isOpen: { type: Boolean, default: true }, openTime: { type: String, default: "08:00" }, closeTime: { type: String, default: "20:00" } },
        thursday: { isOpen: { type: Boolean, default: true }, openTime: { type: String, default: "08:00" }, closeTime: { type: String, default: "20:00" } },
        friday: { isOpen: { type: Boolean, default: true }, openTime: { type: String, default: "08:00" }, closeTime: { type: String, default: "22:00" } },
        saturday: { isOpen: { type: Boolean, default: true }, openTime: { type: String, default: "09:00" }, closeTime: { type: String, default: "22:00" } },
        sunday: { isOpen: { type: Boolean, default: false }, openTime: { type: String, default: "00:00" }, closeTime: { type: String, default: "00:00" } }
    },
    status: {
        type: String,
        enum: ["active", "suspended", "pending"],
        default: "active"
    },
    isOnline: {
        type: Boolean,
        default: false // For agents
    },
    vehicleName: {
        type: String,
        required: false // For agents
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, { timestamps: true });

userSchema.set('toJSON', {
    transform: function(doc, ret) {
        if (ret.role !== 'vendor') {
            delete ret.businessHours;
            delete ret.businessName;
            delete ret.storeDescription;
        }
        if (!['agent', 'deliveryAgent'].includes(ret.role)) {
            delete ret.isOnline;
            delete ret.vehicleName;
        }
        return ret;
    }
});

const User = mongoose.model("users", userSchema);
export default User;