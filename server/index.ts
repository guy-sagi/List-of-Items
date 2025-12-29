import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import itemsRoutes from "./routes/items.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ ok: true });
});

app.use("/items", itemsRoutes);

app.listen(PORT, () => {
    console.log(`API running on https://localhost:${PORT}`);
})