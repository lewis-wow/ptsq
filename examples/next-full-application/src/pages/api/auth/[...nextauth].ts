import { proxyClient } from '@/api';
import { env } from '@/env';
import { prisma } from '@/ptsq/prisma';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next';
import NextAuth, {
  DefaultSession,
  getServerSession,
  NextAuthOptions,
} from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    image?: string | null;
    name: string | null;
  }
}

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: DefaultSession['user'] & {
      id: string;
    };
  }

  interface User {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      id: 'credentials-signin',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = await proxyClient.signin.mutate(credentials!);

        console.log('user', user);

        return user;
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      id: 'credentials-signup',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = await proxyClient.signup.mutate(credentials!);

        return user;
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user, trigger, session }) => {
      if (trigger === 'update') {
        if (session?.name) token.name = session.name;
        if (session?.image) token.image = session.image;

        return token;
      }

      const isSignIn = user ? true : false;

      if (!isSignIn) return token;

      return {
        ...token,
        id: user.id,
        image: user.image,
        name: user.name,
      };
    },
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
        },
      };
    },
  },
  secret: process.env.NEXT_AUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
};

export default NextAuth(authOptions);

export const getServerSideSession = ({
  req,
  res,
}: {
  req: GetServerSidePropsContext['req'] | NextApiRequest;
  res: GetServerSidePropsContext['res'] | NextApiResponse;
}) => getServerSession(req, res, authOptions);
