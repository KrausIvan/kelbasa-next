import { NextResponse } from 'next/server';
import { prisma } from '@/libs/prisma'; // Cesta ke tvému Prisma klientu
import { auth } from '@/libs/auth';

export async function GET(){
    const tags = await prisma.tag.findMany({
        select: { tagId: true, name: true },
        orderBy: { name: "desc" },
    });

    return NextResponse.json(tags);
}

export async function POST(req: Request){
    try {
        const session = await auth();

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { userId: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { name } = await req.json();
        if (!name) {
          return NextResponse.json({ error: "Name is missing" }, { status: 400 });
        }

    
        const newTag = await prisma.tag.create({
          data: { name, userId: user.userId },
        });
    
        return NextResponse.json(newTag, { status: 201 });
      } catch (error) {
        return NextResponse.json({ error: "Error during saving tag" }, { status: 500 });
      } 
}

export async function DELETE(req: Request){
    try {
        const { tagId } = await req.json();

        const session = await auth();

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tag = await prisma.tag.findUnique({
            where: { tagId },
            include: { user: { select: { email: true } } }
        });

        if (!tag) {
            return NextResponse.json({ error: "Tag not found" }, { status: 404 });
        }
        
        if (tag.user.email !== session.user.email) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete all articleTag relations
        await prisma.articleTag.deleteMany({ where: { tagId } });
    
        await prisma.tag.delete({ where: { tagId } });
    
        return NextResponse.json({ success: true });
      } catch (error) {
        return NextResponse.json({ error: "Error during tag deletion" }, { status: 500 });
      } 
}