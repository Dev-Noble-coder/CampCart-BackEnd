import express from "express";
import "dotenv/config";
import cors from "cors";
import DbConnect from "./lib/dbConnect.js";
import userRoutes from "./controller/user/index.js";
import vendorRoutes from "./controller/vendor/index.js";

import path from "path";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());
// Configure CORS to accept requests from frontend domains
app.use(cors({
     origin: [
        "https://split-pay-vert.vercel.app",
        "http://localhost:3000"
    ],
    credentials: true
}));

// Serve the index.html documentation file
app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "index.html"));
});

app.use("/api/v1", userRoutes);
app.use("/api/v1/vendor", vendorRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, async () => {
    await DbConnect();
    console.log(`Server is running on port ${PORT}`);
});