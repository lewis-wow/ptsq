# Next.js PTSQ example

Generate client ID and secret from GitHub and assign them to env variables:

```txt
GITHUB_ID=""
GITHUB_SECRET=""
```

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

Run the application (npm):

```bash
npm run dev
```
