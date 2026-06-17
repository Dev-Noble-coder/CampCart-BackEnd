import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    deliverfee: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    images: [{
        type: String
    }],
    is_flash_sale: {
        type: Boolean,
        default: false
    },
    is_recommended: {
        type: Boolean,
        default: false
    },
    stock: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
export default Product;
