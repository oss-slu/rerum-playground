# CI/CD Overview

This document provides an overview of the Continuous Integration and Continuous Delivery (CI/CD) tools used in the Rerum Playground project. These tools help ensure that the codebase remains clean, secure, and easy to maintain.

---

## 1. Automated Code Quality Checks (ESLint + Prettier)

The project uses:

- **ESLint** for detecting code issues and enforcing consistent JavaScript rules  
- **Prettier** for automatic code formatting  

### How it works:
When a contributor pushes code or opens a pull request:
- The GitHub Actions workflow runs `npm run lint`
- ESLint checks all JavaScript files under `web/`
- Prettier ensures that formatting rules are followed
- If errors are found, the workflow fails and the PR cannot be merged until fixed

---

## 2. GitHub Actions Workflow

The repository contains a GitHub Actions workflow (`lint.yml`) that runs automatically on:

- Any push to the repository  
- Any pull request targeting `main`  

### This workflow:
- Installs Node.js
- Installs dependencies
- Runs ESLint
- Fails if there are violations

**Purpose:** Prevent low-quality or unsafe code from being merged.

---

## 3. Dependabot: Dependency and Security Updates

Dependabot is configured to check for:

- Outdated npm dependencies  
- Outdated GitHub Actions versions  

### What it does:
- Automatically opens pull requests to update packages
- Helps prevent vulnerabilities
- Reduces maintenance burden

Dependabot runs weekly.

---

## 4. Local Developer Workflow

Developers are expected to:
- Run `npm install` when setting up the project  
- Use `npm run lint` to check their code before committing  
- Fix issues until the lint workflow passes  

Pre-commit hooks (if enabled in the future) will automate this locally.

---

## 5. Purpose of CI/CD in this Project

The CI/CD pipeline helps:
- Keep the codebase readable and consistent
- Catch issues early in the development process
- Ensure contributors follow the same coding standards
- Improve project quality for future maintainers
- Protect the main branch from accidental errors

---

## 6. How to Fix CI Failures

If a GitHub Actions check fails:
1. Open the “Actions” tab in GitHub  
2. Click the failed workflow run  
3. Read the linting errors  
4. Fix the relevant files locally  
5. Run `npm run lint`  
6. Commit and push the changes  

---

This CI/CD system ensures that Rerum Playground remains stable, clean, and easy for new contributors to work with.
