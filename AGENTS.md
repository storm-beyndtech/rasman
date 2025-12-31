# Agent Guidelines for Rasman Music Platform

## Build/Lint/Test Commands
- **Build**: `npm run build` (Next.js production build)
- **Dev**: `npm run dev` (Next.js development server)
- **Lint**: `npm run lint` (ESLint with Next.js config)
- **Test**: No test framework configured yet

## Code Style Guidelines

### Imports
- Type imports first: `import type { Metadata } from "next"`
- React/Next.js imports first, then third-party libraries, then local imports
- Use `@/` path aliases for local imports
- Group imports logically with blank lines between groups

### Formatting & Types
- Strict TypeScript with explicit types
- Use `React.FC` for component type annotations
- Define interfaces for all data models
- Use Zod schemas for input validation
- Consistent indentation and spacing

### Naming Conventions
- **Components**: PascalCase (e.g., `Navbar`, `SongCard`)
- **Variables/Functions/Properties**: camelCase (e.g., `isSignedIn`, `handleScroll`)
- **Interfaces/Types**: PascalCase (e.g., `ISong`, `SongInput`)
- **Files**: PascalCase for components, camelCase for utilities

### Error Handling
- Use try-catch blocks in async functions
- Return consistent API responses: `{ success: boolean, message?: string, data?: any, error?: string }`
- Use appropriate HTTP status codes (400 for validation, 401 for auth, 403 for permissions, 404 for not found, 500 for server errors)
- Log errors to console with descriptive messages
- Handle Zod validation errors specifically

### Database & Models
- Use Mongoose with proper schema definitions
- Include validation, defaults, and indexes
- Use camelCase for field names
- Create TypeScript interfaces for all models

### Components
- Use `"use client"` directive for client components
- Prefer functional components with hooks
- Use proper TypeScript typing for props
- Follow existing patterns for state management and effects

### API Routes
- Validate all inputs with Zod schemas
- Check authentication/authorization first
- Use consistent response format
- Handle errors gracefully with proper status codes

### Security
- Validate all user inputs
- Check authentication for protected routes
- Use environment variables for sensitive data
- Never expose internal file paths or keys