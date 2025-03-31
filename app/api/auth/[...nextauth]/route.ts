import { PrismaClient } from "@prisma/client";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextResponse } from "next/server";
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn(params) {
      if (!params.user.email) {
        return false;
      }
      try {
        const prisma = new PrismaClient();
        await prisma.user.create({
          data: {
            email: params.user.email,
            provider: "Google",
          },
        });
      } catch (error) {
        console.log(error);
        return false; // Return false to indicate sign-in failure
      }
      return true;
    },
  },
});

export { handler as GET, handler as POST };
