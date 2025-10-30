"use server";

import { Types } from "mongoose";
import dbConnect from "@/utils/dbConnect";
import Item from "@/models/Item";

interface DrinkItem {
  _id: string;
  name: string;
  description: string;
  quantity: number;
  imagePath: string;
  type: string;
  createdAt?: string;
  updatedAt?: string;
}

// Fetch all drinks
export async function getDrinks(): Promise<
  | { success: true; data: DrinkItem[] }
  | { success: false; error: string }
> {
  try {
    await dbConnect();
    // Only return drinks that are in stock
    const drinks = await Item.find({ type: "drinks", quantity: { $gt: 0 } }).sort({ name: 1 }).lean();

    // Convert MongoDB documents to plain objects with string IDs
    return {
      success: true,
      data: drinks.map(drink => ({
        _id: (drink._id as Types.ObjectId).toString(),
        name: drink.name as string,
        description: drink.description as string,
        quantity: drink.quantity as number,
        imagePath: drink.imagePath as string,
        type: drink.type as string,
        createdAt: drink.createdAt?.toISOString(),
        updatedAt: drink.updatedAt?.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching drinks:", error);
    return { success: false, error: "Failed to fetch drinks" };
  }
}

