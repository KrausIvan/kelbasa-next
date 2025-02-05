import React from 'react';
import { prisma } from '@/libs/prisma';
import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';
import styles from '@/app/search/page.module.css';
import { IconButton } from '@mui/material';
import HomeSharpIcon from '@mui/icons-material/HomeSharp';
import LoginSharpIcon from '@mui/icons-material/LoginSharp';
import SearchSharpIcon from '@mui/icons-material/SearchSharp';
import { TextField } from '@mui/material';

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    author?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {


  const query = (await searchParams).q || "";
  const authorQuery = (await searchParams).author || "";

  const articles = await prisma.article.findMany({
    where: {
      AND: [
        {
          OR: [
            { title: { contains: query } },
            { content: { contains: query } },
          ],
        },
        authorQuery
          ? {
              author: {
                name: { contains: authorQuery },
              },
            }
          : {},
        {
            published: true,
        }
      ],
    },
    include: {
      author: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <main className={styles.container}>
      <div className={styles.navigation}>
        <IconButton
          color="primary"
          aria-label="search"
          href="/"
          >
          <HomeSharpIcon />
        </IconButton>
        <IconButton 
          color="primary" 
          aria-label="login" 
          href="/login"
        >
          <LoginSharpIcon />
        </IconButton>
      </div>
      <h2 className={styles.heading}>Search</h2>
      <p className={styles.description}>
        Search for articles by title, content, or author
      </p>
      
      <form method="get" className="mb-4">
        <div className={styles.searchForm}>
          <TextField 
            id="q"
            name="q"
            label="Search query"
            defaultValue={query}
            className="form-control"
          />
          <TextField
            id="author"
            name="author"
            label="Author"
            defaultValue={authorQuery}
            className="form-control"
            />
        <IconButton type="submit" color="primary" aria-label="search">
          <SearchSharpIcon />
        </IconButton>
            </div>
      </form>

      {articles.length === 0 ? (
        null
      ) : (
        <ul className={styles.articleList}>
        {articles.map((article) => (
          <li key={article.slug}>
            <ArticleCard 
              title={article.title} 
              slug={article.slug} 
              author={article.author.name ?? "Unknown author"} 
              description={article.content.slice(0, 100)}
              date={article.createdAt.toLocaleDateString()}
            />
          </li>
        ))}
      </ul>
      )}


    </main>
  );
}
