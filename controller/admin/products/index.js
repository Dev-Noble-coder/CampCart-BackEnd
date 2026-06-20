import Product from "../../../models/product.js";

export const getPlatformProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        
        let query = {};
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const products = await Product.find(query)
            .populate("vendor", "businessName fullName email")
            .populate("category", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Product.countDocuments(query);

        res.status(200).json({
            message: "Products fetched successfully",
            products,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error("Error fetching platform products:", error);
        res.status(500).json({
            message: "An error occurred while fetching products",
            error: error.message
        });
    }
};

export const deleteProductAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        res.status(200).json({
            message: "Product deleted successfully."
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({
            message: "An error occurred while deleting the product",
            error: error.message
        });
    }
};
