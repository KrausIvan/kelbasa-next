import { auth } from "@/libs/auth";
import { prisma } from "@/libs/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ author: string }>}) {
    let { author } = await params;

    if (!author) {
        return NextResponse.json({ error: "Author is missing" }, { status: 400 });
    }

    if (typeof author !== "string") {
        return NextResponse.json({ error: "Author is not a string" }, { status: 400 });
    }

    if (author === "me") {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        author = session.user.email;
    }
    
    const articles = await prisma.article.findMany({
        where: {
            author: {
                email: author
            }
        },
        select: { articleId: true, slug: true, title: true, published: true },
        orderBy: { articleId: "desc" },
    });

    return NextResponse.json(articles);

}