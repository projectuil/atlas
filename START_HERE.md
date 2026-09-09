# START HERE

> **Every AI agent MUST read this document before making any code changes.**

This document contains the required startup procedure, development workflow, common failures, and recovery steps for the UIL project.

---

# 1. Read Architecture First

Before opening random source files, read the following documents in order:

1. `architecture/README.md`
2. `architecture/01-system-overview.md`
3. `architecture/03-data-flow.md`
4. `architecture/14-developer-workflow.md`

Do NOT begin implementation until you understand the architecture.

---

# 2. Start the Development Server

Always verify that the project builds before making changes.

```bash
cd web
npm install
npm run dev
```

Wait until the application starts successfully.

Record any startup errors before making changes.

---

# 3. Verify the Website

Confirm:

* Development server starts successfully.
* No build errors.
* No TypeScript errors.
* No runtime errors.
* No parser failures.
* No missing content.
* No broken routes.

Never assume the project works.

Verify it.

---

# 4. Before Writing Code

Understand:

* What subsystem is changing.
* Which architecture documents are affected.
* Which registries are affected.
* Which parsers are affected.
* Which routes are affected.
* Which documentation must change.

---

# 5. After Every Code Change

Always:

* Run the project.
* Check browser console.
* Check terminal.
* Fix introduced issues.
* Verify affected pages.
* Verify search still works.
* Verify registries still load.
* Verify markdown still renders.

---

# 6. Architecture Documentation (Mandatory)

Whenever implementation changes:

* Update architecture documents.
* Update diagrams.
* Update data flow.
* Update parser documentation.
* Update routing documentation.
* Update API documentation.
* Update developer workflow.

If a new subsystem is introduced:

Create a new architecture document.

If a subsystem is removed:

Remove or merge obsolete documentation.

The documentation must always match the implementation.

---

# 7. Failure Log

Maintain this section continuously.

Every newly discovered issue must be documented here.

Use this format:

---

## Failure

**Problem:**

**Root Cause:**

**Solution:**

**Files Changed:**

**Date:**

**Status:**

---

Never delete useful failures. The goal is to prevent future agents from repeating the same mistakes.

---

# 8. Known Problems

_This section is a living list. Add to it whenever a new systemic issue is discovered._

| Problem | Status | Solution Reference |
|---------|--------|-------------------|
| _(none recorded yet)_ | — | — |

---

# 9. Lessons Learned

_Whenever you discover something important about the project that is not already captured in the architecture docs, add it here._

Examples of what belongs here:

* Architectural assumptions that surprised you
* Parser edge cases and behavior
* Registry rules that weren't obvious
* Naming conventions not in the docs
* Content standards that differ from expectation
* Performance considerations
* Windows-specific path issues

_This becomes the accumulated engineering knowledge of the project across all agents and sessions._

---

# 10. Agent Responsibilities

Every AI agent must:

* Understand before changing.
* Never guess architecture.
* Never skip documentation.
* Never leave diagrams outdated.
* Never leave broken builds.
* Never leave undocumented changes.

Code and documentation must evolve together.

---

# 11. Completion Checklist

Before finishing any task, confirm:

- [ ] Project builds successfully (`npm run build` in `web/`)
- [ ] Development server starts (`npm run dev`)
- [ ] Website loads correctly
- [ ] Documentation updated (`architecture/`)
- [ ] Architecture diagrams updated (`architecture/diagrams/`)
- [ ] APIs updated in `architecture/13-api-reference.md` (if applicable)
- [ ] Failure log updated in this file (if a new failure was encountered)
- [ ] Lessons Learned updated in this file (if something new was discovered)

**A task is not complete until all applicable items above are checked.**
