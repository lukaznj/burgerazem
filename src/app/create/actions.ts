// src/app/create/actions.ts

"use server"; // <-- CRUCIAL: Must be at the very top
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import dbConnect from "@/utils/dbConnect"; // <-- Assuming utils/dbConnect.ts path
import Order from "@/models/Order"; // <-- Your new Mongoose model

/**
 * Creates a new, initial order entry in MongoDB for the authenticated user
 * and redirects to the next step (/create/drinks).
 */
export async function createNewOrderAction(formData: FormData) {
  // 1. Get User ID from Clerk (Server-Side)
  const { userId } = auth();

  try {
    // 2. Connect to the cached MongoDB instance
    await dbConnect();

    // 3. Check if the user already has an 'in-progress' order
    // This is a safety check to prevent creating multiple orders
    const existingOrder = await Order.findOne({
      clerkUserId: userId,
      status: "in-progress",
    });

    if (existingOrder) {
      // If an order exists, we just move on to the next step
      console.log(`Existing order found for user ${userId}. Continuing...`);
      redirect("/create/drinks");
      return;
    }

    // 4. Create the new order in MongoDB
    const newOrder = await Order.create({
      clerkUserId: userId,
      status: "in-progress",
    });

    console.log(`New order created: ${newOrder._id} for user ${userId}`);
  } catch (error) {
    console.error("Database or Server Action error:", error);
    // You might want to redirect to an error page instead
    throw new Error("Failed to start new order due to a server error.");
  }

  // 5. Redirect to the next route on success
  redirect("/create/drinks");
}
