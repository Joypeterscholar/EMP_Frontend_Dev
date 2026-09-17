# Git Branch Register — EMP Frontend

**Document ID:** GOV-EMP-FE-001
**Owner:** OrionLabs
**Last Updated:** 2026-06-09
**Version:** 1.0

---

## 1. Overview

This document defines the Git branch strategy for the EMP (Environmental Mapping Project) Frontend repository. It outlines branch types, purposes, naming conventions, environment mappings, CI/CD pipeline details, and access permissions for all team roles.

The frontend is a React 18 / Vite / Tailwind CSS application with Babylon.js for 3D rendering, deployed on Vercel and Docker on EC2.

---

## 2. Repository Info

| Field | Details |
|-------|---------|
| **Repository** | environmental-mapping-web-frontend-001 |
| **URL** | https://github.com/Orion-GIT/environmental-mapping-web-frontend-001 |
| **Organization** | Orion-GIT |
| **Technology** | React 18 / Vite / Tailwind CSS / Babylon.js / MUI |
| **Default Branch** | `main` |
| **Current Branch** | `update-url` |
| **Docker Image** | `oriontechmen/env-v2-fe:dev` |
| **Deployment** | Vercel (staging) + Docker on EC2 |
| **CI/CD** | GitHub Actions (`.github/workflows/pipeline.yml` + `deploy.yml`) |

---

## 3. Branch Types & Purpose

### 3.1 Main Branches

| Branch | Purpose | Deploys To | Environment |
|--------|---------|------------|-------------|
| `main` | Stable production-ready code | Vercel (production) + Docker on EC2 | Production |
| `development` | Active development integration | Docker on EC2 (dev) | Development |

### 3.2 Supporting Branches

| Branch | Purpose | Deploys To | Environment |
|--------|---------|------------|-------------|
| `staging` | Pre-production validation & QA | Docker on EC2 (staging) | Staging |

### 3.3 Feature Branches

| Branch Pattern | Purpose | Example |
|---------------|---------|---------|
| `feat/<feature-name>` | New feature development | `feat/dashboard-update` |
| `fix/<bug-description>` | Bug fixes | `fix/model-load` |
| `hotfix/<issue>` | Urgent production fixes | `hotfix/stale-session` |
| `<descriptive-name>` | Ad-hoc feature/fix branches | `new-dashboard`, `ade-branch` |

---

## 4. Existing Branches

### 4.1 Active Branches

| Branch | Status | Last Activity | Purpose |
|--------|--------|---------------|---------|
| `main` | **Active (Default)** | Recent | Production-ready code; triggers Vercel deployment |
| `update-url` | Active (Current) | Current | URL configuration updates |
| `staging` | Active | Recent | Pre-production staging environment |
| `development` | Active | Recent | Development integration branch |

### 4.2 Feature & Fix Branches

| Branch | Status | Purpose |
|--------|--------|---------|
| `new-dashboard` | Active | New dashboard implementation |
| `ade-branch` | Active | Ad-hoc development |
| `new-facility-bug-fix` | Active (Merged PR #29) | Facility section bug fixes |
| `new-essy-bug-fix` | Active | Essy-related bug fixes |
| `fix-model-load` | Active | 3D model loading fix |
| `oct-13-fixes` | Archive | October 13 fixes |
| `fix-stale-session` | Active | Stale session handling fix |
| `add-time-to-tagging` | Active | Time feature for tagging |
| `update-export-clean` | Active | Export cleanup updates |
| `export-update` | Active | Export functionality updates |
| `new-bug-fixes` | Active | General bug fixes |
| `01-new-bug-fixes` | Active | Bug fixes batch |
| `completed-fecility-sections` | Active | Facility sections completion |
| `report-table-formatted` | Active | Report table formatting |
| `renamed-location` | Active | Location renaming feature |
| `version002backup` | Archive | Version 002 backup |
| `relativity-new` | Active | Relativity feature (new) |
| `relativity-version-2` | Active | Relativity v2 |
| `relativity` | Active | Relativity feature |
| `feat/dashboard-update` | Active | Dashboard update feature |
| `main-backup` | Archive | Main branch backup |
| `env-mapping` | Active | Core environmental mapping |
| `version-1.0` | Archive | Version 1.0 snapshot |
| `develop` | Active | Development branch (alternate) |

### 4.3 Branch Count Summary

| Category | Count |
|----------|-------|
| Total remote branches | 31 |
| Active feature branches | 24 |
| Archive branches | 4 |
| Core branches (`main`, `development`, `staging`) | 3 |

---

## 5. CI/CD Pipeline

### 5.1 Development Pipeline (Docker)

- **File:** `.github/workflows/pipeline.yml`
- **Pipeline Name:** CI/CD Pipeline EMP-V2-FE
- **Trigger:** Push or PR to `development` branch

| Stage | Step | Action |
|-------|------|--------|
| **Build** | 1 | Checkout code (`actions/checkout@v3`) |
| | 2 | Login to DockerHub (`docker/login-action@v2`) |
| | 3 | Build & push Docker image → `oriontechmen/env-v2-fe:dev` |
| **Deploy** | 4 | SSH to EC2 (`appleboy/ssh-action@master`) |
| | 5 | Clean up containers (`prune.sh`) |
| | 6 | `git checkout development && git pull origin development` |
| | 7 | `docker-compose up -d` |

### 5.2 Production Pipeline (Vercel)

- **File:** `.github/workflows/deploy.yml`
- **Pipeline Name:** deploy
- **Trigger:** Push to `main` branch or manual (`workflow_dispatch`)

| Stage | Step | Action |
|-------|------|--------|
| **Build** | 1 | Checkout code (`actions/checkout@v2`) |
| | 2 | Setup Node.js 18 (`actions/setup-node@v4`) |
| | 3 | Install dependencies (`npm ci`) |
| | 4 | Install Vercel CLI globally |
| **Deploy** | 5 | `vercel pull --yes --environment=production` |
| | 6 | `vercel build --prod` |
| | 7 | `vercel deploy --prod --prebuilt` |

### 5.3 Vercel Configuration

- **Org ID:** Stored in `VERCEL_ORG_ID` secret
- **Project ID:** Stored in `VERCEL_PROJECT_ID` secret
- **Token:** Stored in `VERCEL_TOKEN` secret

---

## 6. Environment Configurations

| Environment | Branch | Deployment Target | URL |
|-------------|--------|-------------------|-----|
| Development | `development` | Docker on EC2 | EC2 public IP |
| Staging | `staging` / `main` | Docker on EC2 + Vercel | `environmental-mapping-web-staging.vercel.app` |
| Production | `main` | Vercel (production) | Custom domain / Vercel URL |

### 6.1 Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |
| `VITE_APP_TITLE` | Application title |
| `VITE_GOOGLE_MAPS_KEY` | Google Maps API key |
| Other `VITE_*` | Vite environment variables |

### 6.2 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| React | ^18.2.0 | UI framework |
| Vite | ^5.2.9 | Build tool |
| Tailwind CSS | ^3.4.1 | Styling |
| Babylon.js | 7.4.0 / 6.46.0 | 3D rendering |
| MUI | ^5.15.10 | UI component library |
| React Router | ^6.14.2 | Client-side routing |
| TanStack Query | ^4.32.6 | Server state management |
| Redux Toolkit | ^1.9.5 | Client state management |
| Axios | ^1.4.0 | HTTP client |
| Recharts | ^2.12.1 | Data visualization |

---

## 7. Access Level Permissions

| Role | `main` | `development` | `staging` | `feat/*` | `hotfix/*` |
|------|--------|--------------|-----------|----------|------------|
| **Tech Lead** | Merge + Push | Merge + Push | Merge + Push | Create + Push | Create + Push |
| **Senior Developer** | — | Merge + Push | Merge + Push | Create + Push | Create + Push |
| **Developer** | — | Merge + Push | — | Create + Push | — |
| **Junior Developer** | — | — | — | Create (PR only) | — |
| **QA Engineer** | Read only | Read only | Read only | — | — |
| **DevOps Engineer** | Merge + Push | Merge + Push | Merge + Push | — | Create + Push |
| **Project Manager** | Read only | Read only | Read only | Read only | Read only |

---

## 8. Branch Workflow

```
main (production — Vercel)
  ↑
  │  PR + QA approval + Vercel preview verified
staging
  ↑
  │  PR + code review
development
  ↑
  │  PR + peer review
feat/* / fix/*
```

### 8.1 Merge Strategy

| Source → Target | Strategy | Reason |
|----------------|----------|--------|
| `feat/*` → `development` | Squash merge | Clean commit history |
| `development` → `staging` | Merge commit | Preserve history |
| `staging` → `main` | Merge commit | With release tag |

---

## 9. Naming Conventions

| Type | Format | Example |
|------|--------|---------|
| Feature | `feat/<short-description>` | `feat/dashboard-update` |
| Bug Fix | `fix/<short-description>` | `fix/model-load` |
| Hotfix | `hotfix/<short-description>` | `hotfix/stale-session` |
| Release | `release/v<version>` | `release/v1.0.0` |
| Descriptive | `<name>` | `new-dashboard`, `ade-branch` |

> **Note:** This repository uses a mix of conventional (`feat/`, `fix/`) and descriptive branch naming. New branches should follow conventional format.

---

## 10. Pull Request Checklist

- [ ] Branch is up-to-date with target branch
- [ ] Code compiles without errors (`npm run build`)
- [ ] ESLint passes (`npm run lint`) — max 0 warnings
- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] No hardcoded secrets or credentials
- [ ] Environment variables documented
- [ ] UI tested on Chrome, Firefox, and Safari
- [ ] 3D rendering (Babylon.js) tested on target devices
- [ ] Responsive design verified
- [ ] Code review completed by at least 1 peer
- [ ] QA approval obtained (for `staging`/`main` merges)
- [ ] Vercel preview deployment reviewed (if applicable)

---

## 11. Rules & Guidelines

1. **Never commit directly to `main`** — all changes go through `development` via PR
2. **Delete merged feature branches** to keep the repository clean
3. **Tag releases** on `main` with semantic versioning (`v1.0.0`)
4. **Protect `main` and `staging` branches** with required reviews and status checks
5. **Use conventional commit messages** for automated changelog generation
6. **Keep feature branches short-lived** (< 2 weeks recommended)
7. **Rebase feature branches** before merging to avoid merge conflicts
8. **Never push secrets** to the repository — use Vercel environment variables and GitHub Secrets
9. **New branches should use conventional naming** (`feat/`, `fix/`, `hotfix/`)
10. **Archive stale branches** to reduce repository clutter
11. **Vercel preview deployments** should be reviewed before merging to `main`

---

*Document maintained by: OrionLabs*
*Review cycle: Monthly or upon significant branch strategy changes*
