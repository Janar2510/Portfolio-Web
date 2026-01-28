# Portfolio Web

A multi-tenant portfolio, project management, and CRM platform built with Next.js and Supabase.

## Architecture

See [docs/architecture.md](./docs/architecture.md) for detailed architecture documentation.

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Supabase account

### Installation

### Installation & Setup

1. **Clone & Setup**:
   ```bash
   git clone <repo-url>
   cd portfolio-web
   npm run setup
   ```

2. **Configure Environment**:
   - Open `.env.local`
   - Add your Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

3. **Run**:
   ```bash
   npm run dev
   ```

## Development Runbook

### 1. Setup & Run
```bash
# First time setup
npm run setup

# Run development server
npm run dev

# Run type checking
npm run type-check
```

### 2. Database (Supabase)
Helper scripts are located in `scripts/`:

```bash
# Setup local Supabase (requires Docker)
./scripts/setup-supabase.sh

# Apply all migrations to current env
./scripts/apply-all-migrations.sh

# Verify connection
./scripts/verify-supabase.sh
```

### 3. Environment
- Copy `.env.example` to `.env.local`
- Populate `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart dev server after changes

### Deployment

This project is optimized for deployment on Vercel.

1. **Connect to Vercel**: Connect your repository to Vercel.
2. **Environment Variables**: Configure the following in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_PORTFOLIO_BASE_URL`: Set this to your production URL (e.g., `https://your-app.vercel.app`)
3. **Build Settings**: Vercel should automatically detect Next.js. If not, use:
   - Framework: `Next.js`
   - Build Command: `npm run build`
   - Install Command: `npm install`

## Project Structure

```
/
├── app/                  # Next.js App Router (Admin & Public)
├── src/
│   ├── components/       # UI Components
│   ├── domain/           # Business Logic (CRM, Builder, Renderer)
│   ├── hooks/            # Custom Hooks
│   ├── lib/              # Shared Utilities (Supabase, Email, SEO)
│   └── stores/           # State Management
├── packages/             # External packages
├── infra/                # Infrastructure (Database migrations)
└── docs/                 # Documentation
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run linter
- `npm run type-check` - Type check all packages

## Documentation

- [Architecture](./docs/architecture.md)
- [API Contracts](./docs/api-contracts.md)
- [AI Rules](./docs/ai-rules.md)

## License

Private
