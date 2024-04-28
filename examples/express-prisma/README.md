# Express with Prisma PTSQ example

Start the PostgreSQL database:

```bash
docker compose up
```

Migrate the database (npm):

```bash
npm run prisma:migrate
```

Generate Prisma ORM client (npm):

```bash
npm run prisma:generate
```

Start the server:

```bash
npm run start:server
```

Start the client:

```bash
npm run start:client
```

Create the introspection schema:

```bash
npm run generate:schema
```
