import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/\s+/g, "-");
    const filename = `items/${timestamp}-${originalName}`;

    // Use Vercel Blob Storage in production, local storage in development
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Production: Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: "public",
      });

      return NextResponse.json({
        success: true,
        data: { imagePath: blob.url },
      });
    } else {
      // Development: Save to local file system
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Define upload directory
      const uploadDir = path.join(process.cwd(), "public", "uploads", "items");

      // Ensure directory exists
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch {
        // Directory might already exist, that's fine
      }

      // Write file
      const localFilename = `${timestamp}-${originalName}`;
      const filepath = path.join(uploadDir, localFilename);
      await writeFile(filepath, buffer);

      // Return the public URL path
      const publicPath = `/uploads/items/${localFilename}`;

      return NextResponse.json({
        success: true,
        data: { imagePath: publicPath },
      });
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

