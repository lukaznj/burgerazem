"use server";

import { Types } from "mongoose";
import dbConnect from "@/utils/dbConnect";
import Item from "@/models/Item";

interface BurgerIngredient {
  _id: string;
  name: string;
  description: string;
  imagePath: string;
  category: string;
}

// Fetch all burger ingredients grouped by category
export async function getBurgerIngredients(): Promise<
  | { success: true; data: Record<string, BurgerIngredient[]> }
  | { success: false; error: string }
> {
  try {
    await dbConnect();

    // Fetch all burger parts
    const ingredients = await Item.find({ type: "burgerParts" })
      .sort({ category: 1, name: 1 })
      .lean();

    // Group by category
    const grouped: Record<string, BurgerIngredient[]> = {};

    for (const ingredient of ingredients) {
      const category = (ingredient.category as string) || "Other";

      if (!grouped[category]) {
        grouped[category] = [];
      }

      grouped[category].push({
        _id: (ingredient._id as Types.ObjectId).toString(),
        name: ingredient.name as string,
        description: ingredient.description as string,
        imagePath: ingredient.imagePath as string,
        category,
      });
    }

    return { success: true, data: grouped };
  } catch (error) {
    console.error("Error fetching burger ingredients:", error);
    return { success: false, error: "Failed to fetch burger ingredients" };
  }
}

