import { api } from '@/api';
import { PostSchema } from '@/validation';
import { PostStatus } from '@prisma/client';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Static } from '@sinclair/typebox';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { useMemo } from 'react';
import { DataLoader } from './DataLoader';
import { DeletePostDialogPortal } from './DeletePostDialogPortal';
import { Table } from './Table';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export type PostTableProps = {
  filter?: {
    status?: PostStatus;
    search?: string;
  };
};

export const PostTable = ({ filter }: PostTableProps) => {
  const postListQuery = api.post.list.useQuery({ filter });

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
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => row.original.status,
      },
      {
        id: 'actions',
        header: 'Actions',
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
    <DataLoader
      isLoading={postListQuery.isLoading}
      isError={!!postListQuery.error}
    >
      <Table columns={columns} data={postListQuery.data!} pageSize={10} />
    </DataLoader>
  );
};
