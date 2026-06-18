import Category from "../../../models/category.js";

export const createCategory = async (req, res) => {
    try {
        const { name, icon, description } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const existingCategory = await Category.findOne({ name });

        if (existingCategory) {
            return res.status(409).json({
                message: "A category with this name already exists"
            });
        }

        const newCategory = await Category.create({
            name,
            icon: icon || "",
            description: description || ""
        });

        if (!newCategory) {
            return res.status(400).json({
                message: "Something went wrong, please try again"
            });
        }

        res.status(201).json({
            message: "Category created successfully",
            category: newCategory
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'An error occurred',
            error: error.message
        });
    }
};

export const getCategory = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Categories fetched successfully",
            categories
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'An error occurred',
            error: error.message
        });
    }
};
