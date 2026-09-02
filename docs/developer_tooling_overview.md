# Developer Tooling

This repository includes a standard set of developer tools to ensure consistency, security, and high code quality across all services. Below is a brief explanation of each tool and why we’ve chosen it.

## AWS CDK (Infrastructure as Code)
**What it is:** A framework for defining AWS infrastructure using TypeScript.

**Why we use it:**
- Lets engineers define infrastructure using familiar language and patterns
- Encourages reusable, composable infrastructure constructs
- Integrates tightly with AWS services and CloudFormation

**Docs:** https://docs.aws.amazon.com/cdk/v2/guide/home.html

---

## pnpm + Corepack (Package Management)
**What it is:** A fast, disk-efficient Node.js package manager, managed via Corepack.

**Why we use it:**
- Faster installs and better monorepo support than npm/yarn
- Deterministic dependency resolution via lockfiles
- Corepack ensures everyone uses the same pnpm version

**Docs:** https://pnpm.io/motivation | https://github.com/nodejs/corepack

---

## ESLint & Prettier (Linting & Formatting)
**What they are:** ESLint enforces code quality rules, Prettier handles code formatting.

**Why we use them:**
- Keeps code style consistent across teams
- Catches common bugs and anti-patterns early
- Reduces bike-shedding in code reviews

**Docs:** https://eslint.org/docs/latest | https://prettier.io/docs

---

## Pre-commit (Git Hooks)
**What it is:** A framework for running checks automatically before commits are made.

**Why we use it:**
- Prevents bad commits from entering the repo
- Ensures linting, formatting, and security checks run locally
- Shifts quality checks left in the development workflow

**Docs:** https://pre-commit.com

---

## Vitest (Unit Testing)
**What it is:** A fast, modern unit testing framework for TypeScript and JavaScript.

**Why we use it:**
- Very fast execution and watch mode
- Native TypeScript support
- Jest-compatible API with better performance

**Docs:** https://vitest.dev/guide/

---

## Checkov (IaC Security Scanning)
**What it is:** A static analysis tool for Infrastructure as Code.

**Why we use it:**
- Detects common security and compliance issues in CDK-generated templates
- Helps catch misconfigurations before deployment
- Integrates well with CI pipelines

**Docs:** https://www.checkov.io/1.Welcome/Quick%20Start.html

---

## detect-secrets (Secret Scanning)
**What it is:** A tool from Yelp to prevent secrets being committed to source control.

**Why we use it:**
- Scans commits for API keys, tokens, and credentials
- Reduces the risk of accidental secret leaks
- Runs automatically as part of pre-commit hooks

**Docs:** https://github.com/Yelp/detect-secrets

---

This tooling set represents our recommended defaults. Teams are encouraged to contribute improvements, but deviations should be intentional and documented.
