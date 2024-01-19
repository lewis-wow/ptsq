export const createContext = ({ request }: { request: Request }) => {
  return {
    request,
    orm: () => {
      if (Math.random() > 0.5)
        return Promise.resolve({
          name: 'test',
          email: 'test',
        });

      return Promise.reject({
        name: 'kokos',
        email: 'kokos',
      });
    },
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
