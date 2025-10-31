"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import dbConnect from "@/utils/dbConnect";
import Category from "@/models/Category";

interface CategoryData {
  _id: string;
  name: string;
  type: string;
}

// Fetch all categories
export async function getCategories(): Promise<
  | { success: true; data: CategoryData[] }
  | { success: false; error: string }
> {
  try {
    await dbConnect();
    const categories = await Category.find({ type: "burgerParts" })
      .sort({ name: 1 })
      .lean();

    return {
      success: true,
      data: categories.map(cat => ({
        _id: (cat._id as Types.ObjectId).toString(),
        name: cat.name as string,
        type: cat.type as string,
      })),
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

// Create new category
export async function createCategory(name: string): Promise<
  | { success: true; data: CategoryData }
  | { success: false; error: string }
> {
  try {
    await dbConnect();

    if (!name || name.trim() === "") {
      return { success: false, error: "Category name is required" };
    }

    const category = await Category.create({
      name: name.trim(),
      type: "burgerParts",
    });

    revalidatePath("/admin/manage");

    return {
      success: true,
      data: {
        _id: category._id.toString(),
        name: category.name,
        type: category.type,
      },
    };
  } catch (error) {
    console.error("Error creating category:", error);
    if ((error as any)?.code === 11000) {
      return { success: false, error: "Category already exists" };
    }
    return { success: false, error: "Failed to create category" };
  }
}

// Delete category
export async function deleteCategory(id: string): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  try {
    await dbConnect();

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    revalidatePath("/admin/manage");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}

