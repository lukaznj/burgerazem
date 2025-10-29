// src/app/create/page.tsx

import { Container, Typography, Button, Box } from "@mui/material";
import { auth } from "@clerk/nextjs/server"; // Import auth for server-side protection
import { redirect } from "next/navigation";
import { createNewOrderAction } from "./actions"; // <-- New Server Action

export default async function CreatePage() {
  // 1. PROTECT THE ROUTE:
  // Get the authenticated user ID. If not logged in, Clerk redirects automatically.
  const { userId } = auth();

  // 2. Fallback check (shouldn't be strictly necessary if middleware/auth() works)
  if (!userId) {
    // If auth() somehow passes or is misconfigured, redirect manually.
    redirect("/");
  }

  // The content is only rendered if the user is authenticated.

  return (
    <Container
      sx={{
        bgcolor: "#FFFDF2",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "start",
        gap: 5,
        px: 2,
        pt: 11,
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          mb: 1,
        }}
      >
        Dobrodošao/la!
      </Typography>

      <Typography
        variant="h6"
        sx={{
          textAlign: "center",
          color: "text.secondary",
          maxWidth: "400px",
        }}
      >
        Spremni za novi Burgeražem? Klikni ispod za početak.
      </Typography>

      {/* 
        3. Form wrapper for the Server Action 
        We use a form with the action prop to trigger the DB logic. 
      */}
      <form action={createNewOrderAction}>
        <Button
          type="submit" // Crucial: This button submits the form and triggers the action
          variant="contained"
          size="large"
          sx={{
            my: 5,
            fontSize: 20,
            fontWeight: 500,
          }}
        >
          Započni narudžbu
        </Button>
      </form>
    </Container>
  );
}
