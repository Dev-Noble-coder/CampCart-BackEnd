import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    icon: {
        type: String, // URL to image/icon
        default: ""
    },
    description: {
        type: String
    }
}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);
export default Category;
