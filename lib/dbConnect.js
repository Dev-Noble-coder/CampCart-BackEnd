import mongoose from "mongoose";

async function DbConnect() {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log("Database connected successfully!");
    } catch (error) {
        console.log("DB error", error);
        process.exit(1);
    }
}
export default DbConnect;