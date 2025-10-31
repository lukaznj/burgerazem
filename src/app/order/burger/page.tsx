"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Button,
  Paper,
  Switch,
  Divider,
} from "@mui/material";
import BurgerazemLogo from "@/components/BurgerazemLogo";
import { getBurgerIngredients } from "./actions";
import { saveBurgerIngredients } from "../order-actions";
import { hasInProgressOrderOfType } from "../order-status-actions";

interface Ingredient {
  _id: string;
  name: string;
  description: string;
  imagePath: string;
  category: string;
}

export default function Page() {
  const router = useRouter();
  const [ingredientsByCategory, setIngredientsByCategory] = useState<Record<string, Ingredient[]>>({});
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Check if user already has a burger order
  useEffect(() => {
    const checkExistingOrder = async () => {
      const hasBurgerOrder = await hasInProgressOrderOfType("burger");
      if (hasBurgerOrder) {
        router.replace("/order");
      }
    };
    checkExistingOrder();
  }, [router]);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setLoading(true);
        const result = await getBurgerIngredients();
        if (result.success && result.data) {
          setIngredientsByCategory(result.data);
        }
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  const handleToggleIngredient = useCallback((ingredientId: string) => {
    setSelectedIngredients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientId)) {
        newSet.delete(ingredientId);
      } else {
        newSet.add(ingredientId);
      }
      return newSet;
    });
  }, []);

  const handleContinue = useCallback(async () => {
    if (saving) return;

    setSaving(true);
    try {
      const result = await saveBurgerIngredients(Array.from(selectedIngredients));
      if (result.success) {
        // TODO: Navigate to next step or confirmation page
        router.push("/order/confirmation");
      } else {
        alert("Failed to save burger: " + result.error);
        setSaving(false);
      }
    } catch (error) {
      console.error("Error saving burger:", error);
      alert("Failed to save burger");
      setSaving(false);
    }
  }, [selectedIngredients, saving, router]);

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const categories = Object.keys(ingredientsByCategory).sort();

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        pb: 12, // Extra padding for fixed button
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Složite svoj
        </Typography>
        <Box sx={{ ml: 2 }}>
          <BurgerazemLogo fill="#ff8c00" width={300} height="auto" />
        </Box>
      </Box>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Odaberite sastojke koje želite na svom burgeru
      </Typography>

      {categories.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Trenutno nema dostupnih sastojaka
          </Typography>
        </Box>
      ) : (
        <>
          {categories.map((category) => (
            <Box key={category} sx={{ mb: 4 }}>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  textTransform: "capitalize",
                }}
              >
                {category}
              </Typography>

              <Paper elevation={2}>
                {ingredientsByCategory[category].map((ingredient, index) => (
                  <React.Fragment key={ingredient._id}>
                    {index > 0 && <Divider />}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 2,
                        transition: "background-color 0.2s",
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      {/* Ingredient Image and Info */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          flexGrow: 1,
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            position: "relative",
                            borderRadius: 1,
                            overflow: "hidden",
                            flexShrink: 0,
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={ingredient.imagePath}
                            alt={ingredient.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>

                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="h3">
                            {ingredient.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {ingredient.description}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Switch */}
                      <Switch
                        checked={selectedIngredients.has(ingredient._id)}
                        onChange={() => handleToggleIngredient(ingredient._id)}
                        color="primary"
                        sx={{ ml: 2 }}
                      />
                    </Box>
                  </React.Fragment>
                ))}
              </Paper>
            </Box>
          ))}

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
    </Container>
  );
}

