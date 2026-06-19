import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid email or password");
        }

        await connectDB();

        const user = await User.findOne({
          email: credentials.email.toLowerCase().trim(),
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isMatch = await user.comparePassword(credentials.password);

        if (!isMatch) {
          throw new Error("Invalid email or password");
        }

        if (!user.isVerified) {
          throw new Error("Please verify your email before signing in.");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          isRegistrationComplete: user.isRegistrationComplete,
          onboardingStep: user.onboardingStep,
        } as any;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    //  ONLY run DB logic on Google sign-in (safe here)
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email && user.name) {
        await connectDB();

        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            googleId: account.providerAccountId,
            isVerified: true,
            isRegistrationComplete: true,
            onboardingStep: 0,
          });
        } else {
          if (!existingUser.googleId) {
            existingUser.googleId = account.providerAccountId;
            await existingUser.save();
          }
        }
      }

      return true;
    },

    //  FIXED: NO DATABASE CALL HERE (this was breaking Vercel build)
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        if (account?.provider === "google") {
          token.isRegistrationComplete = true;
          token.onboardingStep = 0;
        } else {
          token.isRegistrationComplete = (user as any).isRegistrationComplete;
          token.onboardingStep = (user as any).onboardingStep;
        }
      }

      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: String(token.id || ""),
          isRegistrationComplete: !!token.isRegistrationComplete,
          onboardingStep: token.onboardingStep || 0,
        },
      };
    }
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };