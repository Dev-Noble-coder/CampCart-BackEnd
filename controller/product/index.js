import express from "express";
import Product from "../../models/product.js";
import Category from "../../models/category.js";
import User from "../../models/users.js";

const router = express.Router();

export const getProducts = async (req, res) => {
    try {
        const { search, category, is_flash_sale, is_recommended, page = 1, limit = 10 } = req.query;

        const now = new Date();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDay = days[now.getDay()];

        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${currentHours}:${currentMinutes}`;

        const activeVendors = await User.find({ 
            role: "vendor", 
            status: "active",
            [`businessHours.${currentDay}.isOpen`]: true,
            [`businessHours.${currentDay}.openTime`]: { $lte: currentTime },
            [`businessHours.${currentDay}.closeTime`]: { $gte: currentTime }
        }).select('_id');
        const activeVendorIds = activeVendors.map(v => v._id);

        let query = { vendor: { $in: activeVendorIds } };

        if (search) {
            query.name = { $regex: search, $options: "i" };
        }
        if (category) {
            if (Array.isArray(category)) {
                query.category = { $in: category };
            } else {
                query.category = category;
            }
        }
        if (is_flash_sale) {
            query.is_flash_sale = is_flash_sale === "true";
        }
        if (is_recommended) {
            query.is_recommended = is_recommended === "true";
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const products = await Product.find(query)
            .populate("category", "name icon description")
            .populate("vendor", "businessName fullName address role")
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(query);

        res.status(200).json({
            message: "Products fetched successfully",
            products,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalProducts: total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "An error occurred while fetching products",
            error: error.message
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id)
            .populate("category", "name icon description")
            .populate("vendor", "businessName fullName email address role");

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({
            message: "Product fetched successfully",
            product
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "An error occurred while fetching the product",
            error: error.message
        });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({}).select("name icon description");
        res.status(200).json({
            message: "Categories fetched successfully",
            categories
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "An error occurred while fetching categories",
            error: error.message
        });
    }
};

router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.get("/categories", getCategories);

export default router;
