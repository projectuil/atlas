# Project UIL — Architecture Documentation

> **"Understand human problems before building technology."**

This folder is the definitive architectural reference for **Project UIL / ATLAS**. It is written for engineers and AI assistants who need to understand, maintain, or extend the system without requiring the original author's guidance.

---

## What Is UIL?

**Project UIL (User Interaction Logic)** is a structured research initiative that documents, categorizes, and synthesizes recurring **Human Frictions** — the persistent micro-failures and behavioral frustrations that users experience when interacting with digital systems.

UIL is composed of two tightly integrated systems:

| System | Location | Purpose |
|--------|----------|---------|
| **ATLAS Research Engine** | `/atlas`, `/docs`, `/roadmap`, `/tools` | Canonical archive of observations, patterns, standards, and governance |
| **ATLAS Web Application** | `/web` | Interactive, searchable, static presentation of all research |

---

## Project Philosophy

UIL operates under a strict **evidence-first** mandate:

1. **Never invent friction** — Every documented human friction must be directly observed in real systems, not hypothesized.
2. **Observe before building** — Research precedes any solution, pattern, or design recommendation.
3. **Evidence over assumptions** — One friction per observation, documented with observation level and confidence score.
4. **Single source of truth** — The filesystem *is* the database. No external database is used.

---

## Core Concepts

| Term | Meaning |
|------|---------|
| **Human Friction** | A single, observed, recurring problem experienced by users interacting with digital systems |
| **APID** | Atlas Problem Identifier — the unique ID for each Human Friction (e.g., `AU-001`) |
| **Pattern** | A synthesized behavioral insight derived from multiple Human Frictions (e.g., `PAT-001`) |
| **PTID** | Pattern Identifier — the unique ID for each Pattern (e.g., `PAT-001`) |
| **Domain** | A high-level research category, identified by a 2-letter prefix (e.g., `AU` = Authentication & Forms) |
| **Registry** | An official master index of all APIDs, Categories, or Patterns |
| **Observation Level** | An integer from 1–4 representing the strength of evidence behind a friction |
| **Confidence Score** | A float from 0.00–1.00 representing research confidence in a pattern |
| **Volume** | A grouped collection of Patterns in a research domain (e.g., "Volume 01 — Cognitive Behaviour") |

---

## Reading Order

If you are new to this project, read documents in this order:

1. **[01-system-overview.md](./01-system-overview.md)** — Understand the complete architecture at a high level
2. **[02-folder-architecture.md](./02-folder-architecture.md)** — Understand what every folder does and why
3. **[05-content-model.md](./05-content-model.md)** — Understand data schemas before reading code
4. **[03-data-flow.md](./03-data-flow.md)** — Trace exactly how data moves from source to browser
5. **[04-rendering-pipeline.md](./04-rendering-pipeline.md)** — Understand how the web application builds and renders
6. **[09-parser-architecture.md](./09-parser-architecture.md)** — Understand how documents are parsed
7. **[13-api-reference.md](./13-api-reference.md)** — Reference internal functions before writing code
8. **[14-developer-workflow.md](./14-developer-workflow.md)** — Follow step-by-step workflows for adding content
9. **[16-design-decisions.md](./16-design-decisions.md)** — Understand *why* architectural choices were made
10. **[17-extension-guide.md](./17-extension-guide.md)** — Understand how to safely extend the system

---

## Quick Reference: Important Terminology

| Identifier Format | Meaning | Example |
|---|---|---|
| `XX-NNN` | A Human Friction (APID) | `AU-001`, `FF-012` |
| `PAT-NNN` | A Behavioral Pattern (PTID) | `PAT-001`, `PAT-064` |
| `XX` prefix | Domain code | `AU`, `DW`, `FF`, `KI`, `LE`, `MB`, `OS`, `WI` |

---

## Official Domains

| Code | Full Name |
|------|-----------|
| `AU` | Authentication & Forms |
| `DW` | Desktop Workspace |
| `FF` | Files & Project Management |
| `KI` | Keyboard & Input |
| `LE` | Learning & Cognition |
| `MB` | Mobile Experience |
| `OS` | Desktop & Operating System |
| `WI` | Web & Internet |

---

## Architecture at a Glance

```
Research Corpus (.docx)
        │
        ▼ tools/migration (Mammoth → Markdown)
        │
web/content/ (Markdown + YAML frontmatter)
        │
        ▼ web/src/lib/ (gray-matter, Cheerio parsers)
        │
web/src/app/ (Next.js Server Components → Static HTML)
        │
        ▼ npx pagefind --site out/
        │
Browser (Interactive Client Components + Offline Search)
```

---

*See [diagrams/architecture.md](./diagrams/architecture.md) for the full Mermaid diagram.*
