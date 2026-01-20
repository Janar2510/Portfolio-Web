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

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp apps/web/.env.example apps/web/.env.local
# Edit apps/web/.env.local with your Supabase credentials
```

4. Run the development server:
```bash
npm run dev
```

## Project Structure

```
/
├── apps/
│   └── web/              # Next.js application
├── packages/
│   ├── database/         # Database types and migrations
│   ├── email-templates/  # React Email templates
│   └── shared/           # Shared utilities and types
├── supabase/            # Supabase configuration and functions
└── docs/                # Documentation
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
