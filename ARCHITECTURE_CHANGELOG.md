# Architecture Changelog

> Tracks significant architectural changes to UIL.
>
> **Every AI agent must update this file whenever the architecture changes.**
>
> This is **not** a feature changelog. It records changes to the system design.

---

# Rules

Update this document whenever any of the following changes:

* Folder structure
* Data flow
* Rendering pipeline
* Registries
* Parsers
* Search
* APIs
* Component architecture
* Routing
* Build process
* Developer workflow
* Documentation structure

Minor UI or styling changes should not be recorded unless they affect the architecture.

---

# Entry Template

```
## YYYY-MM-DD — Title

### Summary

Short description.

### Reason

Why the change was made.

### Architecture Impact

Explain what changed in the system design.

### Components Affected

List major components or subsystems.

### Data Flow Impact

Describe any changes to the flow of data.

### Documentation Updated

List the architecture documents that were updated.

### Migration Notes

Anything future developers should know.
```

---

# Changelog

---

## 2026-09-09 — Initial Architecture Documentation

### Summary

Created the complete `architecture/` documentation folder — 19 root-level documents and 7 Mermaid diagram files — representing a full reverse-engineered documentation of the UIL system.

### Reason

The system was undocumented. Future engineers and AI agents had no way to understand the architecture without reading the entire source code. This documentation makes the system understandable from the `architecture/` folder alone.

### Architecture Impact

No code was changed. Documentation was created to reflect the existing implementation.

### Components Affected

All subsystems documented:
- ATLAS research corpus and domain system
- Migration pipeline (Tier 1 parsing)
- Content database (`web/content/`)
- Data access layer (`web/src/lib/api.ts`)
- Registry parser (`registryParser.ts`)
- Table/metrics parser (`tableParser.ts`)
- Next.js App Router pages (all routes)
- React client components (all 11 components)
- Pagefind search system
- Build pipeline
- Static HTTP server

### Data Flow Impact

No changes to data flow. The documentation describes the existing flow in full for the first time.

### Documentation Updated

All 26 files created:
- `architecture/README.md`
- `architecture/01-system-overview.md`
- `architecture/02-folder-architecture.md`
- `architecture/03-data-flow.md`
- `architecture/04-rendering-pipeline.md`
- `architecture/05-content-model.md`
- `architecture/06-pattern-system.md`
- `architecture/07-atlas-system.md`
- `architecture/08-registry-system.md`
- `architecture/09-parser-architecture.md`
- `architecture/10-component-architecture.md`
- `architecture/11-routing.md`
- `architecture/12-search.md`
- `architecture/13-api-reference.md`
- `architecture/14-developer-workflow.md`
- `architecture/15-build-process.md`
- `architecture/16-design-decisions.md`
- `architecture/17-extension-guide.md`
- `architecture/glossary.md`
- `architecture/diagrams/architecture.md`
- `architecture/diagrams/data-flow.md`
- `architecture/diagrams/render-flow.md`
- `architecture/diagrams/component-tree.md`
- `architecture/diagrams/routing.md`
- `architecture/diagrams/registry-flow.md`
- `architecture/diagrams/parser-flow.md`

### Migration Notes

None — no code changed. Any agent reading this after this date should treat the `architecture/` folder as the primary source of truth for system understanding.

---

## 2026-09-09 — Agent Governance Files Added

### Summary

Three agent governance files were added to the repository root to enforce architecture-first development discipline for all AI agents and future engineers.

### Reason

No formal process existed for onboarding AI agents or enforcing documentation hygiene. Without explicit instructions, agents would make code changes without understanding the system or updating documentation.

### Architecture Impact

No code changes. Three new governance files control agent behaviour:

| File | Role |
|------|------|
| `GEMINI.md` | Auto-loaded workspace rule — architecture documentation mandate |
| `START_HERE.md` | Agent operational manual — startup procedure, checklists, failure log, lessons learned |
| `KNOWN_ISSUES.md` | Living troubleshooting guide — prevents repeated debugging |
| `ARCHITECTURE_CHANGELOG.md` | This file — historical record of architectural evolution |

### Components Affected

- Agent startup procedure
- Documentation update mandate
- Failure tracking
- Lessons learned tracking

### Data Flow Impact

None.

### Documentation Updated

- `GEMINI.md` — workspace rule (auto-loaded by Antigravity)
- `START_HERE.md` — operational manual
- `KNOWN_ISSUES.md` — issue tracker
- `ARCHITECTURE_CHANGELOG.md` — this file

### Migration Notes

All future agents working in this repository will have `GEMINI.md` auto-loaded. The first instruction they receive is to read `START_HERE.md`. This creates a reliable onboarding chain for every session.

---

# Architectural Milestones

| Date | Milestone |
|------|-----------|
| 2026-09-09 | Initial architecture documentation created |
| 2026-09-09 | Agent governance system established |

---

# Breaking Architectural Changes

_No breaking changes recorded yet._

When a breaking change occurs, document it here with:
- What changed
- Why it changed
- Required migration steps
- Backward compatibility considerations

---

# Documentation Synchronization

Whenever an architectural change is recorded here, ensure all affected documents are updated, including:

* `architecture/README.md`
* `architecture/01-system-overview.md`
* `architecture/03-data-flow.md`
* `architecture/04-rendering-pipeline.md`
* `architecture/10-component-architecture.md`
* `architecture/11-routing.md`
* `architecture/09-parser-architecture.md`
* `architecture/08-registry-system.md`
* `architecture/14-developer-workflow.md`
* `architecture/13-api-reference.md`
* All affected `architecture/diagrams/` files

No architectural change is considered complete until the documentation has been synchronized.

---

# Goal

This file provides the historical evolution of UIL's architecture, allowing future engineers and AI agents to understand not only **how the system works today**, but **why it evolved into its current design**.
