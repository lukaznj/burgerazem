import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    unique: true,
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
});

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
