import { client } from '@/client';
import { TextField } from '@/components/TextField';
import { createUserSchema } from '@/server/validation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Formik } from 'formik';
import { toFormikValidate } from 'zod-formik-adapter';

export default function Index() {
  const queryClient = useQueryClient();

  const createUserMutation = useMutation<
    Awaited<ReturnType<typeof client.user.create.mutate>>,
    Error,
    Parameters<typeof client.user.create.mutate>[0]
  >({
    mutationKey: ['users'],
    mutationFn: (params) => client.user.create.mutate(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteUserMutation = useMutation<
    Awaited<ReturnType<typeof client.user.delete.mutate>>,
    Error,
    Parameters<typeof client.user.delete.mutate>[0]
  >({
    mutationKey: ['users'],
    mutationFn: (params) => client.user.delete.mutate(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: () => client.user.list.query({}),
  });

  return (
    <main>
      <h2>Vytvořit uživatele</h2>
      <Formik
        validateOnMount
        enableReinitialization
        initialValues={{
          name: '',
          email: '',
        }}
        validate={toFormikValidate(createUserSchema)}
        onSubmit={async (values) => {
          createUserMutation.mutate(values);
        }}
      >
        {({ isSubmitting, isValid, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <TextField name="name" />
            <TextField name="email" type="email" />

            <button type="submit" disabled={isSubmitting || !isValid}>
              Create user
            </button>
          </form>
        )}
      </Formik>

      <ul>
        {usersQuery.data?.map((user) => (
          <li key={user.id}>
            <span>
              {user.name} - {user.email}
            </span>
            <button onClick={() => deleteUserMutation.mutate({ id: user.id })}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
