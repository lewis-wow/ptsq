import { api } from '@/api';
import { Page } from '@/components/Page';
import { Button } from '@/components/ui/button';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
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
    <Page
      isLoading={postQuery.isLoading}
      isError={!!postQuery.error}
      header={
        <Button asChild>
          <Link href={`/${router.query.post}/edit`}>Edit post</Link>
        </Button>
      }
    >
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        {postQuery.data?.title}
      </h1>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        {postQuery.data?.content}
      </p>
    </Page>
  );
};

export default Post;
