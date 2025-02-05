import { NextResponse } from 'next/server';
import { prisma } from '@/libs/prisma'; // Cesta ke tvému Prisma klientu

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }>}){
    const { slug } = await params;

    const article = await prisma.article.findUnique({
        where: { slug },
        include: {
            tags: {
                select: { tag: true }
            },
            author: true,
        }
    });

    return NextResponse.json(article);
}