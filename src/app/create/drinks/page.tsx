"use client";

import { useState, useEffect } from "react";
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
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface Drink {
  _id: string;
  name: string;
  description: string;
  amount: number;
  imagePath: string;
}

export default function Page() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrinks = async () => {
      try {
        setLoading(true);
        const result = await getDrinks();
        if (result.success && result.data) {
          setDrinks(result.data);
        }
      } catch (error) {
        console.error("Error fetching drinks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrinks();
  }, []);

  const handleDrinkSelect = (drinkId: string) => {
    setSelectedDrink(drinkId);
  };

  const handleContinue = () => {
    if (selectedDrink) {
      // TODO: Navigate to next step or save selection
      console.log("Selected drink:", selectedDrink);
    }
  };

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
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
                <Box key={drink._id}>
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
                      onClick={() => handleDrinkSelect(drink._id)}
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
                        <Typography gutterBottom variant="h5" component="h2">
                          {drink.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {drink.description}
                        </Typography>
                        <Typography variant="h6" color="primary">
                          ${drink.amount.toFixed(2)}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Box>
              );
            })}
          </Box>

          {selectedDrink && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleContinue}
                sx={{ minWidth: 200 }}
              >
                Continue
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
