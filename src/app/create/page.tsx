import { Box, Container, Typography, Button, TextField } from "@mui/material";

export default function Page() {
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
        Unesi svoje ime
      </Typography>
      <TextField required id="outlined-required" label="Ime" />
      <Button
        variant="contained"
        size="large"
        sx={{
          // px: 5,
          // py: 5,
          my: 5,
          fontSize: 20,
          fontWeight: 500,
        }}
      >
        Započni narudžbu
      </Button>
    </Container>
  );
}
