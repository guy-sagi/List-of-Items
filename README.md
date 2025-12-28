# List of Items

A small but architecturally robust React + TypeScript application demonstrating
modern state management patterns for async workflows, optimistic updates, and undo/retry UX.

This project intentionally focuses on **architecture and correctness**, not UI polish.

---

## Goals of the Project

- Practice **React + TypeScript** in a real-world architecture
- Model async workflows explicitly (loading, create, delete)
- Implement **optimistic updates** with rollback
- Support **Undo / Retry** with a timed commit window
- Keep domain logic independent from infrastructure (DB / API)

---

## Key Architectural Principles

### 1. Clear separation of concerns

- **Reducers**  
  Pure, synchronous, authoritative state transitions

- **Effects**  
  Async orchestration, timing, retries, undo windows

- **Selectors**  
  Translate state → intent (e.g. selected IDs)

- **Repository abstraction**  
  Decouples the app from the data source (in-memory, HTTP, DB)

- **UI components**  
  Express intent only; never manipulate state directly

---

### 2. Explicit async state machines

Async operations are modeled explicitly using discriminated unions:

- Loading items
- Creating items
- Deleting items

Each operation:
- has a well-defined lifecycle
- is guarded against race conditions
- uses `requestId` to ignore stale async results

---

### 3. Optimistic updates with safety

- Delete operations are optimistic
- A snapshot of removed items is kept
- Users can:
  - Undo
  - Retry on failure
- A timed undo window auto-commits the delete

This design is:
- StrictMode-safe
- resilient to late async responses
- independent of UI timing

---

## Project Structure

src/
├─ domain/
│ └─ items/
│ ├─ items.types.ts # Domain types & state machines
│ ├─ items.reducer.ts # Pure reducer logic
│ ├─ items.effects.ts # Async orchestration
│ ├─ items.selectors.ts # Derived state helpers
│ ├─ items.repository.ts # Repository contract
│ └─ items.repository.memory.ts
│
├─ ui/
│ └─ items/
│ ├─ ItemsPage.tsx
│ ├─ ItemsList.tsx
│ └─ DeleteBanner.tsx
│
└─ App.tsx


---

## Data Source

The app currently uses an **in-memory repository** to simulate latency and failures.

The architecture is intentionally designed so that switching to a real backend
(REST / GraphQL / DB) requires **no changes** to reducers or UI.

Only the repository implementation needs to change.

---

## Why this project exists

This is **not** a CRUD demo.

It is an exploration of:
- how to model async state correctly
- how to avoid race conditions
- how to design for undo / retry
- how to keep React apps predictable as they grow

---

## Running the project

```bash
npm install
npm run dev