import { api } from '@/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { Loader2 } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { ReactNode } from 'react';
import { match } from 'ts-pattern';
import { AlertDescription } from './ui/alert';
import { Button } from './ui/button';

export type PageProps = {
  isError?: boolean;
  isLoading?: boolean;
  children?: ReactNode;
  header?: ReactNode;
};

export const Page = ({ isError, isLoading, children, header }: PageProps) => {
  const meQuery = api.me.get.useQuery();

  return (
    <section className="w-full">
      <header className="w-full flex justify-end h-16 p-2 gap-x-2">
        {header}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              <Avatar>
                <AvatarImage src={meQuery.data?.image ?? undefined} />
                <AvatarFallback>{meQuery.data?.name?.at(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => signOut()}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <main className="p-2">
        {match({ isError, isLoading })
          .with({ isLoading: true }, () => <Loader2 />)
          .with({ isError: true }, () => <AlertDescription />)
          .otherwise(() => children)}
      </main>
    </section>
  );
};
