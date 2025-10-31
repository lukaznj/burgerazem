"use server";

import { Types } from "mongoose";
import dbConnect from "@/utils/dbConnect";
import Item from "@/models/Item";

interface DesertItem {
  _id: string;
  name: string;
  description: string;
  imagePath: string;
  type: string;
  createdAt?: string;
  updatedAt?: string;
}

// Fetch all deserts
export async function getDeserts(): Promise<
  | { success: true; data: DesertItem[] }
  | { success: false; error: string }
> {
  try {
    await dbConnect();
    const deserts = await Item.find({ type: "deserts" }).sort({ name: 1 }).lean();

    // Convert MongoDB documents to plain objects with string IDs
    return {
      success: true,
      data: deserts.map(desert => ({
        _id: (desert._id as Types.ObjectId).toString(),
        name: desert.name as string,
        description: desert.description as string,
        imagePath: desert.imagePath as string,
        type: desert.type as string,
        createdAt: desert.createdAt?.toISOString(),
        updatedAt: desert.updatedAt?.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching deserts:", error);
    return { success: false, error: "Failed to fetch deserts" };
  }
}

