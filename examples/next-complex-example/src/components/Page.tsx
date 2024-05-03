import { api } from '@/api';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';
import { match } from 'ts-pattern';
import { AlertDescription } from './ui/alert';
import { Button } from './ui/button';

export type PageProps = {
  isError?: boolean;
  isLoading?: boolean;
  children?: ReactNode;
};

export const Page = ({ isError, isLoading, children }: PageProps) => {
  const meQuery = api.me.get.useQuery();

  return (
    <section className="w-full">
      <header className="w-full flex justify-end h-16 p-2 gap-x-2">
        <Button asChild>
          <Link href="/create">Create post</Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              <Avatar>
                <AvatarImage src={meQuery.data?.image} />
                <AvatarFallback>{meQuery.data?.name?.at(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Logout</DropdownMenuItem>
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
