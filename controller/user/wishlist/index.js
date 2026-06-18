import Wishlist from "../../../models/wishlist.js";
import Product from "../../../models/product.js";

export const getWishlist = async (req, res) => {
    try {
        const userid = req.user?._id || req.accessToken?.userID || req.accessToken?.id;

        let wishlist = await Wishlist.findOne({ user: userid })
            .populate("products", "name price images description category");

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: userid, products: [] });
        }

        res.status(200).json({
            message: "Wishlist fetched successfully",
            wishlist
        });
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).json({
            message: "An error occurred while fetching wishlist",
            error: error.message
        });
    }
};

export const addToWishlist = async (req, res) => {
    try {
        const userid = req.user?._id || req.accessToken?.userID || req.accessToken?.id;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required." });
        }

        const productExists = await Product.findById(productId);
        if (!productExists) {
            return res.status(404).json({ message: "Product not found." });
        }

        let wishlist = await Wishlist.findOne({ user: userid });

        if (!wishlist) {
            wishlist = new Wishlist({ user: userid, products: [productId] });
            await wishlist.save();
        } else {
            if (!wishlist.products.includes(productId)) {
                wishlist.products.push(productId);
                await wishlist.save();
            }
        }

        // Return updated wishlist with populated products
        wishlist = await Wishlist.findById(wishlist._id).populate("products", "name price images");

        res.status(200).json({
            message: "Product added to wishlist",
            wishlist
        });
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).json({
            message: "An error occurred while adding to wishlist",
            error: error.message
        });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const userid = req.user?._id || req.accessToken?.userID || req.accessToken?.id;
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({ user: userid });

        if (!wishlist) {
            return res.status(404).json({ message: "Wishlist not found." });
        }

        wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
        await wishlist.save();

        const updatedWishlist = await Wishlist.findById(wishlist._id).populate("products", "name price images");

        res.status(200).json({
            message: "Product removed from wishlist",
            wishlist: updatedWishlist
        });
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        res.status(500).json({
            message: "An error occurred while removing from wishlist",
            error: error.message
        });
    }
};
