import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Item, { ItemType } from "@/models/Item";

// GET all items or items by type
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") as ItemType | null;

    const query = type ? { type } : {};
    const items = await Item.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

// POST create new item
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, description, amount, imagePath, type } = body;

    // Validate required fields
    if (!name || !description || amount === undefined || !imagePath || !type) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate type
    if (!["drinks", "burgerParts", "deserts"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid item type" },
        { status: 400 }
      );
    }

    const item = await Item.create({
      name,
      description,
      amount,
      imagePath,
      type,
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create item" },
      { status: 500 }
    );
  }
}

