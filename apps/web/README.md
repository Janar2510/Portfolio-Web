# Portfolio Web Application

Next.js 14 application for the Portfolio, Project Management, and CRM platform.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## Features

- ✅ Next.js 14 with App Router
- ✅ TypeScript with strict mode
- ✅ Tailwind CSS + Shadcn UI
- ✅ i18n support (English, Estonian)
- ✅ Supabase integration
- ✅ ESLint + Prettier
- ✅ Realtime subscriptions

## Development

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `components/` - React components (UI, portfolio, projects, CRM)
- `lib/` - Utilities, services, Supabase clients
- `hooks/` - Custom React hooks
- `stores/` - Zustand state management
- `messages/` - i18n translation files

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- `npm run format` - Format with Prettier
- `npm run type-check` - TypeScript type checking
