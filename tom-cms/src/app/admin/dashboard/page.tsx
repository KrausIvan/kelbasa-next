"use client";

export const dynamic = "force-dynamic";


import { Article } from "@/generated/client";
import Link from "next/link";
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
  Checkbox,
  IconButton,
  Icon,
} from "@mui/material";
import EditSharpIcon from '@mui/icons-material/EditSharp';
import DeleteSharpIcon from '@mui/icons-material/DeleteSharp';
import TurnedInSharpIcon from '@mui/icons-material/TurnedInSharp';
import HomeSharpIcon from '@mui/icons-material/HomeSharp';
import AddSharpIcon from '@mui/icons-material/AddSharp';

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetch("/api/articles/author/me")
      .then((res) => res.json())
      .then((data) => setArticles(data));
  }, []);

  const handleDelete = async (articleId: string) => {
    if (!confirm("Are you sure?")) return;
    
    await fetch("/api/articles", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId }),
    });

    setArticles((prev) =>
      prev.filter((article) => article.articleId !== articleId)
    );
  };

  const handlePublish = async (articleId: string) => {
    if (!confirm("Are you sure?")) return;

    await fetch("/api/articles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        articleId,
        article: {
          published:
            !articles.find((a) => a.articleId === articleId)?.published,
        },
      }),
    });

    setArticles((prev) =>
      prev.map((article) =>
        article.articleId === articleId
          ? { ...article, published: !article.published }
          : article
      )
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", alignContent: "center" }}>
          <IconButton href="/" color="primary" sx={{ height: 40}}>
            <HomeSharpIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            My Articles
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", alignContent: "center" }}>
          <IconButton aria-label="add" href="/admin/dashboard/new" sx={{ height: 40 }} color="primary">
            <AddSharpIcon />
          </IconButton>
          <Button href="/admin/dashboard/tags" variant="contained" color="primary" sx={{ height: 40 }}>
            <TurnedInSharpIcon />
          </Button>
        </Box>
      </Box>
      <Paper>
        <TableContainer sx={{ maxHeight: "70dvh" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Published</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.articleId}>
                  <TableCell component={"th"} scope="row">
                    <Link href={`/article/${article.slug}`} legacyBehavior>
                      <a style={{ textDecoration: "none", color: "inherit", fontWeight: "bold" }}>
                        {article.title}
                      </a>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="warning"
                      component={Link}
                      href={`/admin/dashboard/edit/${article.slug}`}
                      sx={{ mr: 1, p: 1 }}
                    >
                      <EditSharpIcon height={30}/>
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(article.articleId)}
                      sx={{ mr: 1, p: 1 }}
                    >
                      <DeleteSharpIcon height={30}/>
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={article.published}
                      onChange={() => handlePublish(article.articleId)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
