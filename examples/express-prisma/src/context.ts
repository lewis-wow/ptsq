import { prisma } from './prisma';

export const createContext = ({ request }: { request: Request }) => {
  return {
    request,
    prisma,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
