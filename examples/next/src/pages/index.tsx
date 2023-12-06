import { client } from '@/client';
import { TextField } from '@/components/TextField';
import { createUserSchema } from '@/server/validation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Formik } from 'formik';
import { toFormikValidate } from 'zod-formik-adapter';

export default function Index() {
  const createUserMutation = useMutation<
    Awaited<ReturnType<typeof client.user.create.mutate>>,
    Error,
    Parameters<typeof client.user.create.mutate>[0]
  >({
    mutationKey: ['users'],
    mutationFn: (params) => client.user.create.mutate(params),
  });

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: (params) => client.user.create.mutate(params),
  });

  return (
    <main>
      <h2>Vytvořit uživatele</h2>
      <Formik
        initialValues={{
          name: '',
          email: '',
        }}
        validate={toFormikValidate(createUserSchema)}
        onSubmit={(values) => {
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
    </main>
  );
}
