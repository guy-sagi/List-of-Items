# List of Items

A small but architecturally robust **React + TypeScript** application demonstrating
modern state management patterns, optimistic updates, undo/retry flows,
and a layered testing strategy.

---

## Project Goals

- Practice React + TypeScript with **real-world patterns**
- Model async workflows explicitly (no magic)
- Implement **optimistic delete** with undo & retry
- Separate **domain logic** from UI
- Apply **layered testing** (unit → integration → UI)

---

## Architecture Overview

The project follows a clean separation of concerns:

### Domain Layer
- **Reducer** – pure state transitions
- **Effects** – async orchestration, timing, side-effects
- **Repository** – data access abstraction

### UI Layer
- Stateless React components
- No business logic
- Communicates via intents (callbacks)

### Data loading

The app uses an in-memory repository (no backend server).
By default, items are loaded from memory on startup.

---

## Testing Strategy

Tests are intentionally layered:

1. **Reducer tests**  
   - Pure
   - Synchronous
   - Exhaustive (all branches)

2. **Effects tests**  
   - Async behavior
   - Mocked repositories
   - Request sequencing & errors

3. **Integration tests**  
   - Reducer + effects together
   - Real state transitions
   - Time-based logic (undo window)

4. **UI tests (RTL)**  
   - User-centric
   - Accessible queries (`getByRole`, labels)
   - No implementation details

---

## Getting Started

### Prerequisites
- Node.js 18+

### Installation

```bash
git clone https://github.com/guy-sagi/List-of-Items.git
cd List-of-Items
npm install
```

### Environment Variables

```bash
cp .env.example .env
```

### Run the App

```bash
npm run dev
```

### Run Tests

```bash
npm run test
```

---

## ℹNotes

- This project prioritizes **correctness, predictability, and testability**
- UI is intentionally minimal
- Patterns are suitable for large-scale frontend systems

---

## Author

Built as a hands-on React architecture & testing exercise.
