import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["in-progress", "completed", "canceled"],
      default: "in-progress",
    },
    orderType: {
      type: String,
      enum: ["drink", "burger", "dessert"],
      required: true,
    },
    // For drink and dessert orders (single item)
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: false,
    },
    // For burger orders (multiple ingredients)
    burgerIngredients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for finding orders by user and status
OrderSchema.index({ clerkUserId: 1, status: 1 });
OrderSchema.index({ orderType: 1, status: 1 });

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
