import mongoose, { Document, Schema } from "mongoose";

export type ItemType = "drinks" | "burgerParts" | "deserts";

export interface IItem extends Document {
  _id: string;
  name: string;
  description: string;
  amount: number;
  imagePath: string;
  type: ItemType;
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
    amount: {
      type: Number,
      required: true,
      min: 0,
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
  },
  {
    timestamps: true,
  }
);

// Add index for efficient querying by type
ItemSchema.index({ type: 1 });

const Item = mongoose.models.Item || mongoose.model<IItem>("Item", ItemSchema);

export default Item;

