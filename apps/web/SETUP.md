# Project Setup Guide

## Prerequisites

- Node.js 18+
- npm 9+ (or pnpm/yarn)
- Supabase account (for database)

## Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. **Run database migrations:**

```bash
# If using Supabase CLI locally
supabase start
supabase db reset

# Or apply migrations to your project
supabase db push
```

4. **Start development server:**

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Type check with TypeScript

## Project Structure

```
apps/web/
├── app/                    # Next.js App Router
│   ├── [locale]/          # i18n routes (en, et)
│   ├── api/               # API routes
│   └── sites/             # Dynamic portfolio sites
├── components/
│   ├── ui/                # Shadcn UI components
│   ├── portfolio/         # Portfolio components
│   ├── projects/          # Project management components
│   └── crm/               # CRM components
├── lib/
│   ├── supabase/          # Supabase clients
│   ├── services/          # Service layer
│   └── utils/             # Utilities
├── hooks/                 # React hooks
├── stores/                # Zustand stores
└── messages/              # i18n translations
```

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn UI
- **i18n:** next-intl
- **Database:** Supabase (PostgreSQL)
- **State Management:** Zustand + React Query
- **Form Validation:** Zod
- **Drag & Drop:** dnd-kit

## Adding Shadcn UI Components

To add new Shadcn UI components:

```bash
npx shadcn-ui@latest add [component-name]
```

Example:

```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
```

## i18n Setup

The project supports English (`en`) and Estonian (`et`) by default.

- Add translations in `messages/[locale].json`
- Use translations in components:

  ```tsx
  import { useTranslations } from 'next-intl';

  const t = useTranslations('common');
  return <h1>{t('welcome')}</h1>;
  ```

## Code Style

- **Prettier:** Auto-formats on save (configure in your editor)
- **ESLint:** Next.js recommended rules
- **TypeScript:** Strict mode enabled

## Development Workflow

1. Create feature branch
2. Make changes
3. Run `npm run lint` and `npm run type-check`
4. Format code with `npm run format`
5. Commit and push
