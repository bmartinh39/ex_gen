# EX_GEN – Exam Generator

Stack:
- Next.js (App Router)
- TypeScript
- Prisma (PostgreSQL planned)

Project Structure:
- All application code lives under /web/src
- Business logic lives in /web/src/features
- API routes live in /web/src/app/api
- Domain layer must remain framework-agnostic
- Domain logic must not import Next.js or database code

Architecture Rules:
- Do not change architecture unless explicitly asked
- Prefer minimal, surgical edits
- Keep routes thin (no business logic inside route handlers)
- Follow official Next.js documentation for route handlers and testing
- Run `npm test` and `npm run build` before finishing any task
- Do not introduce new dependencies unless explicitly requested
- Do not modify existing domain types unless asked

Commands:
- npm run dev
- npm run build
- npm run lint
- npm test
