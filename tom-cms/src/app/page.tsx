import { prisma } from "@/libs/prisma";
import LoggedUserServer from "@/components/LoggedUserServer";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import LoginSharpIcon from '@mui/icons-material/LoginSharp';
import SearchSharpIcon from '@mui/icons-material/SearchSharp';
import { IconButton } from "@mui/material";
import styles from "@/app/page.module.css";
import { Key } from "react";

export default async function HomePage() {

    const articles = await prisma.article.findMany({
        where: {published: true},
        take: 20,
        select: {title: true, author: {select: {name: true}}, slug: true, createdAt: true, content: true},
        orderBy: {createdAt: "desc"},
    });

    const serializedArticles = articles.map((article: { createdAt: { toISOString: () => any; }; }) => ({
        ...article,
        createdAt: article.createdAt.toISOString(),
    }));

    return (
        <main className={styles.container}>
            <div className={styles.navigation}>
                <IconButton
                    color="primary"
                    aria-label="search"
                    href="/search"
                >
                    <SearchSharpIcon/>
                </IconButton>
                <IconButton
                    color="primary"
                    aria-label="login"
                    href="/login"
                >
                    <LoginSharpIcon/>
                </IconButton>
            </div>
            <h1 className={styles.heading}>NextJS Times</h1>
            <p className={styles.description}>
                The latest articles from the NextJS Times
            </p>
            <ul className={styles.articleList}>
                {serializedArticles.map((article: { slug: Key | null | undefined; title: string; author: { name: any; }; content: string; createdAt: string | number | Date; }) => (
                    <li key={article.slug}>
                        <ArticleCard
                            title={article.title}
                            slug={article.slug}
                            author={article.author?.name ?? "Unknown author"}
                            description={article.content.slice(0, 100)}
                            date={new Date(article.createdAt).toLocaleDateString()}
                        />
                    </li>
                ))}
            </ul>
        </main>
    );
}