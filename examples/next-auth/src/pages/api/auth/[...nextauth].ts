import { env } from '@/env';
import { prisma } from '@/server/prisma';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next';
import NextAuth, { getServerSession, NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
    }),
  ],
};

export default NextAuth(authOptions);

export const getServerSideSession = ({
  req,
  res,
}: {
  req: GetServerSidePropsContext['req'] | NextApiRequest;
  res: GetServerSidePropsContext['res'] | NextApiResponse;
}) => getServerSession(req, res, authOptions);
