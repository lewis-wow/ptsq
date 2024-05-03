import { api } from '@/api';
import { DeletePostDialogPortal } from '@/components/DeletePostDialogPortal';
import { Page } from '@/components/Page';
import { Table } from '@/components/Table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PostSchema } from '@/validation';
import { Static } from '@ptsq/server';
import * as Dialog from '@radix-ui/react-dialog';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { ColumnDef } from '@tanstack/react-table';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useMemo } from 'react';
import { getServerSideSession } from './api/auth/[...nextauth]';

export const getServerSideProps = (async ({ req, res }) => {
  const session = await getServerSideSession({ req, res });

  if (!session) {
    return {
      redirect: {
        destination: '/signin',
        permanent: false,
      },
      props: {},
    };
  }

  return {
    props: {},
  };
}) satisfies GetServerSideProps<{}>;

const Index = () => {
  const postListQuery = api.post.list.useInfiniteQuery(
    {},
    {
      initialPageParam: 0,
      getNextPageParam: (lastPage, pages) => lastPage.nextPage,
    },
  );

  const columns: ColumnDef<Static<typeof PostSchema>>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => (
          <Link href={`/${row.original.id}`}>{row.original.title}</Link>
        ),
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <DotsHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${row.original.id}/edit`}>Edit</Link>
                </DropdownMenuItem>
                <DeletePostDialogPortal post={row.original}>
                  <DropdownMenuItem
                    onSelect={(event) => event.preventDefault()}
                  >
                    Delete
                  </DropdownMenuItem>
                </DeletePostDialogPortal>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  return (
    <Page
      isLoading={postListQuery.isLoading}
      isError={!!postListQuery.error}
      header={
        <Button asChild>
          <Link href="/create">Create post</Link>
        </Button>
      }
    >
      <Table columns={columns} data={postListQuery.data!} pageSize={2} />
    </Page>
  );
};

export default Index;
