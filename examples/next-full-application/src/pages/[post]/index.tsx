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
    <Page
      pageLinks={[
        { title: 'Posts', href: '/', active: false },
        { title: 'Create post', href: '/create', active: false },
        {
          title: 'Update post',
          href: `/${router.query.post}/edit`,
          active: false,
        },
      ]}
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
