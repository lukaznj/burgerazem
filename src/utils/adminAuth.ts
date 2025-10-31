import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/utils/dbConnect";
import Admin from "@/models/Admin";

export async function isAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return false;
    }

    await dbConnect();
    const admin = await Admin.findOne({ clerkUserId: userId });

    return !!admin;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

export async function requireAdmin() {
  const adminStatus = await isAdmin();

  if (!adminStatus) {
    throw new Error("Unauthorized: Admin access required");
  }

  return adminStatus;
}

