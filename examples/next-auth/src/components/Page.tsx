import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';
import { match } from 'ts-pattern';
import { AlertDescription } from './ui/alert';

export type PageProps = {
  isError?: boolean;
  isLoading?: boolean;
  children?: ReactNode;
};

export const Page = ({ isError, isLoading, children }: PageProps) => {
  return (
    <main className="w-full h-screen flex justify-center items-center">
      {match({ isError, isLoading })
        .with({ isLoading: true }, () => <Loader2 />)
        .with({ isError: true }, () => <AlertDescription />)
        .otherwise(() => children)}
    </main>
  );
};
