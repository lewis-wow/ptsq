import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';
import { match } from 'ts-pattern';
import { AlertDescription } from './ui/alert';

export type DataLoaderProps = {
  isLoading?: boolean;
  isError?: boolean;
  children?: ReactNode;
};

export const DataLoader = ({
  isLoading,
  isError,
  children,
}: DataLoaderProps) => {
  return match({ isError, isLoading })
    .with({ isLoading: true }, () => (
      <div className="flex justify-center items-center w-full">
        <Loader2 />
      </div>
    ))
    .with({ isError: true }, () => <AlertDescription />)
    .otherwise(() => children);
};
