"use server";
import {auth, currentUser} from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import dbConnect from "@/utils/dbConnect";
import Order from "@/models/Order";

/**
 * Creates a new, initial order entry in MongoDB for the authenticated user
 * and redirects to the next step (/create/drinks).
 */
export async function createNewOrderAction(formData: FormData) {
  const {userId} = await auth();

  try {
    await dbConnect();

    const existingOrder = await Order.findOne({
      clerkUserId: userId,
      status: "in-progress",
    });

    if (existingOrder) {
      console.log(`Existing order found for user ${userId}. Continuing...`);
      redirect("/create/drinks");
      return;
    }

    const newOrder = await Order.create({
      clerkUserId: userId,
      status: "in-progress",
    });

    console.log(`New order created: ${newOrder._id} for user ${userId}`);
  } catch (error) {
    console.error("Database or Server Action error:", error);
    throw new Error("Failed to start new order due to a server error.");
  }

  redirect("/create/drinks");
}
