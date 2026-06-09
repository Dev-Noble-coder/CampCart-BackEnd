import express from "express";
import "dotenv/config";
import cors from "cors";
import DbConnect from "./lib/dbConnect.js";
import userRoutes from "./controller/user/index.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/v1", userRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, async () => {
    await DbConnect();
    console.log(`Server is running on port ${PORT}`);
});