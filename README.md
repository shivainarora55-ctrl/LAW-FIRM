This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deployment notes

The current JSON storage layer requires a persistent disk. It works on a VPS or on Render or Railway when a persistent disk is attached and `DATA_DIR` points to that disk. Serverless hosts such as Vercel use read-only or ephemeral filesystems; replace `src/lib/storage` with a database and cloud file storage before deploying there.

Required environment variables:

- `SESSION_SECRET`: at least 32 random bytes encoded as hexadecimal.
- `ADMIN_SESSION_SECRET`: a separate 32-byte-or-longer random hexadecimal secret for lawyer sessions.
- `DATA_DIR`: storage directory; defaults to `./data`.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`: SMTP settings for email OTP delivery. All five are required to send email in production.

Lawyers are provisioned locally by an authorised operator; there is no public lawyer registration route. Run `npm run create-admin` to create an account or update an existing lawyer password. The script reads `.env.local` and stores only a bcrypt hash in `DATA_DIR/admins.json`.
