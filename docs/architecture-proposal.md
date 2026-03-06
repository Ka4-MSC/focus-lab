# focus.lab Architecture Proposal

## 1) Current prototype analysis

The current app is a single `index.html` with three concerns mixed together:

- **Presentation**: all CSS is inline in a `<style>` block.
- **UI structure**: all markup is embedded in one page.
- **Behavior + data**: all planner logic and persistence live in one `<script>` block using direct DOM mutation and `localStorage`.

What is already strong and should be preserved:

- Two parallel modules: **Work** and **Life**.
- Main focus plus task list per module.
- Optional target/counter with auto-complete behavior.
- Reflection area with a minimum-character gate behavior.
- Bold white + bluebird visual identity and desktop-first three-column layout.

Main maintainability risks in the current format:

- Logic is tightly coupled to DOM IDs and duplicated for Work/Life.
- Storage shape and storage API are not isolated.
- Rendering and business rules are mixed, which makes testing harder.
- Any future backend sync would require rewriting core functions.

---

## 2) Proposed project structure

```text
focus-lab/
├─ index.html                       # app shell + root mount only
├─ README.md
├─ docs/
│  └─ architecture-proposal.md
├─ src/
│  ├─ app/
│  │  ├─ bootstrap.js              # app startup wiring
│  │  ├─ planner-app.js            # top-level orchestrator/controller
│  │  └─ state-machine.js          # explicit action handlers + state transitions
│  ├─ domain/
│  │  ├─ model.js                  # default day model + normalizers
│  │  ├─ planner-service.js        # business rules (complete, increment, validation)
│  │  └─ reflection-rules.js       # min-char + previous-day gate logic
│  ├─ storage/
│  │  ├─ storage-port.js           # persistence interface contract
│  │  ├─ local-storage-adapter.js  # current localStorage implementation
│  │  └─ planner-repository.js     # load/save by date; hides key/schema details
│  ├─ ui/
│  │  ├─ components/
│  │  │  ├─ app-header.js
│  │  │  ├─ date-picker.js
│  │  │  ├─ module-card.js
│  │  │  ├─ task-item.js
│  │  │  ├─ main-focus-item.js
│  │  │  ├─ add-main-form.js
│  │  │  ├─ add-task-form.js
│  │  │  ├─ reflection-card.js
│  │  │  └─ char-counter.js
│  │  ├─ render/
│  │  │  ├─ render-app.js          # full app render entry
│  │  │  ├─ render-module.js
│  │  │  └─ render-tasks.js
│  │  └─ events/
│  │     ├─ bind-global-events.js
│  │     └─ bind-module-events.js
│  ├─ styles/
│  │  ├─ tokens.css                # color/spacing/radius tokens (keeps visual identity)
│  │  ├─ base.css                  # reset + typography + primitives
│  │  ├─ layout.css                # grid + card layout
│  │  └─ components.css            # task, buttons, forms, reflection styles
│  └─ main.js                      # imports styles + bootstraps app
└─ tests/
   ├─ domain/
   │  ├─ planner-service.test.js
   │  └─ reflection-rules.test.js
   └─ storage/
      └─ planner-repository.test.js
```

> Note: This structure intentionally avoids framework lock-in and unnecessary dependencies. It can be implemented with plain ES modules first.

---

## 3) Architecture explanation

### A. Layered design (simple, explicit)

- **UI layer (`src/ui`)**
  - Pure rendering and event binding.
  - Receives state and callbacks; does not read/write storage directly.
  - Reuses module-aware components for both Work and Life to remove duplication.

- **Domain layer (`src/domain`)**
  - Single source of truth for planner business behavior.
  - Functions like `addTask`, `addMainFocus`, `incrementCounter`, `completeTask`, `validateReflectionGate`.
  - Deterministic and easy to unit test.

- **Storage layer (`src/storage`)**
  - `planner-repository` handles persistence I/O.
  - `local-storage-adapter` is the only place touching browser `localStorage`.
  - Swap-ready for future backend sync by replacing adapter implementation.

- **App orchestration (`src/app`)**
  - Connects UI events → domain actions → repository updates → rerender.
  - Keeps explicit state transitions and avoids hidden side effects.

### B. State model (unchanged in spirit)

Use the same daily schema, but centralize it in `domain/model.js`:

```js
{
  [date]: {
    work: { main: TaskOrNull, tasks: Task[] },
    life: { main: TaskOrNull, tasks: Task[] },
    reflection: string
  }
}
```

Where each `Task` remains:

```js
{ text: string, done: boolean, target: number|null, count: number }
```

This preserves all existing behaviors while making serialization and validation explicit.

### C. Event strategy

- One global handler for date/reflection events.
- One module-scoped binder reused twice (`work`, `life`) for add/save/cancel and task actions.
- Prefer event delegation in task lists to avoid per-item listener churn.

### D. Styling strategy (identity-safe)

- Move all CSS to `src/styles` files.
- Keep exact tokens and visual values (bluebird, white, border radii, typography weight).
- Keep 3-column desktop-first layout and card proportions.
- No design-system expansion beyond existing primitives.

### E. Testing scope

Minimal but valuable tests:

- Reflection gate rules.
- Counter increment and auto-complete.
- Day initialization and repository read/write.

This validates core priorities without introducing heavy tooling.

---

## 4) Component list

### Shell-level components

1. `AppHeader`
   - Renders `focus.lab` title.
2. `DatePicker`
   - Date selection + change callback.
3. `PlannerGrid`
   - Three-column layout wrapper.

### Module components (reused for Work + Life)

4. `ModuleCard`
   - Generic card container with title (`WORK` or `LIFE`).
5. `MainFocusItem`
   - Main focus row with optional counter and complete action.
6. `TaskList`
   - Ordered rendering of tasks.
7. `TaskItem`
   - Single task row with text, done state, target counter, increment and complete controls.
8. `AddMainForm`
   - Input + target + save/cancel for main focus.
9. `AddTaskForm`
   - Input + target + save/cancel for regular tasks.
10. `ModuleFooterActions`
   - “ADD MAIN” and “ADD TASK” toggles + form visibility state.

### Reflection components

11. `ReflectionCard`
   - Reflection textarea card wrapper.
12. `CharCounter`
   - Live character count display (`x / 150`).
13. `ReflectionGateNotice` (optional inline text)
   - Lightweight message when previous reflection is incomplete.

---

## 5) Suggested migration plan (safe, incremental)

1. **Extract styles first** into `src/styles` while keeping DOM structure untouched.
2. **Extract storage API** (`local-storage-adapter` + repository) and keep old UI behavior.
3. **Extract domain rules** from inline script into pure functions.
4. **Split UI into components** for module card, task item, and reflection card.
5. **Introduce app orchestrator** and remove inline script from `index.html`.
6. **Add unit tests** for domain and storage before adding any new features.

This sequence preserves current UX and minimizes regression risk.
