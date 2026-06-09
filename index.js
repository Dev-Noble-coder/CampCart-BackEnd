import express from "express";
import "dotenv";
import cors from "cors";
import DbConnect from "./lib/dbConnect";

const app = express();
app.use(express.json());



const PORT = process.env.PORT;

app.listen(PORT, async () => {
    await DbConnect();
    console.log(`Server is running on port ${PORT}`)
})