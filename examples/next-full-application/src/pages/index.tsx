import { Page } from '@/components/Page';
import { PostTable } from '@/components/PostTable';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostStatus } from '@prisma/client';
import { Search } from 'lucide-react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
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
  const [searchValue, setSearchValue] = useState('');
  const [search] = useDebounce(searchValue, 1000);

  return (
    <Page
      pageLinks={[
        { title: 'Posts', href: '/', active: true },
        { title: 'Create post', href: '/create', active: false },
      ]}
    >
      <Tabs defaultValue="all">
        <div className="flex justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
          </TabsList>

          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </div>
        </div>

        <Card className="mt-2">
          <CardHeader>
            <CardTitle>Posts</CardTitle>
            <CardDescription>Manage your posts.</CardDescription>
          </CardHeader>
          <CardContent>
            <TabsContent value="all">
              <PostTable
                filter={{ search: search.length === 0 ? undefined : search }}
              />
            </TabsContent>
            <TabsContent value="published">
              <PostTable
                filter={{
                  status: PostStatus.PUBLISHED,
                  search: search.length === 0 ? undefined : search,
                }}
              />
            </TabsContent>
            <TabsContent value="draft">
              <PostTable
                filter={{
                  status: PostStatus.DRAFT,
                  search: search.length === 0 ? undefined : search,
                }}
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </Page>
  );
};

export default Index;
