// src/models/Order.ts
import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    unique: true, // Only allow one 'in-progress' order per user (optional)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["in-progress", "completed", "canceled"],
    default: "in-progress",
  },
  // Other fields will go here later (burger config, drinks, etc.)
});

// Use existing model or create a new one
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
