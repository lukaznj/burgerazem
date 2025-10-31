"use server";

import { auth } from "@clerk/nextjs/server";
import { Types } from "mongoose";
import dbConnect from "@/utils/dbConnect";
import Order from "@/models/Order";
import Item from "@/models/Item";

interface OrderWithDetails {
  _id: string;
  status: string;
  drinkName?: string;
  drinkImage?: string;
  burgerIngredients: Array<{
    name: string;
    category: string;
  }>;
  createdAt: string;
}

// Get current user's in-progress order with details
export async function getCurrentOrder(): Promise<
  | { success: true; data: OrderWithDetails | null; hasInProgressDrink: boolean; hasInProgressBurger: boolean }
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
    }).lean() as any;

    if (!order) {
      return {
        success: true,
        data: null,
        hasInProgressDrink: false,
        hasInProgressBurger: false,
      };
    }

    // Fetch drink details if exists
    let drinkName: string | undefined;
    let drinkImage: string | undefined;
    if (order.drinkId) {
      const drink = await Item.findById(order.drinkId).lean() as any;
      if (drink) {
        drinkName = drink.name;
        drinkImage = drink.imagePath;
      }
    }

    // Fetch burger ingredient details
    const burgerIngredients: Array<{ name: string; category: string }> = [];
    if (order.burgerIngredients && order.burgerIngredients.length > 0) {
      const ingredients = await Item.find({
        _id: { $in: order.burgerIngredients }
      }).lean() as any[];

      for (const ing of ingredients) {
        burgerIngredients.push({
          name: ing.name,
          category: ing.category || "Other",
        });
      }
    }

    return {
      success: true,
      data: {
        _id: order._id.toString(),
        status: order.status,
        drinkName,
        drinkImage,
        burgerIngredients,
        createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
      },
      hasInProgressDrink: !!order.drinkId,
      hasInProgressBurger: order.burgerIngredients && order.burgerIngredients.length > 0,
    };
  } catch (error) {
    console.error("Error fetching current order:", error);
    return { success: false, error: "Failed to fetch current order" };
  }
}

// Get all completed orders for the user
export async function getCompletedOrders(): Promise<
  | { success: true; data: OrderWithDetails[] }
  | { success: false; error: string }
> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    await dbConnect();

    const orders = await Order.find({
      clerkUserId: userId,
      status: "completed",
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean() as any[];

    const ordersWithDetails: OrderWithDetails[] = [];

    for (const order of orders) {
      // Fetch drink details if exists
      let drinkName: string | undefined;
      let drinkImage: string | undefined;
      if (order.drinkId) {
        const drink = await Item.findById(order.drinkId).lean() as any;
        if (drink) {
          drinkName = drink.name;
          drinkImage = drink.imagePath;
        }
      }

      // Fetch burger ingredient details
      const burgerIngredients: Array<{ name: string; category: string }> = [];
      if (order.burgerIngredients && order.burgerIngredients.length > 0) {
        const ingredients = await Item.find({
          _id: { $in: order.burgerIngredients }
        }).lean() as any[];

        for (const ing of ingredients) {
          burgerIngredients.push({
            name: ing.name,
            category: ing.category || "Other",
          });
        }
      }

      ordersWithDetails.push({
        _id: order._id.toString(),
        status: order.status,
        drinkName,
        drinkImage,
        burgerIngredients,
        createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
      });
    }

    return {
      success: true,
      data: ordersWithDetails,
    };
  } catch (error) {
    console.error("Error fetching completed orders:", error);
    return { success: false, error: "Failed to fetch completed orders" };
  }
}

// Complete the current order
export async function completeCurrentOrder(): Promise<
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

    order.status = "completed";
    await order.save();

    return { success: true };
  } catch (error) {
    console.error("Error completing order:", error);
    return { success: false, error: "Failed to complete order" };
  }
}

