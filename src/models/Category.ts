import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  _id: string;
  name: string;
  type: "burgerParts"; // Only for burger parts for now, can expand later
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["burgerParts"],
      default: "burgerParts",
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);

export default Category;

