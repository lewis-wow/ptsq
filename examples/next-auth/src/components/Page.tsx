import { ReactNode } from 'react';

export type PageProps = {
  isError: boolean;
  isLoading: boolean;
  skeleton?: ReactNode;
  children?: ReactNode;
};

export const Page = ({ isError, isLoading, skeleton, children }: PageProps) => {
  if (isLoading) return skeleton ?? null;

  if (isError) return <p>Error</p>;

  return children;
};
