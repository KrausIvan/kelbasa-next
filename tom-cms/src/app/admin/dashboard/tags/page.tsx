"use client";

export const dynamic = "force-dynamic";

import { Tag } from "@/generated/client";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TextField,
  IconButton,
} from "@mui/material";
import DeleteSharpIcon from '@mui/icons-material/DeleteSharp';
import ArrowBackIosNewSharpIcon from '@mui/icons-material/ArrowBackIosNewSharp';

export default function AdminDashboard() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState<string>("");

  useEffect(() => {
    fetch("/api/tags/author/me")
      .then((res) => res.json())
      .then((data) => setTags(data));
  }, []);

  const handleDelete = async (tagId: string) => {
    if (!confirm("Are you sure?")) return;
    
    await fetch("/api/tags", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagId }),
    });

    setTags((prev) =>
      prev.filter((tag) => tag.tagId !== tagId)
    );
  };

  const handleNew = async () => {
    if (!newTagName) return;

    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTagName }),
    });

    if (!res.ok) {
      alert("Error creating tag");
      return;
    }

    const newTag = await res.json();

    setTags((prev) =>
      [...prev, newTag]
    );

    setNewTagName("");
  }


  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2, display: "flex", flexDirection: "row", justifyContent: "start", gap: 2, alignItems: "center" }}>
        <IconButton href="/admin/dashboard" color="primary">
          <ArrowBackIosNewSharpIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          My Tags
        </Typography>
      </Box>
      <Box sx={{ mb: 2, flexDirection: "row", display: "flex", gap: 2, alignItems: "center", alignContent: "center" }}>
        <TextField
                  label="Name"
                  variant="outlined"
                  margin="normal"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  sx={{ m: 0, p: 0 }}
                  required
                />
        <Button
          variant="contained"
          color="primary"
          onClick={handleNew}
          sx={{ height: 56 }}
        >
            New Tag
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              !tags || tags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      No tags found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : 
              tags.map((tag) => (
                <TableRow key={tag.tagId}>
                  <TableCell component={"th"} scope="row">
                      <Typography variant="h6" component="h2" gutterBottom>
                        {tag.name}
                      </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(tag.tagId)}
                      sx={{ mr: 1, p: 1 }}
                    >
                      <DeleteSharpIcon height={30}/>
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
