# Solvia Administration Centrale

Enterprise administration platform for the Solvia ecosystem.

## Project Structure

```
solvia-admin/
├── frontend/          # Next.js App Router frontend
│   ├── src/
│   │   ├── app/       # App Router pages
│   │   ├── components/# UI components
│   │   ├── services/  # API services
│   │   ├── hooks/     # Custom React hooks
│   │   ├── store/     # Zustand stores
│   │   ├── lib/       # Utilities
│   │   ├── types/     # TypeScript types
│   │   ├── constants/ # Application constants
│   │   └── providers/ # React context providers
│   └── public/        # Static assets
├── backend/           # NestJS backend
│   ├── src/
│   │   ├── common/    # Shared utilities
│   │   ├── config/    # Configuration
│   │   ├── prisma/    # Prisma service
│   │   ├── modules/
│   │   └── main.ts    # Entry point
│   └── test/          # Test files
├── infrastructure/    # Infrastructure configuration
│   ├── docker/        # Docker configs
│   └── nginx/         # Nginx configs
├── scripts/           # Utility scripts
│   └── db/            # Database scripts
├── docs/              # Documentation
│   └── SOLVIA_ADMIN_SPEC.md
└── package.json       # Workspace root
```

## Modules

- Authentication (JWT, 2FA, RBAC)
- Internal Users
- Roles
- Permissions
- Audit Logs
- Dashboard

## Technology Stack

**Frontend:** Next.js, TypeScript, TailwindCSS, Shadcn/ui, React Query, Zustand, React Hook Form, Zod

**Backend:** NestJS, Prisma, PostgreSQL, Redis

**Authentication:** JWT, Refresh Tokens, RBAC, Two Factor Authentication

## Getting Started

Documentation is the source of truth. Read `docs/SOLVIA_ADMIN_SPEC.md` before contributing.
