import type { Metadata } from "next";
import "./globals.css";
import { AppBar, Toolbar, Box } from "@mui/material";
import BurgerazemLogo from "@/components/BurgerazemLogo";
import LunchDiningIcon from "@mui/icons-material/LunchDining";
import ThemeRegistry from "@/components/ThemeRegistry";
import Link from "next/link";
import {
  ClerkProvider,
  SignedIn,
  UserButton,
} from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Burgeražem",
  description: "Sastavi vlastiti Burgeražem!",
  icons: {
    icon: '/favicon.svg',
  },
};

const APP_BAR_HEIGHT = "56px";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <ClerkProvider
      afterSignOutUrl="/"
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
                <Link href="/order" style={{ textDecoration: "none", display: "flex", alignItems: "center", flexGrow: 1 }}>
                  <Box
                    sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                  >
                    <LunchDiningIcon
                      sx={{ fontSize: 30, color: "primary.main", mr: 1 }}
                    />
                    <BurgerazemLogo fill="#ff8c00" width={150} height="auto" />
                  </Box>
                </Link>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <SignedIn>
                    <UserButton showName />
                  </SignedIn>
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
