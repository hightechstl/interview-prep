# RolePrep — Interactive Interview Study Guides

An extensible, interactive platform for beginner-first job interview study guides. The first available role track is **IT Infrastructure Engineer — RMA & Hardware Diagnostics**.

## What is included

- A 12-question baseline and final assessment with explanations
- Eight extensive modules with 48 teaching sections covering server architecture, memory/ECC, power and thermals, PCIe/GPU, storage, firmware/BMC, Linux/RCA, and RMA ownership
- Beginner definitions, mental models, terminology, ordered diagnostic procedures, worked examples, and revealable comprehension checks
- Incident practice labs with coaching notes
- Searchable glossary
- Browser-local progress, quiz results, notes, theme, and completion tracking
- Responsive, accessible interface designed for GitHub Pages

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Publish on GitHub Pages

The included workflow deploys `dist/` whenever `main` is pushed. In the repository settings, choose **Settings → Pages → Source: GitHub Actions**.

## Add another role

Each role is a self-contained object registered in `src/roles/index.js`. Add a new file under `src/roles/` containing its metadata, modules, quizzes, glossary, scenarios, and dashboard content, then register it in `roleCatalog`. Progress is stored separately per role.

## Important note

This guide teaches a safe diagnostic framework, but actual production work must follow the employer's change controls, safety rules, vendor service manuals, data-protection requirements, and escalation policy.
