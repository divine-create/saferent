import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { UserRole, VerificationStatus } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      trustScore: number;
      bvnVerificationStatus: VerificationStatus;
      isPhoneVerified: boolean;
      isEmailVerified: boolean;
      phone?: string | null;
    };
  }

  interface User {
    role?: UserRole;
    trustScore?: number;
    bvnVerificationStatus?: VerificationStatus;
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
    phone?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: UserRole;
    trustScore: number;
    bvnVerificationStatus: VerificationStatus;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
    phone?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as NextAuthOptions["adapter"],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Please enter your email/phone and password");
        }

        const identifier = credentials.identifier.trim();

        // Try to find user by email or phone
        const user = await db.user.findFirst({
          where: {
            OR: [
              { email: identifier },
              { phone: identifier },
              { phone: identifier.startsWith("0") ? `+234${identifier.slice(1)}` : identifier },
            ],
          },
        });

        if (!user) {
          throw new Error("No account found with this email or phone number");
        }

        if (!user.passwordHash) {
          throw new Error("This account uses Google Sign-In. Please sign in with Google.");
        }

        if (user.isBanned) {
          throw new Error("Your account has been suspended. Please contact support.");
        }

        if (!user.isActive) {
          throw new Error("Your account is inactive. Please contact support.");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          throw new Error("Incorrect password. Please try again.");
        }

        return {
          id: user.id,
          name: user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : null,
          email: user.email,
          phone: user.phone,
          image: user.profilePhoto,
          role: user.role,
          trustScore: user.trustScore,
          bvnVerificationStatus: user.bvnVerificationStatus,
          isPhoneVerified: user.isPhoneVerified,
          isEmailVerified: user.isEmailVerified,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await db.user.findUnique({
          where: { email: user.email! },
        });

        if (existingUser) {
          if (existingUser.isBanned) return false;
          if (!existingUser.isActive) return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role ?? "TENANT";
        token.trustScore = user.trustScore ?? 0;
        token.bvnVerificationStatus = user.bvnVerificationStatus ?? "NOT_SUBMITTED";
        token.isPhoneVerified = user.isPhoneVerified ?? false;
        token.isEmailVerified = user.isEmailVerified ?? false;
        token.phone = user.phone ?? null;
      } else if (token.userId) {
        // Refresh user data on each request
        const dbUser = await db.user.findUnique({
          where: { id: token.userId },
          select: {
            role: true,
            trustScore: true,
            bvnVerificationStatus: true,
            isPhoneVerified: true,
            isEmailVerified: true,
            isBanned: true,
            isActive: true,
            phone: true,
          },
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.trustScore = dbUser.trustScore;
          token.bvnVerificationStatus = dbUser.bvnVerificationStatus;
          token.isPhoneVerified = dbUser.isPhoneVerified;
          token.isEmailVerified = dbUser.isEmailVerified;
          token.phone = dbUser.phone;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.userId;
        session.user.role = token.role;
        session.user.trustScore = token.trustScore;
        session.user.bvnVerificationStatus = token.bvnVerificationStatus;
        session.user.isPhoneVerified = token.isPhoneVerified;
        session.user.isEmailVerified = token.isEmailVerified;
        session.user.phone = token.phone;
      }
      return session;
    },
  },
};
