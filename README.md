# InfraPrep — IT Infrastructure Engineer

An interactive, beginner-first study guide for the **IT Infrastructure Engineer — RMA & Hardware Diagnostics** interview path.

## What is included

- A 12-question baseline and final assessment with explanations
- Eight guided modules covering server architecture, memory/ECC, power and thermals, PCIe/GPU, storage, firmware/BMC, Linux/RCA, and RMA ownership
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

The current study content lives in `src/content.js` and the product shell in `src/main.jsx`. The next evolution should extract role metadata/content into separate files under `src/roles/<role-slug>/`, then add a role picker before the dashboard. Keeping content separate from the UI makes new role tracks straightforward to add.

## Important note

This guide teaches a safe diagnostic framework, but actual production work must follow the employer's change controls, safety rules, vendor service manuals, data-protection requirements, and escalation policy.
