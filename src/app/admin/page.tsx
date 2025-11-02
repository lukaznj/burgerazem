"use client";

import { useState, useEffect } from "react";
import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getSettings,
  updateDesertsEnabled,
} from "./actions";
import {
  Typography,
  Box,
  Container,
  Select,
  MenuItem,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  Divider,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";

interface Item {
  _id: string;
  name: string;
  type: string;
  category?: string;
}

interface Order {
  _id: string;
  clerkUserId: string;
  userName?: string;
  status: string;
  orderType: "drink" | "burger" | "dessert";
  itemId?: Item;
  burgerIngredients?: Item[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [desertsEnabled, setDesertsEnabled] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const fetchOrders = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      }
      setError(null);
      const result = await getAllOrders();

      if (result.success && result.data) {
        // Only update state if orders actually changed to prevent unnecessary rerenders
        setOrders(prevOrders => {
          const hasChanged = JSON.stringify(prevOrders) !== JSON.stringify(result.data);
          return hasChanged ? result.data : prevOrders;
        });
      } else {
        setError((result as { error?: string }).error || "Failed to fetch orders");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  };

  const fetchSettings = async () => {
    try {
      const result = await getSettings();
      if (result.success && result.data) {
        setDesertsEnabled(result.data.desertsEnabled);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchOrders(true);
    fetchSettings();

    // Poll for updates every 3 seconds
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 3000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const result = await updateOrderStatus(orderId, newStatus);

    if (result.success) {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } else {
      alert((result as { error?: string }).error || "Failed to update order status");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) {
      return;
    }

    const result = await deleteOrder(orderId);

    if (result.success) {
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
    } else {
      alert((result as { error?: string }).error || "Failed to delete order");
    }
  };

  const handleDesertsToggle = async (enabled: boolean) => {
    setSettingsLoading(true);
    const result = await updateDesertsEnabled(enabled);

    if (result.success) {
      setDesertsEnabled(enabled);
    } else {
      alert((result as { error?: string }).error || "Failed to update deserts setting");
    }
    setSettingsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-progress":
        return "warning";
      case "completed":
        return "success";
      case "canceled":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("hr-HR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Admin Dashboard
        </Typography>
        <IconButton onClick={() => fetchOrders(false)} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Settings Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Postavke
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <FormControlLabel
            control={
              <Switch
                checked={desertsEnabled}
                onChange={(e) => handleDesertsToggle(e.target.checked)}
                disabled={settingsLoading}
              />
            }
            label="Omogući naručivanje deserta"
          />
          {settingsLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}
        </CardContent>
      </Card>

      {/* Burger Orders */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Narudžbe burgera ({orders.filter(o => o.orderType === "burger").length})
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2}>
          {orders.filter(o => o.orderType === "burger").length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nema burger narudžbi
            </Typography>
          ) : (
            orders.filter(o => o.orderType === "burger").map((order) => (
              <Box key={order._id} sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' } }}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" component="div">
                        {order.userName || order.clerkUserId.slice(0, 12)}
                      </Typography>
                      <Chip
                        label={order.status.toUpperCase()}
                        color={getStatusColor(order.status) as any}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Sastojci burgera:
                    </Typography>

                    <Box mb={2} display="flex" flexWrap="wrap" gap={0.5}>
                      {order.burgerIngredients && order.burgerIngredients.length > 0 ? (
                        order.burgerIngredients.map((ingredient) => (
                          <Chip
                            key={ingredient._id}
                            label={ingredient.name}
                            size="small"
                            variant="outlined"
                          />
                        ))
                      ) : (
                        <Typography variant="body2">Nema sastojaka</Typography>
                      )}
                    </Box>

                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                      {formatDate(order.createdAt)}
                    </Typography>

                    <Box display="flex" gap={1} alignItems="center">
                      <Select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value as string)}
                        size="small"
                        variant="outlined"
                        sx={{ flex: 1 }}
                      >
                        <MenuItem value="in-progress">U tijeku</MenuItem>
                        <MenuItem value="completed">Završeno</MenuItem>
                        <MenuItem value="canceled">Otkazano</MenuItem>
                      </Select>

                      <IconButton
                        color="error"
                        onClick={() => handleDeleteOrder(order._id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))
          )}
        </Box>
      </Box>

      {/* Drink Orders */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Narudžbe pića ({orders.filter(o => o.orderType === "drink").length})
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2}>
          {orders.filter(o => o.orderType === "drink").length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nema narudžbi pića
            </Typography>
          ) : (
            orders.filter(o => o.orderType === "drink").map((order) => (
              <Box key={order._id} sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' } }}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" component="div">
                        {order.userName || order.clerkUserId.slice(0, 12)}
                      </Typography>
                      <Chip
                        label={order.status.toUpperCase()}
                        color={getStatusColor(order.status) as any}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Piće:
                    </Typography>

                    <Typography variant="h6" mb={2}>
                      {order.itemId?.name || "Nepoznato piće"}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                      {formatDate(order.createdAt)}
                    </Typography>

                    <Box display="flex" gap={1} alignItems="center">
                      <Select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value as string)}
                        size="small"
                        variant="outlined"
                        sx={{ flex: 1 }}
                      >
                        <MenuItem value="in-progress">U tijeku</MenuItem>
                        <MenuItem value="completed">Završeno</MenuItem>
                        <MenuItem value="canceled">Otkazano</MenuItem>
                      </Select>

                      <IconButton
                        color="error"
                        onClick={() => handleDeleteOrder(order._id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))
          )}
        </Box>
      </Box>

      {/* Dessert Orders */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Narudžbe deserta ({orders.filter(o => o.orderType === "dessert").length})
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2}>
          {orders.filter(o => o.orderType === "dessert").length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nema narudžbi deserta
            </Typography>
          ) : (
            orders.filter(o => o.orderType === "dessert").map((order) => (
              <Box key={order._id} sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' } }}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" component="div">
                        {order.userName || order.clerkUserId.slice(0, 12)}
                      </Typography>
                      <Chip
                        label={order.status.toUpperCase()}
                        color={getStatusColor(order.status) as any}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Desert:
                    </Typography>

                    <Typography variant="h6" mb={2}>
                      {order.itemId?.name || "Nepoznat desert"}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                      {formatDate(order.createdAt)}
                    </Typography>

                    <Box display="flex" gap={1} alignItems="center">
                      <Select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value as string)}
                        size="small"
                        variant="outlined"
                        sx={{ flex: 1 }}
                      >
                        <MenuItem value="in-progress">U tijeku</MenuItem>
                        <MenuItem value="completed">Završeno</MenuItem>
                        <MenuItem value="canceled">Otkazano</MenuItem>
                      </Select>

                      <IconButton
                        color="error"
                        onClick={() => handleDeleteOrder(order._id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))
          )}
        </Box>
      </Box>
    </Container>
  );
}

