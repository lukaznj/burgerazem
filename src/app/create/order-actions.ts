"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/utils/dbConnect";
import Order from "@/models/Order";

// Save drink selection to order
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

    // Find or create in-progress order for this user
    let order = await Order.findOne({
      clerkUserId: userId,
      status: "in-progress",
    });

    if (!order) {
      order = await Order.create({
        clerkUserId: userId,
        status: "in-progress",
        drinkId,
      });
    } else {
      order.drinkId = drinkId;
      await order.save();
    }

    revalidatePath("/create/drinks");
    return { success: true };
  } catch (error) {
    console.error("Error saving drink selection:", error);
    return { success: false, error: "Failed to save drink selection" };
  }
}

// Save burger ingredients to order
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

    const order = await Order.findOne({
      clerkUserId: userId,
      status: "in-progress",
    });

    if (!order) {
      return { success: false, error: "No active order found" };
    }

    order.burgerIngredients = ingredientIds;
    await order.save();

    revalidatePath("/create/burger");
    return { success: true };
  } catch (error) {
    console.error("Error saving burger ingredients:", error);
    return { success: false, error: "Failed to save burger ingredients" };
  }
}

