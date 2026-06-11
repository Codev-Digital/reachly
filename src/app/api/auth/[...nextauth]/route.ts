import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),

    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid email or password');
        }

        await connectDB();
        const user = await User.findOne({
          email: credentials.email.toLowerCase().trim(),
        });

        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        const isMatch = await user.comparePassword(credentials.password);
        if (!isMatch) {
          throw new Error('Invalid email or password');
        }

        if (!user.isVerified) {
          throw new Error('Please verify your email before signing in.');
        }

        if (!user.isRegistrationComplete) {
          throw new Error(
            'Your registration is incomplete. Please finish setting up your account.'
          );
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],

  session: { strategy: 'jwt' },

  // Support both NEXTAUTH_SECRET (standard) and AUTH_SECRET
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,

  pages: {
    signIn: '/login',
    error: '/login',
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email && user.name) {
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

    async jwt({ token, user, trigger }) {
      // On initial sign-in, stamp DB fields onto the token so middleware
      // can read them without a DB round-trip on every request.
      if (user) {
        token.id = user.id;
      }

      // Refresh DB fields on initial sign-in OR explicit session update
      if (user || trigger === 'update') {
        await connectDB();
        const email = token.email as string;
        const dbUser = await User.findOne({ email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.isVerified = dbUser.isVerified;
          token.isRegistrationComplete = dbUser.isRegistrationComplete;
          token.onboardingStep = dbUser.onboardingStep;
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Propagate token fields into the session object for client use
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).isVerified = token.isVerified;
        (session.user as any).isRegistrationComplete = token.isRegistrationComplete;
        (session.user as any).onboardingStep = token.onboardingStep;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
