import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      {
        email: 'tomas.plqa@gmail.com',
        name: 'Tom',
      }
    ],
  });

  const user = await prisma.user.findUnique({
    where: {
      email: 'tomas.plqa@gmail.com'
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  await prisma.profile.createMany({
    data: [
      {
        userEmail: user.email,
        bio: 'I am a software engineer',
        country: 'Czech Republic',
        gender: 'MALE',
      }
    ]
  });


}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });