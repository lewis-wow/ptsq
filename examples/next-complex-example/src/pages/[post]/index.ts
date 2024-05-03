import { api } from '@/api';
import { Page } from '@/components/Page';
import { GetServerSideProps } from 'next';
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

export default function Home() {
  const postListQuery = api.post.list.useQuery();

  return (
    <Page
      isLoading={postListQuery.isFetching}
      isError={!!postListQuery.error}
    ></Page>
  );
}
