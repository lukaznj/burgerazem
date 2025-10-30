import type { Metadata } from "next";
import "./globals.css";
import { AppBar, Toolbar, Box, Button } from "@mui/material"; // <-- Ensure Button is imported
import BurgerazemLogo from "@/components/BurgerazemLogo";
import LunchDiningOutlinedIcon from "@mui/icons-material/LunchDiningOutlined";
import ThemeRegistry from "@/components/ThemeRegistry";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
} from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Burgeražem",
  description: "Sastavi vlastiti Burgeražem!",
};

const APP_BAR_HEIGHT = "56px";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // ClerkProvider with global configuration
    <ClerkProvider
      afterSignOutUrl="/"
      // Optional: Appearance to match your orange theme in modals/widgets
      appearance={{
        variables: {
          colorPrimary: "#ff8c00",
        },
        elements: {
          formButtonPrimary: {
            backgroundColor: "#ff8c00",
            "&:hover": {
              backgroundColor: "#e67300",
            },
          },
        },
      }}
    >
      <html lang="hr">
        <body>
          <ThemeRegistry>
            <AppBar position="fixed" sx={{ bgcolor: "#1a1a1a" }}>
              <Toolbar
                sx={{ minHeight: `${APP_BAR_HEIGHT} !important`, py: 1 }}
              >
                {/* Logo and Icon Section */}
                <Box
                  sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}
                >
                  <LunchDiningOutlinedIcon
                    sx={{ fontSize: 30, color: "primary.main", mr: 1 }}
                  />
                  <BurgerazemLogo fill="#ff8c00" width={150} height="auto" />
                </Box>

                {/* Authentication Section (Right) */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {" "}
                  {/* Reduced gap for UserButton */}
                  <SignedIn>
                    {/* Shows the user profile button */}
                    <UserButton showName />
                  </SignedIn>
                  <SignedOut>
                    {/* Use asChild to style the Clerk button with MUI */}
                    <SignInButton mode="modal">
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          bgcolor: "primary.main",
                          color: "#fff",
                          fontWeight: 600,
                          textTransform: "none", // Optional: Keep button text case-sensitive
                          "&:hover": {
                            bgcolor: "primary.dark",
                          },
                        }}
                      >
                        Prijavi se
                      </Button>
                    </SignInButton>
                  </SignedOut>
                </Box>
              </Toolbar>
            </AppBar>

            {/* Main Content Area */}
            <Box
              component="main"
              sx={{
                marginTop: APP_BAR_HEIGHT,
                minHeight: "100vh",
              }}
            >
              {children}
            </Box>
          </ThemeRegistry>
        </body>
      </html>
    </ClerkProvider>
  );
}
