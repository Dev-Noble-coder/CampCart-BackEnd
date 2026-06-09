import express from "express";
import "dotenv";
import cors from "cors";

const app = express();
app.use(express.json());