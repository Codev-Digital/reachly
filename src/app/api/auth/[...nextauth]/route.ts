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
          approvalStatus: user.approvalStatus,
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
          // Mutate user object to pass DB fields to jwt callback
          (user as any).isRegistrationComplete = existingUser.isRegistrationComplete;
          (user as any).onboardingStep = existingUser.onboardingStep;
          (user as any).approvalStatus = existingUser.approvalStatus;
        }
      }

      return true;
    },

    //  FIXED: NO DATABASE CALL HERE (this was breaking Vercel build)
    async jwt({ token, user, account, trigger, session }) {
      if (trigger === "update" && session?.approvalStatus) {
        token.approvalStatus = session.approvalStatus;
      }

      if (user) {
        token.id = user.id;
        token.email = user.email;
        if (account?.provider === "google") {
          token.isRegistrationComplete = (user as any).isRegistrationComplete ?? true;
          token.onboardingStep = (user as any).onboardingStep ?? 0;
          token.approvalStatus = (user as any).approvalStatus ?? 'none';
        } else {
          token.isRegistrationComplete = (user as any).isRegistrationComplete;
          token.onboardingStep = (user as any).onboardingStep;
          token.approvalStatus = (user as any).approvalStatus;
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
          approvalStatus: token.approvalStatus || 'none',
        },
      };
    }
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };