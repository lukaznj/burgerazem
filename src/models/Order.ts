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
    drinkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: false,
    },
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

// Index for finding in-progress orders by user
OrderSchema.index({ clerkUserId: 1, status: 1 });

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
