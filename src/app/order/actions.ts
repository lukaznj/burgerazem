"use server";
import {auth, currentUser} from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import dbConnect from "@/utils/dbConnect";
import Order from "@/models/Order";

/**
 * Starts the ordering process by redirecting to drinks selection.
 * Orders are created when items are actually selected.
 */
export async function createNewOrderAction(formData: FormData) {
  const {userId} = await auth();

  if (!userId) {
    throw new Error("Not authenticated");
  }

  try {
    await dbConnect();
    console.log(`Starting order process for user ${userId}`);
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Failed to start new order due to a server error.");
  }

  redirect("/order/drinks");
}
