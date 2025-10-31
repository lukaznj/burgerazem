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
import { getCurrentOrders } from "./order-status-actions";

interface OrderData {
  _id: string;
  status: string;
  orderType: "drink" | "burger" | "dessert";
  itemName?: string;
  itemImage?: string;
  burgerIngredients?: Array<{
    name: string;
    category: string;
  }>;
  createdAt: string;
}

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentOrders, setCurrentOrders] = useState<OrderData[]>([]);
  const [hasInProgressDrink, setHasInProgressDrink] = useState(false);
  const [hasInProgressBurger, setHasInProgressBurger] = useState(false);

  useEffect(() => {
    const fetchOrderStatus = async (isInitial = false) => {
      try {
        if (isInitial) {
          setLoading(true);
        }
        const result = await getCurrentOrders();
        if (result.success) {
          // Only update state if orders actually changed
          setCurrentOrders(prevOrders => {
            const hasChanged = JSON.stringify(prevOrders) !== JSON.stringify(result.data);
            return hasChanged ? result.data : prevOrders;
          });
          setHasInProgressDrink(result.hasInProgressDrink);
          setHasInProgressBurger(result.hasInProgressBurger);
        }
      } catch (error) {
        console.error("Error fetching order status:", error);
      } finally {
        if (isInitial) {
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchOrderStatus(true);

    // Poll for updates every 3 seconds
    const interval = setInterval(() => {
      fetchOrderStatus(false);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleOrderClick = (type: "drink" | "burger" | "desert") => {
    if (type === "drink" && !hasInProgressDrink) {
      router.push("/order/drinks");
    } else if (type === "burger" && !hasInProgressBurger) {
      router.push("/order/burger");
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

      {/* Current Orders Section */}
      {currentOrders.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
            Current Orders
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {currentOrders.map((order, index) => (
              <Paper key={order._id} elevation={3} sx={{ p: 3 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Order Type Header */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {order.orderType === "drink" && <LocalBarIcon color="primary" />}
                      {order.orderType === "burger" && <FastfoodIcon color="primary" />}
                      {order.orderType === "dessert" && <IcecreamIcon color="primary" />}
                      {order.orderType.charAt(0).toUpperCase() + order.orderType.slice(1)}
                    </Typography>
                    <Chip
                      label={order.status === "in-progress" ? "In Progress" : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      color={
                        order.status === "in-progress" ? "warning" :
                        order.status === "completed" ? "success" :
                        order.status === "canceled" ? "error" :
                        "default"
                      }
                      size="small"
                    />
                  </Box>

                  {/* Drink/Dessert Display */}
                  {(order.orderType === "drink" || order.orderType === "dessert") && order.itemName && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: 4 }}>
                      {order.itemImage && (
                        <Box
                          component="img"
                          src={order.itemImage}
                          alt={order.itemName}
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: 1,
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                        {order.itemName}
                      </Typography>
                    </Box>
                  )}

                  {/* Burger Display */}
                  {order.orderType === "burger" && order.burgerIngredients && order.burgerIngredients.length > 0 && (
                    <Box sx={{ ml: 4 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Ingredients ({order.burgerIngredients.length}):
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                        {order.burgerIngredients.map((ingredient, idx) => (
                          <Chip
                            key={idx}
                            label={ingredient.name}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Order Time */}
                  <Box sx={{ mt: 1, pt: 2, borderTop: 1, borderColor: "divider" }}>
                    <Typography variant="caption" color="text.secondary">
                      Order started: {new Date(order.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      {/* Empty State */}
      {currentOrders.length === 0 && (
        <Box sx={{ mt: 6, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No active orders yet. Start by selecting a drink or burger above!
          </Typography>
        </Box>
      )}
    </Container>
  );
}

