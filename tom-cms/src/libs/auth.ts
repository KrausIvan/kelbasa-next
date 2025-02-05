import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { prisma } from "@/libs/prisma"
 
export const { handlers, signIn, signOut, auth } = NextAuth({

  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({user, account, profile }) {
      try {

        console.log('user', user)
        if (!user.email) {
          return false
        }

        const existingUser = await prisma.user.findUnique({
          where: {
            email: user.email
          }
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
            }
          })

          const newUser = await prisma.user.findUnique({
            where: {
              email: user.email
            }
          });

          if(!newUser) {
            return false
          }

          console.log('profile', profile)

          await prisma.profile.create({
            data: {
              userEmail: newUser.email,
            }
          })
        }

        return true
        
      } catch (error) {
        console.error(error)
        return false
      }
    },
  },
})