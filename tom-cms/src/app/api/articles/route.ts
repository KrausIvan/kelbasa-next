import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { auth } from "@/libs/auth";

export async function GET() {
    try {
        const articles = await prisma.article.findMany({
            select: { articleId: true, slug: true, title: true, published: true },
            orderBy: { articleId: "desc" },
        });

        return NextResponse.json(JSON.parse(JSON.stringify(articles)));
    } catch (error) {
        console.error("Error fetching articles:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title, content, published, tags } = await req.json();
        if (!title || !content) {
            return NextResponse.json({ error: "Title or content is missing" }, { status: 400 });
        }

        const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

        const newArticle = await prisma.article.create({
            data: {
                title,
                content,
                slug,
                published: published ?? false,
                author: { connect: { email: session.user.email } },
            },
        });

        if (tags && Array.isArray(tags)) {
            for (const tag of tags) {
                if (!tag || typeof tag !== "string") continue;

                const res = await prisma.tag.findFirst({
                    where: { name: tag },
                    select: { tagId: true },
                });

                if (!res) continue;

                await prisma.articleTag.create({
                    data: {
                        articleId: newArticle.articleId,
                        tagId: res.tagId,
                    },
                });
            }
        }

        return NextResponse.json(JSON.parse(JSON.stringify(newArticle)), { status: 201 });
    } catch (error) {
        console.error("Error creating article:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { articleId, article } = await req.json();

        if (!articleId || !article) {
            return NextResponse.json({ error: "Article ID or article is missing" }, { status: 400 });
        }

        const existingArticle = await prisma.article.findUnique({
            where: { articleId },
            select: { author: { select: { email: true } } },
        });

        if (!existingArticle) {
            return NextResponse.json({ error: "Article not found" }, { status: 404 });
        }

        if (existingArticle.author.email !== session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await prisma.article.update({
            where: { articleId },
            data: {
                title: article.title,
                content: article.content,
                published: article.published,
            },
        });

        await prisma.articleTag.deleteMany({ where: { articleId } });

        if (article.tags && Array.isArray(article.tags)) {
            const tags = await prisma.tag.findMany({
                where: { name: { in: article.tags } },
                select: { tagId: true },
            });

            for (const tag of tags) {
                await prisma.articleTag.create({
                    data: {
                        articleId,
                        tagId: tag.tagId,
                    },
                });
            }
        }

        return NextResponse.json(JSON.parse(JSON.stringify({ message: "Article updated successfully" })));
    } catch (error) {
        console.error("Error updating article:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { articleId } = await req.json();
        if (!articleId) {
            return NextResponse.json({ error: "Article ID is missing" }, { status: 400 });
        }

        const article = await prisma.article.findUnique({
            where: { articleId },
            select: { author: { select: { email: true } } },
        });

        if (!article) {
            return NextResponse.json({ error: "Article not found" }, { status: 404 });
        }

        if (article.author.email !== session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await prisma.articleTag.deleteMany({ where: { articleId } });
        await prisma.article.delete({ where: { articleId } });

        return NextResponse.json(JSON.parse(JSON.stringify({ message: "Article deleted" })));
    } catch (error) {
        console.error("Error deleting article:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}