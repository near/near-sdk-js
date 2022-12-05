# Tooling

This document describes at a high level some the key tools used across `near-js`.

## Package Manager - [PNPM](https://pnpm.io/)

PNPM is a package manager focused on fast installations while still being disk efficient. It manages dependency installations across the monorepo as well as linking interdependent packages. Unlike other package managers, PNPM creates a non-flat `node_modules` structure which ensures packages only have access to dependencies defined in their `package.json`.

## Automation - [GitHub Actions](https://github.com/features/actions)

Github Actions is used to automate various tasks including PR checks (linting, type checks, and tests).
