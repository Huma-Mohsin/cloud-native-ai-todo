# Todo Frontend - Phase II

Next.js 15+ frontend for multi-user todo application with Better Auth and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 15.1+ (App Router)
- **Language**: TypeScript 5.3+
- **Styling**: Tailwind CSS 3.4+
- **Authentication**: Better Auth with JWT
- **Testing**: Vitest, React Testing Library
- **Code Quality**: ESLint, Prettier

## Setup

### Prerequisites

- Node.js 20+
- npm/yarn/pnpm

### Installation

```bash
# Install dependencies
npm install
```

### Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=<32-char-secret>  # MUST match backend!
NODE_ENV=development
```

### Run Development Server

```bash
npm run dev
```

Application will be available at: http://localhost:3000

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Code Quality

```bash
# Lint code
npm run lint

# Type check
npm run type-check
```

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/              # Auth routes (login, signup)
│   ├── dashboard/           # Dashboard (protected)
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── TaskList.tsx
│   ├── TaskItem.tsx
│   └── TaskForm.tsx
├── lib/
│   ├── api.ts               # API client
│   ├── auth.ts              # Better Auth config
│   └── types.ts             # TypeScript types
└── hooks/
    ├── useAuth.ts           # Authentication hook
    └── useTasks.ts          # Task management hook
```

## Features

- User signup/login with JWT authentication
- Create, view, update, delete tasks
- Mark tasks as complete/pending
- Responsive design (mobile, tablet, desktop)
- Data isolation (users only see their own tasks)

## Deployment

Deploy to Vercel:

```bash
vercel deploy
```

Configure environment variables in Vercel dashboard.
