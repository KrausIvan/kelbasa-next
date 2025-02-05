"use client";

export const dynamic = "force-dynamic";


import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Alert,
  Autocomplete,
  Chip,
  CircularProgress,
} from "@mui/material";
import AddSharpIcon from '@mui/icons-material/AddSharp';

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [published, setPublished] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Načtení seznamu tagů z API
    const fetchTags = async () => {
      try {
        const res = await fetch("/api/tags", { method: "GET", headers: { "Content-Type": "application/json" } });
        if (!res.ok) throw new Error("Failed to fetch tags");
        const data = await res.json();
        setAllTags(data.map((tag: { name: string }) => tag.name));
        console.log(allTags);
      } catch (error) {
        console.error("Error fetching tags:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title || !content) {
      setMessage("Title and content are required");
      return;
    }

    if (title.length < 5) {
      setMessage("Title must be at least 5 characters long");
      return;
    }

    if (title.length > 100) {
      setMessage("Title must be at most 100 characters long");
      return;
    }

    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, published, tags }),
    });

    if (res.ok) {
      setMessage("");
      setTitle("");
      setContent("");
      setTags([]);
      alert("Article added successfully");
      router.push("/admin/dashboard");
    } else {
      const data = await res.json();
      setMessage(`Error: ${data.error}`);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 3, bgcolor: "background.paper", borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom color="primary">
        Create New Article
      </Typography>
      {message && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Title (unique)"
          variant="outlined"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <TextField
          label="Content"
          variant="outlined"
          fullWidth
          multiline
          rows={6}
          margin="normal"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <FormControlLabel
          control={<Checkbox checked={published} onChange={(e) => setPublished(e.target.checked)} />}
          label="Publish"
        />
        <br />
        {loading ? (
          <CircularProgress sx={{ mt: 2 }} />
        ) : (
          <Autocomplete
            multiple
            options={allTags}
            value={tags}
            filterOptions={x => x.filter((tag) => !tags.includes(tag))}
            onChange={(_, newValue) => setTags(newValue)}
            renderInput={(params) => <TextField {...params} label="Tags" variant="outlined" margin="normal" />}
            sx={{ mt: 2 }}
          />
        )}
        <br />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, mr: 2 }}>
          Create
        </Button>
        <Button variant="outlined" color="secondary" onClick={(e) => router.back()} sx={{ mt: 2 }}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
}
