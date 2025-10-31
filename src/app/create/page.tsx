"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Chip,
  Paper,
  Divider,
} from "@mui/material";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import IcecreamIcon from "@mui/icons-material/Icecream";
import { getCurrentOrder } from "./order-status-actions";

interface OrderData {
  _id: string;
  status: string;
  drinkName?: string;
  drinkImage?: string;
  burgerIngredients: Array<{
    name: string;
    category: string;
  }>;
  createdAt: string;
}

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentOrder, setCurrentOrder] = useState<OrderData | null>(null);
  const [hasInProgressDrink, setHasInProgressDrink] = useState(false);
  const [hasInProgressBurger, setHasInProgressBurger] = useState(false);

  useEffect(() => {
    const fetchOrderStatus = async () => {
      try {
        setLoading(true);
        const result = await getCurrentOrder();
        if (result.success) {
          setCurrentOrder(result.data);
          setHasInProgressDrink(result.hasInProgressDrink);
          setHasInProgressBurger(result.hasInProgressBurger);
        }
      } catch (error) {
        console.error("Error fetching order status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStatus();
  }, []);

  const handleOrderClick = (type: "drink" | "burger" | "desert") => {
    if (type === "drink" && !hasInProgressDrink) {
      router.push("/create/drinks");
    } else if (type === "burger" && !hasInProgressBurger) {
      router.push("/create/burger");
    }
    // Desert is disabled for now
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
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{ fontWeight: "bold", textAlign: "center", mb: 4 }}
      >
        Want to Order More?
      </Typography>

      {/* Order Type Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 3,
          mb: 6,
        }}
      >
        {/* Drink Card */}
        <Card
          sx={{
            opacity: hasInProgressDrink ? 0.5 : 1,
            transition: "all 0.3s",
            "&:hover": {
              transform: hasInProgressDrink ? "none" : "translateY(-4px)",
              boxShadow: hasInProgressDrink ? 1 : 4,
            },
          }}
        >
          <CardActionArea
            onClick={() => handleOrderClick("drink")}
            disabled={hasInProgressDrink}
            sx={{ height: "100%" }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                py: 4,
              }}
            >
              <LocalBarIcon sx={{ fontSize: 64, color: hasInProgressDrink ? "text.disabled" : "primary.main" }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: "bold" }}>
                Drink
              </Typography>
              {hasInProgressDrink && (
                <Chip label="In Progress" size="small" color="warning" />
              )}
            </CardContent>
          </CardActionArea>
        </Card>

        {/* Burger Card */}
        <Card
          sx={{
            opacity: hasInProgressBurger ? 0.5 : 1,
            transition: "all 0.3s",
            "&:hover": {
              transform: hasInProgressBurger ? "none" : "translateY(-4px)",
              boxShadow: hasInProgressBurger ? 1 : 4,
            },
          }}
        >
          <CardActionArea
            onClick={() => handleOrderClick("burger")}
            disabled={hasInProgressBurger}
            sx={{ height: "100%" }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                py: 4,
              }}
            >
              <FastfoodIcon sx={{ fontSize: 64, color: hasInProgressBurger ? "text.disabled" : "primary.main" }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: "bold" }}>
                Burger
              </Typography>
              {hasInProgressBurger && (
                <Chip label="In Progress" size="small" color="warning" />
              )}
            </CardContent>
          </CardActionArea>
        </Card>

        {/* Desert Card - Disabled */}
        <Card sx={{ opacity: 0.5 }}>
          <CardActionArea disabled sx={{ height: "100%" }}>
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                py: 4,
              }}
            >
              <IcecreamIcon sx={{ fontSize: 64, color: "text.disabled" }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: "bold" }}>
                Desert
              </Typography>
              <Chip label="Coming Soon" size="small" />
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>

      {/* Current Order Section */}
      {currentOrder && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
            Current Order
          </Typography>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Drink Section */}
              {currentOrder.drinkName && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocalBarIcon color="primary" />
                    Drink
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: 4 }}>
                    {currentOrder.drinkImage && (
                      <Box
                        component="img"
                        src={currentOrder.drinkImage}
                        alt={currentOrder.drinkName}
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 1,
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                      {currentOrder.drinkName}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Burger Section */}
              {currentOrder.burgerIngredients.length > 0 && (
                <>
                  {currentOrder.drinkName && <Divider />}
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <FastfoodIcon color="primary" />
                      Burger
                    </Typography>
                    <Box sx={{ ml: 4 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Ingredients ({currentOrder.burgerIngredients.length}):
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                        {currentOrder.burgerIngredients.map((ingredient, index) => (
                          <Chip
                            key={index}
                            label={ingredient.name}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </>
              )}

              {/* Order Time */}
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
                <Typography variant="caption" color="text.secondary">
                  Order started: {new Date(currentOrder.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Empty State */}
      {!currentOrder && (
        <Box sx={{ mt: 6, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No active orders yet. Start by selecting a drink or burger above!
          </Typography>
        </Box>
      )}
    </Container>
  );
}

