/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    DATABASE_URL:
      'postgresql://postgres:postgres@localhost:5432/mydb?schema=public',
    NEXT_PUBLIC_PTSQ_URL: 'http://localhost:3000/api/ptsq',
  },
};

export default nextConfig;
