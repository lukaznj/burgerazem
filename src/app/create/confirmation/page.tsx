"use client";

import { Box, Container, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function Page() {
  const router = useRouter();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          textAlign: "center",
        }}
      >
        <CheckCircleIcon
          sx={{
            fontSize: 120,
            color: "success.main",
            mb: 3,
          }}
        />

        <Typography variant="h3" component="h1" gutterBottom>
          Order Complete!
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Your order has been successfully placed. Enjoy your meal!
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={() => router.push("/")}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
}

