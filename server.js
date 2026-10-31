require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Grocery = require("./models/Grocery");

const app = express();
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

function validId(id) {
  return mongoose.isValidObjectId(id);
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

app.get("/api/groceries", async (req, res) => {
  try {
    const items = await Grocery.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch grocery items." });
  }
});

app.post("/api/groceries", async (req, res) => {
  try {
    const { name, quantity, category = "Other", price = 0 } = req.body;

    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ message: "Name must be between 2 and 100 characters." });
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be a positive whole number." });
    }
    if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
      return res.status(400).json({ message: "Price must be a non-negative number." });
    }
    if (typeof category !== "string" || category.trim().length > 50) {
      return res.status(400).json({ message: "Category must be a string of up to 50 characters." });
    }

    const item = await Grocery.create({
      name: name.trim(),
      quantity,
      category: category.trim() || "Other",
      price
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: "Could not add grocery item." });
  }
});

app.put("/api/groceries/:id", async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ message: "Invalid grocery item ID." });
  }

  const allowed = ["name", "quantity", "category", "price", "purchased"];
  const updates = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "Provide at least one field to update." });
  }
  if (updates.name !== undefined &&
      (typeof updates.name !== "string" || updates.name.trim().length < 2 || updates.name.trim().length > 100)) {
    return res.status(400).json({ message: "Name must be between 2 and 100 characters." });
  }
  if (updates.quantity !== undefined && (!Number.isInteger(updates.quantity) || updates.quantity < 1)) {
    return res.status(400).json({ message: "Quantity must be a positive whole number." });
  }
  if (updates.price !== undefined && (typeof updates.price !== "number" || !Number.isFinite(updates.price) || updates.price < 0)) {
    return res.status(400).json({ message: "Price must be a non-negative number." });
  }
  if (updates.category !== undefined && (typeof updates.category !== "string" || updates.category.trim().length > 50)) {
    return res.status(400).json({ message: "Category must be a string of up to 50 characters." });
  }
  if (updates.purchased !== undefined && typeof updates.purchased !== "boolean") {
    return res.status(400).json({ message: "Purchased must be true or false." });
  }
  if (updates.name !== undefined) updates.name = updates.name.trim();
  if (updates.category !== undefined) updates.category = updates.category.trim() || "Other";

  try {
    const item = await Grocery.findByIdAndUpdate(
      req.params.id, { $set: updates }, { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: "Grocery item not found." });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: "Could not update grocery item." });
  }
});

app.delete("/api/groceries/:id", async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ message: "Invalid grocery item ID." });
  }
  try {
    const item = await Grocery.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Grocery item not found." });
    res.json({ message: "Grocery item deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Could not delete grocery item." });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

async function startServer() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI. Copy .env.example to .env and configure it.");
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected.");
    const port = Number(process.env.PORT) || 5000;
    app.listen(port, () => console.log(`Grocery List Manager running at http://localhost:${port}`));
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
