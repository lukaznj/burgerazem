"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import dbConnect from "@/utils/dbConnect";
import Item, { ItemType } from "@/models/Item";

interface ItemData {
  _id: string;
  name: string;
  description: string;
  quantity: number;
  imagePath: string;
  type: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Fetch items by type
export async function getItemsByType(type: ItemType): Promise<
  | { success: true; data: ItemData[] }
  | { success: false; error: string }
> {
  try {
    await dbConnect();
    const items = await Item.find({ type }).sort({ createdAt: -1 }).lean();
    
    // Convert MongoDB documents to plain objects with string IDs
    return {
      success: true,
      data: items.map(item => ({
        _id: (item._id as Types.ObjectId).toString(),
        name: item.name as string,
        description: item.description as string,
        quantity: item.quantity as number,
        imagePath: item.imagePath as string,
        type: item.type as string,
        category: item.category as string | undefined,
        createdAt: item.createdAt?.toISOString(),
        updatedAt: item.updatedAt?.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching items:", error);
    return { success: false, error: "Failed to fetch items" };
  }
}

// Create new item
export async function createItem(data: {
  name: string;
  description: string;
  quantity: number;
  imagePath: string;
  type: ItemType;
  category?: string;
}) {
  try {
    await dbConnect();

    // Validate required fields
    if (!data.name || !data.description || data.quantity === undefined || !data.imagePath || !data.type) {
      return { success: false, error: "Missing required fields" };
    }

    // Validate type
    if (!["drinks", "burgerParts", "deserts"].includes(data.type)) {
      return { success: false, error: "Invalid item type" };
    }

    // For burger parts, set quantity to 0 since we don't track stock
    const itemData = {
      ...data,
      quantity: data.type === "burgerParts" ? 0 : data.quantity,
    };

    const item = await Item.create(itemData);

    // Revalidate the manage page to show new data
    revalidatePath("/admin/manage");

    return {
      success: true,
      data: {
        ...item.toObject(),
        _id: item._id.toString(),
      },
    };
  } catch (error) {
    console.error("Error creating item:", error);
    return { success: false, error: "Failed to create item" };
  }
}

// Update item
export async function updateItem(
  id: string,
  data: {
    name?: string;
    description?: string;
    quantity?: number;
    category?: string;
  }
) {
  try {
    await dbConnect();

    // Only allow updating these fields
    const updateData: Partial<{ name: string; description: string; quantity: number; category: string }> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.category !== undefined) updateData.category = data.category;

    const item = await Item.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    // Revalidate the manage page to show updated data
    revalidatePath("/admin/manage");

    return {
      success: true,
      data: {
        ...item.toObject(),
        _id: item._id.toString(),
      },
    };
  } catch (error) {
    console.error("Error updating item:", error);
    return { success: false, error: "Failed to update item" };
  }
}

// Delete item
export async function deleteItem(id: string) {
  try {
    await dbConnect();

    const item = await Item.findByIdAndDelete(id);

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    // Revalidate the manage page to show updated data
    revalidatePath("/admin/manage");

    return {
      success: true,
      data: {
        ...item.toObject(),
        _id: item._id.toString(),
      },
    };
  } catch (error) {
    console.error("Error deleting item:", error);
    return { success: false, error: "Failed to delete item" };
  }
}

