"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/utils/dbConnect";
import Order from "@/models/Order";

// Save drink selection to order (creates a separate drink order)
export async function saveDrinkSelection(drinkId: string): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    await dbConnect();

    // Create a new drink order
    await Order.create({
      clerkUserId: userId,
      status: "in-progress",
      orderType: "drink",
      itemId: drinkId,
    });

    revalidatePath("/order/drink");
    return { success: true };
  } catch (error) {
    console.error("Error saving drink selection:", error);
    return { success: false, error: "Failed to save drink selection" };
  }
}

// Save burger ingredients to order (creates a separate burger order)
export async function saveBurgerIngredients(ingredientIds: string[]): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    await dbConnect();

    // Create a new burger order
    await Order.create({
      clerkUserId: userId,
      status: "in-progress",
      orderType: "burger",
      burgerIngredients: ingredientIds,
    });

    revalidatePath("/order/burger");
    return { success: true };
  } catch (error) {
    console.error("Error saving burger ingredients:", error);
    return { success: false, error: "Failed to save burger ingredients" };
  }
}

// Save desert selection to order (creates a separate desert order)
export async function saveDesertSelection(desertId: string): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    await dbConnect();

    // Create a new desert order
    await Order.create({
      clerkUserId: userId,
      status: "in-progress",
      orderType: "dessert",
      itemId: desertId,
    });

    revalidatePath("/order/desert");
    return { success: true };
  } catch (error) {
    console.error("Error saving desert selection:", error);
    return { success: false, error: "Failed to save desert selection" };
  }
}
