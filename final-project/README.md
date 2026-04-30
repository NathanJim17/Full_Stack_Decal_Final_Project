This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

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

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Google Calendar Sync (MVP)

Google Calendar event creation uses Google OAuth through Supabase (not API keys). Ensure:

- Google Calendar API is enabled in your Google Cloud project.
- Supabase Google provider uses your OAuth client ID and client secret.
- The OAuth sign-in flow requests the scope `https://www.googleapis.com/auth/calendar.events`.
- Users re-consent after scope updates (sign out/in again, or revoke app access in Google Account permissions).

The review page sync flow sends the current Supabase access token plus Google provider token to `POST /api/documents/sync-calendar`.

### Document parser (Vercel Python function)

Document parsing runs inside this same Vercel project via the Python serverless endpoint `POST /api/parse`.

Required Vercel environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- Optional: `GEMINI_MODEL` (default `gemini-2.0-flash`)
- Optional: `MAX_SYLLABUS_CHARS` (default `25000`)

Optional compatibility variable:

- `DOCUMENT_PARSER_URL` (defaults to `/api/parse` when omitted)

### Course schedule sync

Lecture times are now manual user input at the course level (not parser extracted).
From the document review page, users enter and save:

- course start date
- lecture days (`MO..SU`) and start/end times
- optional lecture location
- optional section/discussion/lab schedule (custom label, days, times, optional location)
- term end date (used as recurrence end for lecture/section events)

Apply the schema file in Supabase SQL Editor before using this flow:
- `course_schedule_schema.sql`
