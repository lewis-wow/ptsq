import { api } from '@/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { PersonIcon } from '@radix-ui/react-icons';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { ReactNode } from 'react';
import { Button } from './ui/button';

export type PageLink = {
  href: string;
  title: string;
  active: boolean;
};

export type PageProps = {
  children?: ReactNode;
  pageLinks?: PageLink[];
};

export const Page = ({ children, pageLinks }: PageProps) => {
  const meQuery = api.me.get.useQuery();

  return (
    <section className="w-full">
      <header className="w-full flex justify-between h-16 p-2 gap-x-2">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          {pageLinks?.map((pageLink) => (
            <Link
              key={pageLink.href}
              href={pageLink.href}
              className={cn(
                'text-muted-foreground transition-colors hover:text-foreground',
                {
                  'text-foreground': pageLink.active,
                },
              )}
            >
              {pageLink.title}
            </Link>
          ))}
        </nav>
        {meQuery.data && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Avatar>
                  <AvatarImage src={meQuery.data?.image ?? undefined} />
                  <AvatarFallback>
                    <PersonIcon />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => signOut()}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>
      <main className="p-2">{children}</main>
    </section>
  );
};
