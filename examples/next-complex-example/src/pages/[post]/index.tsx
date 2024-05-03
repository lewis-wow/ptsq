import { api } from '@/api';
import { Page } from '@/components/Page';
import { GetServerSideProps } from 'next';
import { NextRouter, useRouter } from 'next/router';
import { getServerSideSession } from '../api/auth/[...nextauth]';

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

const Post = () => {
  const router: NextRouter & { query: { post?: string } } = useRouter();

  const postQuery = api.post.get.useQuery(
    {
      id: router.query.post!,
    },
    {
      enabled: !!router.query.post,
    },
  );

  return (
    <Page isLoading={postQuery.isFetching} isError={!!postQuery.error}></Page>
  );
};

export default Post;
