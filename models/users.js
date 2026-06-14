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
        enum : ["user","admin","agent","deliveryAgent",],
        default: "user",
        required: true 
    }
});

const User = mongoose.model("users", userSchema);
export default User;