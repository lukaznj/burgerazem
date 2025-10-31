"use client";

import { useState, useEffect } from "react";
import { getItemsByType, createItem, updateItem, deleteItem } from "./actions";
import { getCategories, createCategory, deleteCategory } from "./category-actions";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

interface Item {
  _id: string;
  name: string;
  description: string;
  quantity: number;
  imagePath: string;
  category?: string;
}

export default function Page() {
  const [currentTab, setCurrentTab] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: 0,
    category: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [drinks, setDrinks] = useState<Item[]>([]);
  const [burgerParts, setBurgerParts] = useState<Item[]>([]);
  const [deserts, setDeserts] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Fetch items from database
  const fetchItems = async () => {
    try {
      setLoading(true);
      const [drinksData, burgerPartsData, desertsData, categoriesData] = await Promise.all([
        getItemsByType("drinks"),
        getItemsByType("burgerParts"),
        getItemsByType("deserts"),
        getCategories(),
      ]);

      if (drinksData.success && drinksData.data) setDrinks(drinksData.data);
      if (burgerPartsData.success && burgerPartsData.data) setBurgerParts(burgerPartsData.data);
      if (desertsData.success && desertsData.data) setDeserts(desertsData.data);
      if (categoriesData.success && categoriesData.data) setCategories(categoriesData.data);
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
      quantity: item.quantity,
      category: item.category || "",
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
      quantity: 0,
      category: "",
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
        return "piće";
      case 1:
        return "dio burgera";
      case 2:
        return "desert";
      default:
        return "artikl";
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const result = await createCategory(newCategoryName.trim());
      if (result.success) {
        await fetchItems();
        setNewCategoryName("");
        setAddCategoryDialogOpen(false);
      } else {
        alert("Failed to add category: " + result.error);
      }
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const result = await deleteCategory(categoryId);
      if (result.success) {
        await fetchItems();
      } else {
        alert("Failed to delete category: " + result.error);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    }
  };

  const renderTable = (data: Item[], showQuantity: boolean = true) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Naziv</TableCell>
            <TableCell>Opis</TableCell>
            {showQuantity && <TableCell align="right">Količina</TableCell>}
            <TableCell align="center">Akcije</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showQuantity ? 4 : 3} align="center">
                Nema pronađenih artikala
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                {showQuantity && <TableCell align="right">{item.quantity}</TableCell>}
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
        Upravljanje artiklima
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Pića" />
          <Tab label="Burger dijelovi" />
          <Tab label="Deserti" />
          <Tab label="Kategorije" />
        </Tabs>
      </Box>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {currentTab === 0 && renderTable(drinks, true)}
          {currentTab === 1 && renderTable(burgerParts, false)}
          {currentTab === 2 && renderTable(deserts, false)}
          {currentTab === 3 && (
            <Paper>
              <List>
                {categories.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary="Još nema kategorija"
                      secondary="Kliknite + gumb za dodavanje kategorija za sastojke burgera"
                    />
                  </ListItem>
                ) : (
                  categories.map((category) => (
                    <ListItem
                      key={category._id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteCategory(category._id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText primary={category.name} />
                    </ListItem>
                  ))
                )}
              </List>
            </Paper>
          )}
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
        onClick={() => {
          if (currentTab === 3) {
            setAddCategoryDialogOpen(true);
          } else {
            handleAddClick();
          }
        }}
      >
        <AddIcon />
      </Fab>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Uredi artikl</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              label="Naziv"
              fullWidth
              value={formData.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
            />
            <TextField
              label="Opis"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
            />
            {currentTab === 0 && (
              <TextField
                label="Količina"
                type="number"
                fullWidth
                value={formData.quantity}
                onChange={(e) =>
                  handleFormChange("quantity", parseInt(e.target.value) || 0)
                }
                slotProps={{
                  htmlInput: { min: 0, step: 1 }
                }}
              />
            )}
            {currentTab === 1 && (
              <FormControl fullWidth>
                <InputLabel>Kategorija</InputLabel>
                <Select
                  value={formData.category}
                  label="Kategorija"
                  onChange={(e) => handleFormChange("category", e.target.value)}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat.name}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Odustani</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Spremi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onClose={handleAddClose} maxWidth="sm" fullWidth>
        <DialogTitle>Dodaj novi {getItemType()}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              label="Naziv"
              fullWidth
              value={formData.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              required
            />
            <TextField
              label="Opis"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
              required
            />
            {currentTab === 0 && (
              <TextField
                label="Količina"
                type="number"
                fullWidth
                value={formData.quantity}
                onChange={(e) =>
                  handleFormChange("quantity", parseInt(e.target.value) || 0)
                }
                slotProps={{
                  htmlInput: { min: 0, step: 1 }
                }}
                required
              />
            )}
            {currentTab === 1 && (
              <FormControl fullWidth required>
                <InputLabel>Kategorija</InputLabel>
                <Select
                  value={formData.category}
                  label="Kategorija"
                  onChange={(e) => handleFormChange("category", e.target.value)}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat.name}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Box>
              <Button
                variant="outlined"
                component="label"
                fullWidth
              >
                Prenesi sliku
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
                    Pregled:
                  </Typography>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Pregled"
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
          <Button onClick={handleAddClose}>Odustani</Button>
          <Button
            onClick={handleSaveAdd}
            variant="contained"
            color="primary"
            disabled={!formData.name || !formData.description || !selectedImage}
          >
            Dodaj artikl
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={addCategoryDialogOpen} onClose={() => setAddCategoryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dodaj novu kategoriju</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Naziv kategorije"
              fullWidth
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="npr. Sirevi, Umaci, Meso"
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCategoryDialogOpen(false)}>Odustani</Button>
          <Button
            onClick={handleAddCategory}
            variant="contained"
            color="primary"
            disabled={!newCategoryName.trim()}
          >
            Dodaj kategoriju
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}