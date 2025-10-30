"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { getDrinks } from "./actions";
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
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface Drink {
  _id: string;
  name: string;
  description: string;
  quantity: number;
  imagePath: string;
}

export default function Page() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isInitialMount = useRef(true);

  useEffect(() => {
    const fetchDrinks = async () => {
      try {
        // Only show loading on initial mount
        if (isInitialMount.current) {
          setLoading(true);
        }

        const result = await getDrinks();
        if (result.success && result.data) {
          // Only update state if data actually changed
          setDrinks(prevDrinks => {
            // Compare if drinks list is different
            if (JSON.stringify(prevDrinks) !== JSON.stringify(result.data)) {
              return result.data;
            }
            return prevDrinks;
          });

          // Check if selected drink is still available
          if (selectedDrink) {
            const stillAvailable = result.data.some(drink => drink._id === selectedDrink);
            if (!stillAvailable) {
              setSelectedDrink(null);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching drinks:", error);
      } finally {
        if (isInitialMount.current) {
          setLoading(false);
          isInitialMount.current = false;
        }
      }
    };

    // Initial fetch
    fetchDrinks();

    // Poll for updates every 3 seconds to check stock levels
    const pollInterval = setInterval(fetchDrinks, 3000);

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  }, [selectedDrink]);

  const handleDrinkSelect = useCallback((drinkId: string) => {
    setSelectedDrink(drinkId);
  }, []);

  const handleContinue = useCallback(() => {
    if (selectedDrink) {
      // TODO: Navigate to next step or save selection
      console.log("Selected drink:", selectedDrink);
    }
  }, [selectedDrink]);

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
        pb: selectedDrink ? { xs: 12, md: 4 } : 4, // Extra padding on mobile when button is visible
      }}
    >
      <Typography variant="h3" component="h1" gutterBottom>
        Choose Your Drink
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Select one drink to accompany your meal
      </Typography>

      {drinks.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No drinks available at the moment
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
            {drinks.map((drink) => {
              const isSelected = selectedDrink === drink._id;
              const isOtherSelected = selectedDrink !== null && !isSelected;

              return (
                <DrinkCard
                  key={drink._id}
                  drink={drink}
                  isSelected={isSelected}
                  isOtherSelected={isOtherSelected}
                  onSelect={handleDrinkSelect}
                />
              );
            })}
          </Box>

          {selectedDrink && (
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
                  fullWidth
                  sx={{
                    borderRadius: 0,
                    height: 64,
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                  }}
                >
                  Continue
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
                  sx={{ minWidth: 200 }}
                >
                  Continue
                </Button>
              </Box>
            </>
          )}
        </>
      )}
    </Container>
  );
}

// Memoized DrinkCard component to prevent unnecessary rerenders
interface DrinkCardProps {
  drink: Drink;
  isSelected: boolean;
  isOtherSelected: boolean;
  onSelect: (id: string) => void;
}

const DrinkCard = React.memo(({ drink, isSelected, isOtherSelected, onSelect }: DrinkCardProps) => {
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
          onClick={() => onSelect(drink._id)}
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
            image={drink.imagePath}
            alt={drink.name}
            sx={{
              objectFit: "cover",
            }}
          />
          <CardContent sx={{ flexGrow: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
              <Typography gutterBottom variant="h5" component="h2">
                {drink.name}
              </Typography>
              <Chip
                label={`${drink.quantity} left`}
                size="small"
                color={drink.quantity < 5 ? "warning" : "success"}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {drink.description}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
});

DrinkCard.displayName = 'DrinkCard';
