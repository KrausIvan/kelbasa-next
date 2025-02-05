"use client";

export const dynamic = "force-dynamic";

import { Article } from "@/generated/client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import { assert } from "console";

export default function EditArticle() {
  const router = useRouter();
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/articles/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setArticle(data);
        setLoading(false);
        if (!data.tags) return;
        if (data.tags.length === 0) return;
        // @ts-ignore: This should be valid ...
        setTags([...data.tags.map(t => t.tag.name)]);
      })
      .catch(() => setLoading(false));

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
  }, [slug]);

  const handleSave = async () => {
    if (!article) return;

    await fetch(`/api/articles`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        articleId: article.articleId, 
        article: {
          ...article,
          tags,
        }
     }),
    });

    router.push("/admin/dashboard");
  };

  if (loading) return <Typography variant="h6">Loading...</Typography>;
  if (!article) return <Typography variant="h6">Article not found</Typography>;

  return (
    <Box sx={{ p: 3, maxWidth: 700, mx: "auto" }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Article
        </Typography>
        <TextField
          label="Title"
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
          value={article.title}
          onChange={(e) => setArticle({ ...article, title: e.target.value })}
        />
        <TextField
          label="Content"
          fullWidth
          multiline
          rows={6}
          variant="outlined"
          sx={{ mb: 2 }}
          value={article.content}
          onChange={(e) => setArticle({ ...article, content: e.target.value })}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={article.published}
              onChange={() =>
                setArticle({ ...article, published: !article.published })
              }
            />
          }
          label="Published"
        />
        {loading ? (
          <CircularProgress sx={{ mt: 2 }} />
        ) : (
          <Autocomplete
            multiple
            options={allTags}
            value={tags}
            filterOptions={x => x}
            onChange={(_, newValue) => setTags(newValue)}
            renderInput={(params) => <TextField {...params} label="Tags" variant="outlined" margin="normal" />}
            sx={{ mt: 2 }}
          />
        )}
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            sx={{ mr: 2 }}
          >
            Save Changes
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => router.push("/admin/dashboard")}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
