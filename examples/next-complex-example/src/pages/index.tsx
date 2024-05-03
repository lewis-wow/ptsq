import { api } from '@/api';
import { Page } from '@/components/Page';
import { PostTable } from '@/components/PostTable';
import { PostSchema } from '@/validation';
import { Static } from '@ptsq/server';
import { ColumnDef } from '@tanstack/react-table';
import { GetServerSideProps } from 'next';
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
  const postListQuery = api.post.list.useQuery();

  const columns: ColumnDef<Static<typeof PostSchema>>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
      },
    ],
    [],
  );

  return (
    <Page isLoading={postListQuery.isFetching} isError={!!postListQuery.error}>
      <PostTable columns={columns} data={postListQuery.data!} />
    </Page>
  );
};

export default Index;
