# ⚛️ Kanzan Learn React

A structured React learning repository — from zero to production-ready. Follows the roadmap in [PANDUAN_ZERO_TO_HERO_REACT.md](./doc/PANDUAN_ZERO_TO_HERO_REACT.md).

> **Prerequisite:** Completed [Kanzan Learn TypeScript](../Kanzan_Learn_Typescript)

---

## 🚀 Getting Started

```bash
npm install
npm run dev
# Open http://localhost:5173
```

Select a phase from the navigator in the browser. Each phase has its own tab with runnable demos.

---

## 📋 Progress

| Phase | Topic | Status | Folder |
|-------|-------|--------|--------|
| **Phase 0** | JSX & Component Basics | ✅ Done | `src/phase-0/` |
| **Phase 1** | State & Event Handling | 🔜 Todo | `src/phase-1/` |
| **Phase 2** | Core Hooks | 🔜 Todo | `src/phase-2/` |
| **Phase 3** | Custom Hooks & Composition | 🔜 Todo | `src/phase-3/` |
| **Phase 4** | Component Patterns | 🔜 Todo | `src/phase-4/` |
| **Phase 5** | State Management | 🔜 Todo | `src/phase-5/` |
| **Phase 6** | Data Fetching | 🔜 Todo | `src/phase-6/` |
| **Phase 7** | Forms | 🔜 Todo | `src/phase-7/` |
| **Phase 8** | Performance Optimization | 🔜 Todo | `src/phase-8/` |
| **Phase 9** | Testing | 🔜 Todo | `src/phase-9/` |

---

## 📁 Project Structure

```
src/
├── phase-0/                         # JSX & Component Basics
│   ├── 01_jsx_basics.tsx            # JSX syntax, expressions, conditional rendering
│   ├── 02_functional_component.tsx  # Component forms, Fragment, composition, children
│   ├── 03_props.tsx                 # TypeScript props, callbacks, drilling, spread
│   └── mini_project_profile_card.tsx  # Mini project: Profile Card UI
├── phase-1/                         # State & Event Handling (coming soon)
├── phase-2/                         # Core Hooks (coming soon)
├── ...
├── App.tsx                          # Phase navigator
├── main.tsx                         # Entry point
└── index.css                        # Global styles
```

---

## 🗂️ Phase Details

### ✅ Phase 0 — JSX & Component Basics

| File | Topic | Concepts |
|------|-------|----------|
| `01_jsx_basics.tsx` | JSX Syntax | JS expressions `{}`, conditional (`&&`, ternary, IIFE switch), list rendering + `key`, inline style object |
| `02_functional_component.tsx` | Functional Components | Function declaration vs arrow function, Fragment `<>`, Atom→Molecule→Organism composition, `children` prop |
| `03_props.tsx` | Props | TypeScript interface, optional props, default values, string literal union, callback props, props drilling, spread operator |
| `mini_project_profile_card.tsx` | 🎯 Mini Project | `ProfileCard` + `SkillBadge` + `SocialLinkItem` + `AvatarCard` — all Phase 0 concepts combined |

**Key takeaways:**
- JSX compiles to `React.createElement()` — it is not HTML
- Every component must return a single root element (use `<>` Fragment to avoid extra DOM nodes)
- Use `className` not `class`, `htmlFor` not `for`
- Props are read-only — data flows one-way: parent → child via props, child → parent via callbacks
- The `key` prop is required on list items so React can efficiently diff the virtual DOM
- `children` is a built-in prop for injecting slot content between opening/closing tags

---

## 🔗 References

- [Full Learning Guide](./doc/PANDUAN_ZERO_TO_HERO_REACT.md)
- [react.dev](https://react.dev) — Official React docs
- [Kanzan Learn TypeScript](../Kanzan_Learn_Typescript) — Prerequisite repo
