import { NextResponse } from 'next/server';
import { prisma } from '@/libs/prisma'; // Cesta ke tvému Prisma klientu

export async function GET() {
  try {
    // Načti všechny uživatele z databáze
    const users = await prisma.user.findMany({
        include: {
            profile: true
        }
    });

    // Odpověď s JSON daty uživatelů
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Chyba při načítání uživatelů:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
