# ⚛️ Kanzan Learn React

A structured React learning repository — from zero to production-ready. Follows the roadmap in [PANDUAN_ZERO_TO_HERO_REACT.md](./doc/PANDUAN_ZERO_TO_HERO_REACT.md).

> **Prerequisite:** Completed [Kanzan Learn TypeScript](../Kanzan_Learn_Typescript)

---

## 🚀 Getting Started

```bash
npm install
npm run dev        # open http://localhost:5173
npm test           # run test suite (55 tests)
npm run test:watch # watch mode
```

Select a phase from the navigator in the browser. Each phase has its own tabs with runnable demos.

---

## 📋 Progress

| Phase | Topic | Status | Folder |
|-------|-------|--------|--------|
| **Phase 0** | JSX & Component Basics | ✅ Done | `src/phase-0/` |
| **Phase 1** | State & Event Handling | ✅ Done | `src/phase-1/` |
| **Phase 2** | Core Hooks | ✅ Done | `src/phase-2/` |
| **Phase 3** | Custom Hooks & Composition | ✅ Done | `src/phase-3/` |
| **Phase 4** | Component Patterns | ✅ Done | `src/phase-4/` |
| **Phase 5** | State Management | ✅ Done | `src/phase-5/` |
| **Phase 6** | Data Fetching | ✅ Done | `src/phase-6/` |
| **Phase 7** | Forms | ✅ Done | `src/phase-7/` |
| **Phase 8** | Performance Optimization | ✅ Done | `src/phase-8/` |
| **Phase 9** | Testing | ✅ Done | `src/phase-9/` |

---

## 📁 Project Structure

```
src/
├── lib/
│   └── fake-data.ts                    # Shared faker utilities (seed 42)
├── test/
│   └── setup.ts                        # Vitest + jest-dom setup
│
├── phase-0/                            # JSX & Component Basics
│   ├── 01_jsx_basics.tsx
│   ├── 02_functional_component.tsx
│   ├── 03_props.tsx
│   └── mini_project_profile_card.tsx
│
├── phase-1/                            # State & Event Handling
│   ├── 01_use_state.tsx
│   ├── 02_event_handling.tsx
│   ├── 03_controlled_input.tsx
│   ├── 04_lifting_state.tsx
│   └── mini_project_shopping_cart.tsx
│
├── phase-2/                            # Core Hooks
│   ├── 01_use_effect.tsx
│   ├── 02_use_ref.tsx
│   ├── 03_use_context.tsx
│   ├── 04_use_memo_callback.tsx
│   ├── 05_use_reducer.tsx
│   └── mini_project_pomodoro.tsx
│
├── phase-3/                            # Custom Hooks & Composition
│   ├── 01_custom_hooks.tsx             # useLocalStorage, useDebounce, useToggle, useFetch, useWindowSize
│   ├── 02_hook_composition.tsx         # useSearch, usePreferences, usePaginatedList
│   ├── 03_rules_of_hooks.tsx
│   └── mini_project_user_search.tsx
│
├── phase-4/                            # Component Patterns
│   ├── 01_compound_components.tsx      # Tabs, Disclosure
│   ├── 02_render_props.tsx
│   ├── 03_hoc.tsx                      # withLoading, withAuth, React.memo
│   └── mini_project_accordion.tsx
│
├── phase-5/                            # State Management
│   ├── 01_context_reducer.tsx
│   ├── 02_zustand.tsx                  # devtools + persist middleware
│   ├── 03_jotai.tsx                    # atoms, derived, atomWithStorage
│   └── mini_project_ecommerce_store.tsx
│
├── phase-6/                            # Data Fetching
│   ├── 01_fetch_patterns.tsx           # basic, dependent, parallel, optimistic
│   ├── 02_tanstack_query.tsx           # useQuery, useMutation, useInfiniteQuery
│   ├── 03_swr.tsx                      # useSWR, useSWRMutation, conditional
│   └── mini_project_news_feed.tsx
│
├── phase-7/                            # Forms
│   ├── 01_react_hook_form.tsx          # register, handleSubmit, watch, useFieldArray
│   ├── 02_zod_validation.tsx           # zodResolver, schema composition
│   └── mini_project_multistep_form.tsx # 3-step wizard
│
├── phase-8/                            # Performance Optimization
│   ├── 01_react_memo.tsx               # comparison demo, useCallback, custom comparator
│   ├── 02_code_splitting.tsx           # lazy/Suspense, startTransition
│   ├── 03_virtualization.tsx           # useVirtualizer, 5000 rows
│   └── mini_project_data_table.tsx     # 3000 rows: memo + useMemo + virtualizer
│
├── phase-9/                            # Testing
│   ├── 01_vitest_rtl.tsx               # concepts & setup guide
│   ├── 02_testing_patterns.tsx         # pattern overview
│   ├── components/                     # test subjects
│   │   ├── Counter.tsx
│   │   ├── LoginForm.tsx
│   │   └── UserList.tsx
│   ├── __tests__/                      # 55 tests, all passing
│   │   ├── 01_rendering.test.tsx       # render(), getBy*, queryBy*, conditional/list
│   │   ├── 02_interaction.test.tsx     # userEvent, vi.fn(), toHaveBeenCalledWith
│   │   ├── 03_async.test.tsx           # waitFor, findBy*, fake timers, optimistic
│   │   ├── 04_forms.test.tsx           # getByLabelText, aria-invalid, loading state
│   │   └── 05_hooks.test.tsx           # renderHook, act, localStorage
│   └── mini_project_test_suite.tsx
│
├── App.tsx                             # Phase navigator (10 phases, P0-P9)
├── main.tsx                            # Entry point
└── index.css                           # Global dark theme styles
```

---

## 🗂️ Phase Details

### ✅ Phase 0 — JSX & Component Basics

| File | Topic | Concepts |
|------|-------|----------|
| `01_jsx_basics.tsx` | JSX Syntax | JS expressions `{}`, conditional (`&&`, ternary, IIFE switch), list rendering + `key`, inline style object |
| `02_functional_component.tsx` | Functional Components | Function declaration vs arrow function, Fragment `<>`, Atom→Molecule→Organism composition, `children` prop |
| `03_props.tsx` | Props | TypeScript interface, optional props, default values, string literal union, callback props, props drilling, spread operator |
| `mini_project_profile_card.tsx` | 🎯 Profile Card | `ProfileCard` + `SkillBadge` + `SocialLinkItem` + `AvatarCard` — all Phase 0 concepts combined |

### ✅ Phase 1 — State & Event Handling

| File | Topic | Concepts |
|------|-------|----------|
| `01_use_state.tsx` | useState | Primitive/boolean/object/array state, functional update, immutable patterns |
| `02_event_handling.tsx` | Events | Mouse/change/keyboard events, TypeScript event types, closure pattern |
| `03_controlled_input.tsx` | Controlled Input | Controlled vs uncontrolled, useRef, live validation, touched state |
| `04_lifting_state.tsx` | Lifting State | Shared state in parent, sibling sync via callbacks |
| `mini_project_shopping_cart.tsx` | 🎯 Shopping Cart | Filter, add/remove/qty, cart sidebar, total price |

### ✅ Phase 2 — Core Hooks

| File | Topic | Concepts |
|------|-------|----------|
| `01_use_effect.tsx` | useEffect | Dependency array, cleanup, fetch cancellation, race condition prevention |
| `02_use_ref.tsx` | useRef | DOM refs, mutable instance variables, previous value pattern |
| `03_use_context.tsx` | useContext | createContext, Provider, custom hook pattern, theme + auth context |
| `04_use_memo_callback.tsx` | useMemo & useCallback | When to use, over-optimization pitfalls, React.memo pairing |
| `05_use_reducer.tsx` | useReducer | Discriminated union actions, pure reducer, MVI pattern |
| `mini_project_pomodoro.tsx` | 🎯 Pomodoro Timer | All 6 core hooks combined: state machine, interval, context, memo |

### ✅ Phase 3 — Custom Hooks & Composition

| File | Topic | Concepts |
|------|-------|----------|
| `01_custom_hooks.tsx` | Custom Hooks | useLocalStorage, useDebounce, useToggle, useFetch (AbortController), useWindowSize |
| `02_hook_composition.tsx` | Composition | useSearch = useDebounce + useFetch, usePreferences, usePaginatedList |
| `03_rules_of_hooks.tsx` | Rules of Hooks | Call order visualization, right vs wrong patterns |
| `mini_project_user_search.tsx` | 🎯 User Search | JSONPlaceholder API, bookmarks, recent searches, prefetch on hover |

### ✅ Phase 4 — Component Patterns

| File | Topic | Concepts |
|------|-------|----------|
| `01_compound_components.tsx` | Compound Components | Context-based implicit state, dot-notation API (Tabs, Disclosure) |
| `02_render_props.tsx` | Render Props | render prop, children as function, comparison with custom hooks |
| `03_hoc.tsx` | HOC | withLoading, withAuth, React.memo as HOC, generic type constraints |
| `mini_project_accordion.tsx` | 🎯 Accordion | ARIA accessible, single/multi-open mode, Compound Components pattern |

### ✅ Phase 5 — State Management

| File | Topic | Concepts |
|------|-------|----------|
| `01_context_reducer.tsx` | Context + useReducer | App-level state, discriminated actions, notification system |
| `02_zustand.tsx` | Zustand | create(), devtools, persist middleware, selective subscription |
| `03_jotai.tsx` | Jotai | atom(), derived atom, useAtomValue, useSetAtom, atomWithStorage |
| `mini_project_ecommerce_store.tsx` | 🎯 E-commerce | 4 stores: auth, filter, cart (persist), wishlist (persist) |

### ✅ Phase 6 — Data Fetching

| File | Topic | Concepts |
|------|-------|----------|
| `01_fetch_patterns.tsx` | Manual Fetch | basic, dependent, parallel (Promise.all), optimistic update |
| `02_tanstack_query.tsx` | TanStack Query | QueryClient, useQuery, useMutation, useInfiniteQuery, cache invalidation |
| `03_swr.tsx` | SWR | useSWR, useSWRMutation, conditional fetch (null key), revalidation |
| `mini_project_news_feed.tsx` | 🎯 News Feed | Infinite scroll, prefetch on hover, bookmarks, refresh |

### ✅ Phase 7 — Forms

| File | Topic | Concepts |
|------|-------|----------|
| `01_react_hook_form.tsx` | React Hook Form | register, handleSubmit, watch, useFieldArray, loading state |
| `02_zod_validation.tsx` | Zod Validation | zodResolver, z.infer, .refine(), .extend(), .partial(), .pick() |
| `mini_project_multistep_form.tsx` | 🎯 Multi-step Form | 3-step wizard, per-step schema, password strength, review step |

### ✅ Phase 8 — Performance Optimization

| File | Topic | Concepts |
|------|-------|----------|
| `01_react_memo.tsx` | React.memo | Render comparison, memo + useCallback, custom comparator |
| `02_code_splitting.tsx` | Code Splitting | lazy(), Suspense, startTransition, route-level splitting |
| `03_virtualization.tsx` | Virtualization | useVirtualizer, 5,000 rows, DOM node count comparison |
| `mini_project_data_table.tsx` | 🎯 Data Table | 3,000 rows — memo + useMemo + useCallback + virtualizer combined |

### ✅ Phase 9 — Testing

| File | Topic | Concepts |
|------|-------|----------|
| `01_vitest_rtl.tsx` | Vitest + RTL | Setup, query priority, getBy vs queryBy vs findBy |
| `02_testing_patterns.tsx` | Patterns Overview | AAA pattern, what not to test, matcher reference |
| `__tests__/01_rendering.test.tsx` | Rendering | render(), screen queries, conditional/list rendering (10 tests) |
| `__tests__/02_interaction.test.tsx` | Interaction | userEvent, vi.fn(), toHaveBeenCalledWith (10 tests) |
| `__tests__/03_async.test.tsx` | Async | waitFor, findBy, fake timers, optimistic rollback (8 tests) |
| `__tests__/04_forms.test.tsx` | Forms | getByLabelText, aria-invalid, loading state (10 tests) |
| `__tests__/05_hooks.test.tsx` | Hooks | renderHook, act, useCounter, useToggle, useLocalStorage (17 tests) |
| `mini_project_test_suite.tsx` | 🎯 Test Suite | Live components + test file index |

**Test results: 55/55 passing ✅**

---

## 📦 Dependencies

```
Runtime:
  react, react-dom                    core
  zustand, jotai                      state management
  @tanstack/react-query, swr          data fetching
  @tanstack/react-virtual             virtualization
  react-hook-form, zod                forms & validation
  @hookform/resolvers                 zod ↔ rhf bridge
  @faker-js/faker                     fake data (dev only)

Dev / Testing:
  vite, @vitejs/plugin-react          build
  typescript                          types
  vitest                              test runner
  @testing-library/react              component testing
  @testing-library/jest-dom           custom matchers
  @testing-library/user-event        realistic interactions
  jsdom                               browser DOM simulation
```

---

## 🔗 References

- [Full Learning Guide](./doc/PANDUAN_ZERO_TO_HERO_REACT.md)
- [react.dev](https://react.dev) — Official React docs
- [Kanzan Learn TypeScript](../Kanzan_Learn_Typescript) — Prerequisite repo
