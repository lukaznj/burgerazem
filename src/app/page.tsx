import { Button, Typography, Box } from "@mui/material";
import BurgerazemLogo from "@/components/BurgerazemLogo";
import LunchDiningOutlinedIcon from "@mui/icons-material/LunchDiningOutlined";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  // Redirect logged-in users to /order
  if (userId) {
    redirect("/order");
  }

  return (
    <Box
      sx={{
        bgcolor: "#FFFDF2",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "start",
        gap: 4,
        px: 2,
        pt: 11,
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            mb: 1,
          }}
        >
          Dobrodošli u
        </Typography>
        <BurgerazemLogo fill="#ff8c00" />
      </Box>
      <LunchDiningOutlinedIcon
        sx={{
          fontSize: 200,
          color: "primary.main",
          mt: 2,
          mb: 4,
        }}
      />
      <Link href="/order" passHref style={{ textDecoration: "none" }}>
        <Button
          variant="contained"
          size="large"
          sx={{
            px: 5,
            py: 5,
            fontSize: 30,
            fontWeight: 600,
          }}
        >
          Započni narudžbu
        </Button>
      </Link>
    </Box>
  );
}
