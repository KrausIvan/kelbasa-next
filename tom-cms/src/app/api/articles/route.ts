import { NextResponse } from 'next/server';
import { prisma } from '@/libs/prisma'; // Cesta ke tvému Prisma klientu
import { auth } from '@/libs/auth';

export async function GET(){
    const articles = await prisma.article.findMany({
        select: { articleId: true, slug: true, title: true, published: true },
        orderBy: { articleId: "desc" },
    });

    return NextResponse.json(articles);
}

export async function POST(req: Request){
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
          data: { title, content, slug, published: published ?? false, author: { connect: { email: session.user.email } } },
        });

        for (const tag of tags) {
            if (!tag || typeof tag !== "string") continue;

            const res = await prisma.tag.findFirst({
                where: { name: tag },
                select: { tagId: true }
            });

            if (!res) continue;

            await prisma.articleTag.create({
                data: {
                    articleId: newArticle.articleId,
                    tagId: res.tagId
                }
            });

            console.log("Tag created", res);
        }

        return NextResponse.json(newArticle, { status: 201 });
      } catch (error) {
        return NextResponse.json({ error: "Chyba při ukládání článku" + error }, { status: 500 });
      } 
}

export async function PUT(req: Request) {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { articleId, article } = await req.json();

        if (!articleId || !article) {
            return NextResponse.json({ error: "Article ID or article is missing" }, { status: 400 });
        }

        const existingArticle = await prisma.article.findUnique({
            where: { articleId },
            select: { author: { select: { email: true } } }
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
                published: article.published
            }
        });

        await prisma.articleTag.deleteMany({ where: { articleId } });

        const tags = await prisma.tag.findMany({ where: { name: { in: article.tags } }, select: { tagId: true } });

        for (const tag of tags) {
            await prisma.articleTag.create({
                data: {
                    articleId,
                    tagId: tag.tagId
                }
            });
        }


        return NextResponse.json({ message: "Article updated successfully" });

    } catch (error) {
        console.error("Error updating article:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


export async function DELETE(req: Request){
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
        select: { author: { select: { email: true } } }
    });
    if (!article) {
        return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (article.author.email !== session.user.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all tags associated with the article
    await prisma.articleTag.deleteMany({ where: { articleId } });

    await prisma.article.delete({ where: { articleId } });

    return NextResponse.json({ message: "Article deleted" });
}