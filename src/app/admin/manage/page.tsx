"use client";

import { useState, useEffect } from "react";
import { getItemsByType, createItem, updateItem, deleteItem } from "./actions";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Fab,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

interface Item {
  _id: string;
  name: string;
  description: string;
  amount: number;
  imagePath: string;
}

export default function Page() {
  const [currentTab, setCurrentTab] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: 0,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [drinks, setDrinks] = useState<Item[]>([]);
  const [burgerParts, setBurgerParts] = useState<Item[]>([]);
  const [deserts, setDeserts] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch items from database
  const fetchItems = async () => {
    try {
      setLoading(true);
      const [drinksData, burgerPartsData, desertsData] = await Promise.all([
        getItemsByType("drinks"),
        getItemsByType("burgerParts"),
        getItemsByType("deserts"),
      ]);

      if (drinksData.success && drinksData.data) setDrinks(drinksData.data);
      if (burgerPartsData.success && burgerPartsData.data) setBurgerParts(burgerPartsData.data);
      if (desertsData.success && desertsData.data) setDeserts(desertsData.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleEditClick = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      amount: item.amount,
    });
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditingItem(null);
  };

  const handleFormChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    try {
      const result = await updateItem(editingItem._id, formData);

      if (result.success) {
        // Refresh the items
        await fetchItems();
        handleEditClose();
      } else {
        alert("Failed to update item: " + result.error);
      }
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to update item");
    }
  };

  const handleDelete = async (item: Item) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      const result = await deleteItem(item._id);

      if (result.success) {
        // Refresh the items
        await fetchItems();
      } else {
        alert("Failed to delete item: " + result.error);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item");
    }
  };

  const handleAddClick = () => {
    setFormData({
      name: "",
      description: "",
      amount: 0,
    });
    setSelectedImage(null);
    setImagePreview("");
    setAddDialogOpen(true);
  };

  const handleAddClose = () => {
    setAddDialogOpen(false);
    setSelectedImage(null);
    setImagePreview("");
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAdd = async () => {
    if (!selectedImage) return;

    try {
      // First, upload the image
      const imageFormData = new FormData();
      imageFormData.append("file", selectedImage);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: imageFormData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadData.success) {
        alert("Failed to upload image: " + uploadData.error);
        return;
      }

      // Then, create the item with the image path
      const itemType = currentTab === 0 ? "drinks" : currentTab === 1 ? "burgerParts" : "deserts";

      const result = await createItem({
        ...formData,
        imagePath: uploadData.data.imagePath,
        type: itemType,
      });

      if (result.success) {
        // Refresh the items
        await fetchItems();
        handleAddClose();
      } else {
        alert("Failed to create item: " + result.error);
      }
    } catch (error) {
      console.error("Error creating item:", error);
      alert("Failed to create item");
    }
  };

  const getItemType = () => {
    switch (currentTab) {
      case 0:
        return "Drink";
      case 1:
        return "Burger Part";
      case 2:
        return "Desert";
      default:
        return "Item";
    }
  };

  const renderTable = (data: Item[]) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No items found
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item._id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell align="right">{item.amount}</TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleEditClick(item)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(item)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" component="h1" sx={{ mb: 4 }}>
        Manage Items
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Drinks" />
          <Tab label="Burger Parts" />
          <Tab label="Deserts" />
        </Tabs>
      </Box>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {currentTab === 0 && renderTable(drinks)}
          {currentTab === 1 && renderTable(burgerParts)}
          {currentTab === 2 && renderTable(deserts)}
        </>
      )}

      {/* Floating Action Button for Add */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: "fixed",
          bottom: 32,
          right: 32,
        }}
        onClick={handleAddClick}
      >
        <AddIcon />
      </Fab>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
            />
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={formData.amount}
              onChange={(e) =>
                handleFormChange("amount", parseFloat(e.target.value) || 0)
              }
              slotProps={{
                htmlInput: { min: 0, step: 0.01 }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onClose={handleAddClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New {getItemType()}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              required
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
              required
            />
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={formData.amount}
              onChange={(e) =>
                handleFormChange("amount", parseFloat(e.target.value) || 0)
              }
              slotProps={{
                htmlInput: { min: 0, step: 0.01 }
              }}
              required
            />
            <Box>
              <Button
                variant="outlined"
                component="label"
                fullWidth
              >
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              {imagePreview && (
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Preview:
                  </Typography>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      objectFit: "contain",
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddClose}>Cancel</Button>
          <Button
            onClick={handleSaveAdd}
            variant="contained"
            color="primary"
            disabled={!formData.name || !formData.description || !selectedImage}
          >
            Add Item
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}