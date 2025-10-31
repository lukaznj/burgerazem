"use server";

import { auth } from "@clerk/nextjs/server";
import { Types } from "mongoose";
import dbConnect from "@/utils/dbConnect";
import Order from "@/models/Order";
import Item from "@/models/Item";

interface OrderWithDetails {
  _id: string;
  status: string;
  orderType: "drink" | "burger" | "dessert";
  itemName?: string;
  itemImage?: string;
  burgerIngredients?: Array<{
    name: string;
    category: string;
  }>;
  createdAt: string;
}

// Check if user has in-progress order of specific type
export async function hasInProgressOrderOfType(orderType: "drink" | "burger" | "dessert"): Promise<boolean> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return false;
    }

    await dbConnect();

    const order = await Order.findOne({
      clerkUserId: userId,
      status: "in-progress",
      orderType: orderType,
    });

    return !!order;
  } catch (error) {
    console.error("Error checking order type:", error);
    return false;
  }
}

// Get current user's recent orders with details (in-progress, completed, canceled from last 24h)
export async function getCurrentOrders(): Promise<
  | { success: true; data: OrderWithDetails[]; hasInProgressDrink: boolean; hasInProgressBurger: boolean }
  | { success: false; error: string }
> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    await dbConnect();

    // Get orders from last 24 hours or all in-progress orders
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const orders = await Order.find({
      clerkUserId: userId,
      $or: [
        { status: "in-progress" },
        { createdAt: { $gte: oneDayAgo } }
      ]
    })
    .sort({ createdAt: -1 })
    .lean() as any[];

    if (orders.length === 0) {
      return {
        success: true,
        data: [],
        hasInProgressDrink: false,
        hasInProgressBurger: false,
      };
    }

    const ordersWithDetails: OrderWithDetails[] = [];
    let hasInProgressDrink = false;
    let hasInProgressBurger = false;

    for (const order of orders) {
      if (order.orderType === "drink") {
        if (order.status === "in-progress") {
          hasInProgressDrink = true;
        }
        const drink = await Item.findById(order.itemId).lean() as any;
        ordersWithDetails.push({
          _id: order._id.toString(),
          status: order.status,
          orderType: "drink",
          itemName: drink?.name,
          itemImage: drink?.imagePath,
          createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
        });
      } else if (order.orderType === "burger") {
        if (order.status === "in-progress") {
          hasInProgressBurger = true;
        }
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
          orderType: "burger",
          burgerIngredients,
          createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
        });
      } else if (order.orderType === "dessert") {
        const dessert = await Item.findById(order.itemId).lean() as any;
        ordersWithDetails.push({
          _id: order._id.toString(),
          status: order.status,
          orderType: "dessert",
          itemName: dessert?.name,
          itemImage: dessert?.imagePath,
          createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
        });
      }
    }

    return {
      success: true,
      data: ordersWithDetails,
      hasInProgressDrink,
      hasInProgressBurger,
    };
  } catch (error) {
    console.error("Error fetching current orders:", error);
    return { success: false, error: "Failed to fetch current orders" };
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
    .limit(20)
    .lean() as any[];

    const ordersWithDetails: OrderWithDetails[] = [];

    for (const order of orders) {
      if (order.orderType === "drink") {
        const drink = await Item.findById(order.itemId).lean() as any;
        ordersWithDetails.push({
          _id: order._id.toString(),
          status: order.status,
          orderType: "drink",
          itemName: drink?.name,
          itemImage: drink?.imagePath,
          createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
        });
      } else if (order.orderType === "burger") {
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
          orderType: "burger",
          burgerIngredients,
          createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
        });
      } else if (order.orderType === "dessert") {
        const dessert = await Item.findById(order.itemId).lean() as any;
        ordersWithDetails.push({
          _id: order._id.toString(),
          status: order.status,
          orderType: "dessert",
          itemName: dessert?.name,
          itemImage: dessert?.imagePath,
          createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
        });
      }
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

// Complete all current in-progress orders
export async function completeCurrentOrders(): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    await dbConnect();

    const result = await Order.updateMany(
      {
        clerkUserId: userId,
        status: "in-progress",
      },
      {
        status: "completed",
      }
    );

    if (result.modifiedCount === 0) {
      return { success: false, error: "No active orders found" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error completing orders:", error);
    return { success: false, error: "Failed to complete orders" };
  }
}

