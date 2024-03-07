import { getNextAuthServerSideSession } from '@/pages/api/auth/[...nextauth]';
import { NextApiRequest, NextApiResponse } from 'next';

export const createContext = async ({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) => {
  const session = await getNextAuthServerSideSession(req, res);

  return {
    req,
    res,
    session,
  };
};
