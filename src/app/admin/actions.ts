"use server";

import { requireAdmin } from "@/utils/adminAuth";
import dbConnect from "@/utils/dbConnect";
import Order from "@/models/Order";
import Settings from "@/models/Settings";
import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";

export async function getAllOrders() {
  try {
    await requireAdmin();
    await dbConnect();

    const orders = await Order.find({})
      .populate("itemId")
      .populate("burgerIngredients")
      .sort({ createdAt: -1 })
      .lean();

    // Fetch user names from Clerk
    const ordersWithUserNames = await Promise.all(
      orders.map(async (order) => {
        try {
          const client = await clerkClient();
          const user = await client.users.getUser(order.clerkUserId);
          const userName = user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.emailAddresses[0]?.emailAddress || order.clerkUserId;

          return {
            ...order,
            userName,
          };
        } catch (error) {
          console.error(`Error fetching user ${order.clerkUserId}:`, error);
          return {
            ...order,
            userName: order.clerkUserId,
          };
        }
      })
    );

    return {
      success: true,
      data: JSON.parse(JSON.stringify(ordersWithUserNames)),
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch orders",
    };
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    await requireAdmin();
    await dbConnect();

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    revalidatePath("/admin");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(order)),
    };
  } catch (error) {
    console.error("Error updating order status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update order status",
    };
  }
}

export async function deleteOrder(orderId: string) {
  try {
    await requireAdmin();
    await dbConnect();

    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    revalidatePath("/admin");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete order",
    };
  }
}

export async function getSettings() {
  try {
    await requireAdmin();
    await dbConnect();

    const desertsEnabled = await Settings.findOne({ key: "desertsEnabled" });

    return {
      success: true,
      data: {
        desertsEnabled: desertsEnabled?.value ?? true,
      },
    };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch settings",
    };
  }
}

export async function updateDesertsEnabled(enabled: boolean) {
  try {
    await requireAdmin();
    await dbConnect();

    await Settings.findOneAndUpdate(
      { key: "desertsEnabled" },
      { key: "desertsEnabled", value: enabled },
      { upsert: true, new: true }
    );

    revalidatePath("/admin");
    revalidatePath("/order");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating deserts setting:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update deserts setting",
    };
  }
}

