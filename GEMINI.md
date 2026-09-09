# Project UIL — Agent Rules

## Mandatory Startup

> **Read [`START_HERE.md`](./START_HERE.md) at the repository root before making any code changes.**

`START_HERE.md` contains the required startup procedure, pre/post change checklists, failure log, known problems, and accumulated lessons learned. It is the operational manual for this project. Architecture documentation rules are below.

---

## Architecture Documentation is Mandatory

The `architecture/` directory at the repository root is the **single source of truth** for understanding the UIL system. It must always reflect the current implementation.

### The Rule

**Any meaningful change to code, data models, workflows, parsers, registries, routing, APIs, UI, or the build pipeline MUST be accompanied by updates to the architecture documentation in the same work session.**

A feature or change is **not complete** until:

1. The implementation is finished.
2. Every affected architecture document is updated to reflect it.
3. All affected diagrams (Mermaid) are updated.
4. Obsolete documentation is removed or consolidated.

---

## What "Meaningful Change" Means

Update the architecture documentation whenever any of the following change:

| Change Type | Documents to Update |
|------------|-------------------|
| New content type added | `03-data-flow.md`, `05-content-model.md`, `13-api-reference.md`, `17-extension-guide.md`, `diagrams/data-flow.md` |
| New route added | `11-routing.md`, `diagrams/routing.md`, `10-component-architecture.md`, `diagrams/component-tree.md` |
| New component added | `10-component-architecture.md`, `diagrams/component-tree.md` |
| `api.ts` function added or changed | `13-api-reference.md` |
| Parser logic changed | `09-parser-architecture.md`, `diagrams/parser-flow.md` |
| Registry structure changed | `08-registry-system.md`, `diagrams/registry-flow.md` |
| Build command or pipeline changed | `15-build-process.md` |
| New domain category added | `07-atlas-system.md`, `13-api-reference.md`, `glossary.md` |
| Developer workflow changed | `14-developer-workflow.md` |
| New design decision made | `16-design-decisions.md` |
| New subsystem or concept introduced | Create a new `NN-name.md` document + update `README.md` reading order |
| Feature removed | Remove or mark obsolete the relevant document sections |
| Architectural refactor | Update all affected documents + all diagrams |

---

## Specific Documentation Files

All documentation lives in `c:\atlas\architecture\`:

```
architecture/
├── README.md                  ← Entry point, reading order
├── 01-system-overview.md      ← High-level architecture
├── 02-folder-architecture.md  ← Every folder explained
├── 03-data-flow.md            ← Content lifecycle per content type
├── 04-rendering-pipeline.md   ← SSG, Server/Client boundary
├── 05-content-model.md        ← All frontmatter schemas
├── 06-pattern-system.md       ← Behavioral Pattern system
├── 07-atlas-system.md         ← ATLAS domains, APID system
├── 08-registry-system.md      ← Registry documents and parsers
├── 09-parser-architecture.md  ← Three parsing tiers
├── 10-component-architecture.md ← All React components
├── 11-routing.md              ← URL structure and resolution
├── 12-search.md               ← Pagefind search system
├── 13-api-reference.md        ← All public functions and types
├── 14-developer-workflow.md   ← Step-by-step workflows
├── 15-build-process.md        ← Build pipeline in detail
├── 16-design-decisions.md     ← Why things are the way they are
├── 17-extension-guide.md      ← How to safely extend the system
├── glossary.md                ← All terms defined
└── diagrams/
    ├── architecture.md        ← Full system Mermaid diagram
    ├── data-flow.md           ← Data flow Mermaid diagram
    ├── render-flow.md         ← Rendering pipeline Mermaid diagram
    ├── component-tree.md      ← React component tree Mermaid diagram
    ├── routing.md             ← URL routing Mermaid diagram
    ├── registry-flow.md       ← Registry pipeline Mermaid diagram
    └── parser-flow.md         ← Parser tiers Mermaid diagram
```

---

## Principles

- **Documentation First** — Never leave architecture behind the implementation.
- **Future engineers and AI agents must be able to understand the current system by reading only `architecture/` before reading source code.**
- Keep Mermaid diagrams synchronized — a diagram that no longer matches the code is worse than no diagram.
- When adding new documents, add them to the reading order table in `README.md`.
- When consolidating documents, update all cross-references that link to the old file.
- Use the same terminology throughout all documents and the glossary.
