# Contributing to OneChat

OneChat is open source and contributions are welcome. This doc explains how to get involved.

## Reporting Bugs

Open a GitHub Issue and include:
- What you did
- What you expected to happen
- What actually happened
- Your OS, Node version, and browser if relevant

## Suggesting Features

Open an Issue with the `enhancement` label. Explain the problem you're trying to solve, not just the feature itself.

## Local Setup

1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in your values
4. Run `npx prisma migrate dev`
5. Run `npm run dev`

## Submitting a PR

- Branch naming: `fix/description` or `feature/description`
- Keep PRs focused — one thing per PR
- Test your changes before submitting
- Write a clear description of what you changed and why

## Code Style

- Use Tailwind utility classes, avoid custom CSS where possible
- Follow Next.js App Router conventions
- Keep components small and focused

## Licence

By contributing, you agree that your contributions will be licenced under AGPL-3.0.