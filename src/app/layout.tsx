import type { Metadata } from "next";
import "./globals.css";
import { AppBar, Toolbar, Box } from "@mui/material";
import BurgerazemLogo from "@/components/BurgerazemLogo";
import LunchDiningOutlinedIcon from "@mui/icons-material/LunchDiningOutlined";
import ThemeRegistry from "@/components/ThemeRegistry";
// Import ClerkProvider
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
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
    // 1. ADD afterSignOutUrl HERE (and optionally other global URLs)
    <ClerkProvider
      afterSignOutUrl="/"
      // You might also add:
      // afterSignInUrl="/dashboard"
      // afterSignUpUrl="/onboarding"
    >
      <html lang="hr">
        <body>
          <ThemeRegistry>
            <AppBar position="fixed" sx={{ bgcolor: "#1a1a1a" }}>
              <Toolbar
                sx={{ minHeight: `${APP_BAR_HEIGHT} !important`, py: 1 }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}
                >
                  <LunchDiningOutlinedIcon
                    sx={{ fontSize: 30, color: "primary.main", mr: 1 }}
                  />
                  <BurgerazemLogo fill="#ff8c00" width={150} height="auto" />
                </Box>

                {/* --- CLERK BUTTON --- */}
                <SignedIn>
                  {/* 2. REMOVE afterSignOutUrl from here */}
                  <UserButton />
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal" />
                </SignedOut>
                {/* --------------------- */}
              </Toolbar>
            </AppBar>
            {/* ... main content Box ... */}
          </ThemeRegistry>
        </body>
      </html>
    </ClerkProvider>
  );
}
