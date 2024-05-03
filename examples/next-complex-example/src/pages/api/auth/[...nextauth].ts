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
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
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
};

export default NextAuth(authOptions);

export const getServerSideSession = ({
  req,
  res,
}: {
  req: GetServerSidePropsContext['req'] | NextApiRequest;
  res: GetServerSidePropsContext['res'] | NextApiResponse;
}) => getServerSession(req, res, authOptions);
