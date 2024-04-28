import { api } from '@/api';
import { CreatePost } from '@/components/CreatePost';
import { DeletePost } from '@/components/DeletePost';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UpdatePost } from '@/components/UpdatePost';

export default function Home() {
  const listPostsQuery = api.post.list.useQuery();

  return (
    <main className="container p-2">
      <div className="flex gap-x-4">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {listPostsQuery.data && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listPostsQuery.data.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>{post.title}</TableCell>
                        <TableCell>{post.content}</TableCell>
                        <TableCell>
                          <div className="flex gap-x-2">
                            <UpdatePost post={post} />

                            <DeletePost post={post} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Create post</CardTitle>
            </CardHeader>
            <CardContent>
              <CreatePost />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
