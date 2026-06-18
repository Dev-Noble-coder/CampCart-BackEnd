import express from "express";
import Review from "../../models/review.js";
import Product from "../../models/product.js";
import authorization, { checkRole } from "../../middleware/middleware.js";

const router = express.Router();

// Public route to get reviews for a product
export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await Review.find({ product: productId })
            .populate("user", "fullName")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Reviews fetched successfully",
            reviews
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({
            message: "An error occurred while fetching reviews",
            error: error.message
        });
    }
};

// Protected route to create a review
export const createReview = async (req, res) => {
    try {
        const userid = req.user?._id || req.accessToken?.userID || req.accessToken?.id;
        const { productId } = req.params;
        const { rating, comment } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({ message: "Rating and comment are required." });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({ product: productId, user: userid });
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this product." });
        }

        const newReview = new Review({
            product: productId,
            user: userid,
            rating,
            comment
        });

        await newReview.save();

        res.status(201).json({
            message: "Review submitted successfully",
            review: newReview
        });
    } catch (error) {
        console.error("Error submitting review:", error);
        res.status(500).json({
            message: "An error occurred while submitting the review",
            error: error.message
        });
    }
};

// Protected route to update a review
export const updateReview = async (req, res) => {
    try {
        const userid = req.user?._id || req.accessToken?.userID || req.accessToken?.id;
        const { id } = req.params;
        const { rating, comment } = req.body;

        const review = await Review.findOneAndUpdate(
            { _id: id, user: userid },
            { $set: { rating, comment } },
            { new: true, runValidators: true }
        );

        if (!review) {
            return res.status(404).json({ message: "Review not found or you don't have permission to edit it." });
        }

        res.status(200).json({
            message: "Review updated successfully",
            review
        });
    } catch (error) {
        console.error("Error updating review:", error);
        res.status(500).json({
            message: "An error occurred while updating the review",
            error: error.message
        });
    }
};

// Protected route to delete a review
export const deleteReview = async (req, res) => {
    try {
        const userid = req.user?._id || req.accessToken?.userID || req.accessToken?.id;
        const { id } = req.params;

        const review = await Review.findOneAndDelete({ _id: id, user: userid });

        if (!review) {
            return res.status(404).json({ message: "Review not found or you don't have permission to delete it." });
        }

        res.status(200).json({
            message: "Review deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({
            message: "An error occurred while deleting the review",
            error: error.message
        });
    }
};

// Public
router.get("/products/:productId", getProductReviews);

// Protected (only authenticated users can review)
router.post("/products/:productId", authorization, createReview);
router.put("/:id", authorization, updateReview);
router.delete("/:id", authorization, deleteReview);

export default router;
