import mongoose, { Document, Schema } from "mongoose";

export type ItemType = "drinks" | "burgerParts" | "deserts";

export interface IItem extends Document {
  _id: string;
  name: string;
  description: string;
  quantity: number;
  imagePath: string;
  type: ItemType;
  category?: string; // For burger ingredients: "sauces", "cheeses", "meats", "vegetables", etc.
}

const ItemSchema = new Schema<IItem>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
    imagePath: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["drinks", "burgerParts", "deserts"],
      required: true,
    },
    category: {
      type: String,
      required: false,
      // For burgerParts: "sauces", "cheeses", "meats", "vegetables", "toppings", etc.
    },
  },
  {
    timestamps: true,
  }
);

// Add index for efficient querying by type
ItemSchema.index({ type: 1 });

const Item = mongoose.models.Item || mongoose.model<IItem>("Item", ItemSchema);

export default Item;

