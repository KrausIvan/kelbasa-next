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
    
    const tags = await prisma.tag.findMany({
        where: {
            user: {
                email: author
            }
        },
        select: { tagId: true, name: true, userId: true },
        orderBy: { name: "desc" },
    });

    return NextResponse.json(tags);

}