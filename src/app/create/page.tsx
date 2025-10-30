import { Container, Typography, Button, Box } from "@mui/material";
import {auth, currentUser} from "@clerk/nextjs/server";
import { createNewOrderAction } from "./actions";

export default async function Page() {
  const user = await currentUser();
  const firstName = user?.firstName;

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
        Bok {firstName}!
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

      <form action={createNewOrderAction}>
        <Button
          type="submit"
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
