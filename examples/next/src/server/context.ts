import { NextApiRequest, NextApiResponse } from 'next';

export const createContext = async ({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) => {
  return {
    req,
    res,
  };
};
