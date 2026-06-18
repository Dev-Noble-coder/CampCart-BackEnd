import Category from "../../../models/category.js";
import Product from "../../../models/product.js";
import User from "../../../models/users.js";

export const createProduct = async (req, res) => {
    try {
        const userid = req.accessToken.userID || req.accessToken.id;
        
        // 1. Verify the user is a vendor
        const user = await User.findById(userid);
        if (!user || user.role !== "vendor") {
            return res.status(403).json({
                message: "Access denied. Only vendors can create products."
            });
        }
        const {
            name,
            description,
            price,
            category,
            images,
            is_flash_sale,
            is_recommended,
            stock
        } = req.body;

        if (!name || !description || !price || !category) {
            return res.status(400).json({
                message: "Please provide all required fields: name, description, price, category."
            });
        }
        const newProduct = new Product({
            name,
            description,
            price,
            category,
            vendor: userid, 
            images: images || [],
            is_flash_sale: is_flash_sale || false,
            is_recommended: is_recommended || false,
            stock: stock || 0
        });

        const savedProduct = await newProduct.save();

        res.status(201).json({
            message: "Product created successfully",
            product: savedProduct
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "An error occurred while creating the product",
            error: error.message
        });
    }
};
export const getProduct = async (req,res) => {
    try {
        const userid = req.accessToken.userID || req.accessToken.id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const fetchuserProduct = await Product.find({ vendor: userid })
            .skip(skip)
            .limit(limit);
            
        const total = await Product.countDocuments({ vendor: userid });

        if(!fetchuserProduct){
            return res.status(400).json({
                message : "an error occured "
            })
        }
        res.status(200).json({
            message : "product pulled",
            products  : fetchuserProduct,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalProducts: total
        })


    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "An error occurred while fetching the products",
            error: error.message
        });
    }
}
export const getCatigory = async (req,res) => {
    try {
        const userid = req.accessToken.userID || req.accessToken.id;

        const availableCatigory = await Category.find({}).select("name description")

        if(!availableCatigory){
            return res.status(400).json({
                message : "An error occur "
            })
        }
        res.status(200).json({
            message : "catigory pulled ",
            catigory : availableCatigory
        })


    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "An error occurred while fetching the products",
            error: error.message
        });
    }

}