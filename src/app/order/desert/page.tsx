"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getDeserts } from "./actions";
import { saveDesertSelection } from "../order-actions";
import { hasInProgressOrderOfType, getDesertAvailability } from "../order-status-actions";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  CircularProgress,
  Container,
  Button,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface Desert {
  _id: string;
  name: string;
  description: string;
  imagePath: string;
}

export default function Page() {
  const router = useRouter();
  const [deserts, setDeserts] = useState<Desert[]>([]);
  const [selectedDesert, setSelectedDesert] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isInitialMount = useRef(true);

  // Check if deserts are available and if user already has a desert order
  useEffect(() => {
    const checkAvailability = async () => {
      const [isAvailable, hasDesertOrder] = await Promise.all([
        getDesertAvailability(),
        hasInProgressOrderOfType("dessert"),
      ]);

      if (!isAvailable || hasDesertOrder) {
        router.replace("/order");
      }
    };
    checkAvailability();
  }, [router]);

  useEffect(() => {
    const fetchDeserts = async () => {
      try {
        // Only show loading on initial mount
        if (isInitialMount.current) {
          setLoading(true);
        }

        const result = await getDeserts();
        if (result.success && result.data) {
          // Only update state if data actually changed
          setDeserts(prevDeserts => {
            // Compare if deserts list is different
            if (JSON.stringify(prevDeserts) !== JSON.stringify(result.data)) {
              return result.data;
            }
            return prevDeserts;
          });

          // Check if selected desert is still available
          if (selectedDesert) {
            const stillAvailable = result.data.some(desert => desert._id === selectedDesert);
            if (!stillAvailable) {
              setSelectedDesert(null);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching deserts:", error);
      } finally {
        if (isInitialMount.current) {
          setLoading(false);
          isInitialMount.current = false;
        }
      }
    };

    // Initial fetch
    fetchDeserts();

    // Poll for updates every 3 seconds
    const pollInterval = setInterval(fetchDeserts, 3000);

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  }, [selectedDesert]);

  const handleDesertSelect = useCallback((desertId: string) => {
    setSelectedDesert(desertId);
  }, []);

  const handleContinue = useCallback(async () => {
    if (selectedDesert && !saving) {
      setSaving(true);
      try {
        const result = await saveDesertSelection(selectedDesert);
        if (result.success) {
          router.push("/order/confirmation");
        } else {
          alert("Failed to save desert selection: " + result.error);
          setSaving(false);
        }
      } catch (error) {
        console.error("Error saving desert:", error);
        alert("Failed to save desert selection");
        setSaving(false);
      }
    }
  }, [selectedDesert, saving, router]);

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        pb: selectedDesert ? { xs: 12, md: 4 } : 4, // Extra padding on mobile when button is visible
      }}
    >
      <Typography variant="h3" component="h1" gutterBottom>
        Odaberite svoj desert
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Odaberite jedan desert kako biste zaokružili svoj obrok
      </Typography>

      {deserts.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
              Trenutno nema dostupnih deserta
          </Typography>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            {deserts.map((desert) => {
              const isSelected = selectedDesert === desert._id;
              const isOtherSelected = selectedDesert !== null && !isSelected;

              return (
                <DesertCard
                  key={desert._id}
                  desert={desert}
                  isSelected={isSelected}
                  isOtherSelected={isOtherSelected}
                  onSelect={handleDesertSelect}
                />
              );
            })}
          </Box>

          {selectedDesert && (
            <>
              {/* Mobile: Fixed bottom bar */}
              <Box
                sx={{
                  display: { xs: "block", md: "none" },
                  position: "fixed",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleContinue}
                  disabled={saving}
                  fullWidth
                  sx={{
                    borderRadius: 0,
                    height: 64,
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                  }}
                >
                  {saving ? "Spremanje..." : "Nastavi"}
                </Button>
              </Box>

              {/* Desktop: Centered button */}
              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  justifyContent: "center",
                  mt: 4,
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleContinue}
                  disabled={saving}
                  sx={{ minWidth: 200 }}
                >
                  {saving ? "Spremanje..." : "Nastavi"}
                </Button>
              </Box>
            </>
          )}
        </>
      )}
    </Container>
  );
}

// Memoized DesertCard component to prevent unnecessary rerenders
interface DesertCardProps {
  desert: Desert;
  isSelected: boolean;
  isOtherSelected: boolean;
  onSelect: (id: string) => void;
}

const DesertCard = React.memo(({ desert, isSelected, isOtherSelected, onSelect }: DesertCardProps) => {
  return (
    <Box>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          opacity: isOtherSelected ? 0.4 : 1,
          transition: "all 0.3s ease",
          border: isSelected ? 3 : 1,
          borderColor: isSelected ? "primary.main" : "divider",
          transform: isSelected ? "scale(1.02)" : "scale(1)",
          boxShadow: isSelected ? 8 : 1,
        }}
      >
        <CardActionArea
          onClick={() => onSelect(desert._id)}
          sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}
        >
          {isSelected && (
            <Box
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 1,
                bgcolor: "primary.main",
                borderRadius: "50%",
                p: 0.5,
              }}
            >
              <CheckCircleIcon sx={{ color: "white", fontSize: 32 }} />
            </Box>
          )}
          <CardMedia
            component="img"
            height="200"
            image={desert.imagePath}
            alt={desert.name}
            sx={{
              objectFit: "cover",
            }}
          />
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography gutterBottom variant="h5" component="h2">
              {desert.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {desert.description}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
});

DesertCard.displayName = 'DesertCard';

