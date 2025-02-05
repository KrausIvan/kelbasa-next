import React, { JSX } from "react";
import { prisma } from "@/libs/prisma";
import { ResolvingMetadata } from "next";
import styles from "./page.module.css";
import { IconButton } from "@mui/material";
import ArrowBackSharpIcon from '@mui/icons-material/ArrowBackSharp';
import LoginSharpIcon from '@mui/icons-material/LoginSharp';
import { NavigateAction } from "next/dist/client/components/router-reducer/router-reducer-types";
import Link from "next/link";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
){
  const article = await prisma.article.findUnique({
    where: { slug: (await params).slug },
    select: {
      title: true,
      content: true,
    },
  });

  return {
    title: "Tom CMS | " + (article ? article.title : "Article not found"),
    description:
      "Tom CMS | " +
      (article
        ? article.content.substring(0, 150) + "..."
        : "Article not found"),
  };
}

export default async function ArticlePage({
  params,
}: Props): Promise<JSX.Element> {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      tags: { select: { tag: true } },
      author: true,
      images: true,
    },
  });

  if (!article) {
    return (
      <div className={styles.notFound}>
        <p>Article not found</p>
      </div>
    );
  }

  // Vypočítáme počet slov a odhadneme čas čtení (200 slov/minutu)
  const wordCount = article.content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className={styles.container}>
      <div className={styles.navigation}>
        <IconButton
          color="primary"
          aria-label="search"
          href="/"
          >
          <ArrowBackSharpIcon />
        </IconButton>
        <IconButton 
          color="primary" 
          aria-label="login" 
          href="/login"
        >
          <LoginSharpIcon />
        </IconButton>
      </div>
      <h1 className={styles.title}>{article.title}</h1>
      <Link href={`/search?author=${article.author.name}`}>
        <p className={styles.author}>
          By {article.author?.name || "Unknown author"}
        </p>
      </Link>
      {article.createdAt && (
        <p className={styles.publishedDate}>
          Published on: {new Date(article.createdAt).toLocaleDateString()}
        </p>
      )}

      <div className={styles.metaInfo}>
        <p>Reading Time: {readingTime} minute{readingTime > 1 ? "s" : ""}</p>
        <p>Word Count: {wordCount}</p>
      </div>

      <div className={styles.content}>
        <p>{article.content}</p>
      </div>

      <h3 className={styles.tagsHeading}>🏷️ Tags</h3>
      <ul className={styles.tagList}>
          {article.tags.map((tagWrapper: { tag: { tagId: number; name: string } }) => (
              <li key={tagWrapper.tag.tagId} className={styles.tagItem}>
                  {tagWrapper.tag.name}
              </li>
          ))}

      </ul>
    </div>
  );
}