import express from "express";
import "dotenv/config";
import cors from "cors";
import DbConnect from "./lib/dbConnect.js";
import userRoutes from "./controller/user/index.js";
import vendorRoutes from "./controller/vendor/index.js";
import agentRoutes from "./controller/Agent/index.js";
import adminRoutes from "./controller/admin/index.js";
import productRoutes from "./controller/product/index.js";
import reviewRoutes from "./controller/review/index.js";
import path from "path";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import User from "./models/users.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [
            "https://camp-cart-front-end.vercel.app",
            "http://localhost:3000"
        ],
        credentials: true
    }
});

// Attach io to the req object so routes can use it
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Socket connection logic
io.on("connection", (socket) => {
    console.log("A user connected to socket:", socket.id);

    // Agent joins online pool
    socket.on("join_online_agents", async (data) => {
        // Here we can use data.agentId or extract it from a token
        socket.join("online_agents");
        console.log(`Socket ${socket.id} joined online_agents room.`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected from socket:", socket.id);
        // Note: For full resilience, we would map socket.id to agentId and set them offline here
    });
});

app.use(express.json());
app.use(cookieParser());
// Configure CORS to accept requests from frontend domains
app.use(cors({
     origin: [
        "https://camp-cart-front-end.vercel.app",
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
app.use("/api/v1/agent", agentRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1/reviews", reviewRoutes);

const PORT = process.env.PORT || 5001;

server.listen(PORT, async () => {
    await DbConnect();
    console.log(`Server is running on port ${PORT}`);
});