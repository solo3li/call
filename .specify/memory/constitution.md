<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.1.0
- Modified principles:
  - Added: VI. Brand Identity and Theming
- Added sections: N/A
- Removed sections: N/A
- Templates requiring updates: ✅ plan-template.md, ✅ spec-template.md
- Follow-up TODOs: None
-->

# foodRMS Constitution

## Core Principles

### I. Clean and Organized Workspace
The workspace MUST be kept clean and organized at all times. Code should be logically separated, dependencies properly managed, and temporary or unnecessary files cleaned up to maintain an optimal development environment.

### II. Safe Deployment Process
All deployments MUST be performed using Helm. Before deploying, you MUST check the current deployment state. Additionally, all `.yaml` files MUST be thoroughly checked and validated prior to any deployment operation to prevent configuration errors.

### III. Comprehensive Testing
Every feature MUST undergo rigorous testing before deployment to ensure correctness and stability. Furthermore, post-deployment testing MUST be conducted to verify that the feature works as expected in the live environment.

### IV. Strict Project Structure
The project follows a strict multi-module directory structure that MUST be adhered to:
- `TOTP/`: Dedicated for TOTP code.
- `project/driver-app/`: Dedicated for the delivery driver application.
- `project/desktop/apps/hq/`: Dedicated for call center and administration applications.
- `project/desktop/apps/branch/`: Dedicated for branch, KDS (Kitchen Display System), and delivery management.
- `project/frontend/`: Dedicated for the frontend website.
- `project/backend/`: Dedicated for the backend systems and bot worker.

### V. Design & Implementation Standard
When implementing code, specifically frontend interfaces and UI designs, you MUST use the `impeccable` skill to ensure a highly polished, visually excellent, and user-friendly experience.

### VI. Brand Identity and Theming
The project's theme, colors, and overall brand identity MUST be strictly preserved. Do not alter or deviate from the established brand colors or theming guidelines (e.g., neo-brutalist styling, primary colors like `#FF6B35`, `#1A1A1A`) when implementing or modifying UI components, to ensure a consistent and recognizable application identity.

## Additional Constraints

- **Helm Validations:** All Helm charts must pass static analysis before deployment.
- **Environment Checks:** The current state of the cluster must be verified to ensure no ongoing operations conflict with the new deployment.

## Development Workflow

- **Pre-Deploy:** Implement the feature -> Test locally -> Validate YAML -> Helm template check.
- **Deploy:** Apply via Helm.
- **Post-Deploy:** Run integration tests and verify live functionality.

## Governance

This Constitution supersedes all other practices. All code reviews, architectural decisions, and deployments MUST verify compliance with these principles. Any amendments require documentation, approval, and a migration plan if applicable.

**Version**: 1.1.0 | **Ratified**: 2026-06-01 | **Last Amended**: 2026-06-01
