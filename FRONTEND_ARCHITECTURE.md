# Frontend Architecture Reference

This document describes the full architecture of the frontend application: technologies used, folder structure, naming conventions, component patterns, state management, testing, and more. It is intended to be a complete onboarding reference for adapting this architecture to a new project.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Project Bootstrap & Tooling](#2-project-bootstrap--tooling)
3. [Folder Structure](#3-folder-structure)
4. [Naming Conventions](#4-naming-conventions)
5. [Atomic Design](#5-atomic-design)
6. [Component Organization](#6-component-organization)
7. [Routing](#7-routing)
8. [State Management (Zustand)](#8-state-management-zustand)
9. [Server State (TanStack Query + Axios)](#9-server-state-tanstack-query--axios)
10. [Forms (React Hook Form + Zod)](#10-forms-react-hook-form--zod)
11. [i18n (Internationalization)](#11-i18n-internationalization)
12. [TypeScript Types](#12-typescript-types)
13. [Custom Hooks](#13-custom-hooks)
14. [Unit Testing](#14-unit-testing)
15. [PWA & Offline Support](#15-pwa--offline-support)
16. [Utilities & Web Workers](#16-utilities--web-workers)
17. [Styling System](#17-styling-system)
18. [Build & Configuration](#18-build--configuration)
19. [Architecture Principles Summary](#19-architecture-principles-summary)

---

## 1. Tech Stack

### Core Framework
| Package | Version | Purpose |
|--------|---------|---------|
| `react` | ^19.x | UI framework |
| `react-dom` | ^19.x | DOM rendering |
| `typescript` | ~5.9.x | Type safety |
| `vite` | ^7.x | Build tool & dev server |
| `@vitejs/plugin-react-swc` | ^4.x | React + SWC compiler (fast transpilation) |

### State Management
| Package | Version | Purpose |
|--------|---------|---------|
| `zustand` | ^4.5.x | Client/local state management |
| `@tanstack/react-query` | ^5.x | Server state, caching, async data |
| `@tanstack/react-query-persist-client` | ^5.x | Persist server state to IndexedDB |
| `@tanstack/react-query-devtools` | ^5.x | Dev tools for query inspection |

### Forms & Validation
| Package | Version | Purpose |
|--------|---------|---------|
| `react-hook-form` | ^7.x | Form state management |
| `zod` | ^3.x | Schema-based runtime validation |
| `@hookform/resolvers` | ^5.x | Zod adapter for React Hook Form |

### HTTP & API
| Package | Version | Purpose |
|--------|---------|---------|
| `axios` | ^1.x | HTTP client with interceptors |

### Routing
| Package | Version | Purpose |
|--------|---------|---------|
| `react-router-dom` | ^6.x | Client-side routing |

### UI & Styling
| Package | Version | Purpose |
|--------|---------|---------|
| `tailwindcss` | ^4.x | Utility-first CSS framework |
| `@tailwindcss/vite` | ^4.x | Tailwind Vite integration |
| `@radix-ui/*` | ^1.x | Unstyled accessible primitives (Dialog, Select, Switch, Tooltip, Popover, Label, Checkbox) |
| `class-variance-authority` | ^0.7.x | Component variant system (CVA) |
| `clsx` | ^2.x | Conditional class name merging |
| `tailwind-merge` | ^3.x | Safe Tailwind class deduplication |
| `lucide-react` | ^0.5x | Icon library |
| `react-icons` | ^5.x | Additional icon library |
| `framer-motion` | ^12.x | Declarative animations |

### i18n
| Package | Version | Purpose |
|--------|---------|---------|
| `i18next` | ^25.x | Translation engine |
| `react-i18next` | ^16.x | React bindings for i18next |

### Date & Time
| Package | Version | Purpose |
|--------|---------|---------|
| `date-fns` | ^4.x | Date utility functions |
| `react-day-picker` | ^8.x | Calendar/date picker UI |

### Storage & Offline
| Package | Version | Purpose |
|--------|---------|---------|
| `localforage` | ^1.x | IndexedDB wrapper (used as persist storage) |
| `workbox-window` | ^7.x | PWA service worker utilities |

### PWA
| Package | Version | Purpose |
|--------|---------|---------|
| `vite-plugin-pwa` | ^1.x | PWA manifest + service worker generation |

### Image Processing
| Package | Version | Purpose |
|--------|---------|---------|
| `browser-image-compression` | ^2.x | Client-side image compression |
| `heic2any` | ^0.0.x | Convert HEIC/HEIF images to JPEG in browser |

### Miscellaneous
| Package | Version | Purpose |
|--------|---------|---------|
| `input-otp` | ^1.4.x | OTP input component |
| `cmdk` | ^1.x | Command palette UI |
| `react-idle-timer` | ^5.x | Session inactivity detection |

### Dev Dependencies
| Package | Purpose |
|--------|---------|
| `vitest` | Unit test runner |
| `@testing-library/react` | Component testing utilities |
| `@testing-library/dom` | DOM query utilities |
| `jsdom` | Browser environment simulation for tests |
| `eslint` + `typescript-eslint` | Linting |
| `eslint-plugin-react` | React-specific lint rules |
| `prettier` + `prettier-plugin-tailwindcss` | Formatting + Tailwind class sorting |
| `autoprefixer` + `postcss` | CSS post-processing |

---

## 2. Project Bootstrap & Tooling

### Scripts (from `package.json`)
```bash
pnpm install        # Install dependencies
pnpm dev            # Start dev server on port 3001
pnpm build          # TypeScript check + Vite production build
pnpm lint           # Run ESLint
pnpm test           # Run Vitest in watch mode
pnpm test --run     # Run tests once (CI mode)
```

### Run a single test file
```bash
pnpm test src/__tests__/path/to/file.test.ts --run
```

### Code Style (Prettier)
```json
{
  "printWidth": 120,
  "semi": false,
  "tabWidth": 2,
  "singleQuote": true,
  "trailingComma": "none",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```
Key points:
- **No semicolons**
- **Single quotes**
- **120-char line width**
- **No trailing commas**
- **Tailwind class auto-sort** via Prettier plugin

### ESLint
- Flat config (`eslint.config.js`)
- `typescript-eslint` for strict TypeScript rules
- `eslint-plugin-react` for React rules
- `eslint-plugin-perfectionist` for alphabetical sorting of object keys and imports
- `eslint-plugin-react-hooks` for exhaustive deps enforcement
- Rule: no unused locals or parameters

---

## 3. Folder Structure

```
src/
├── __tests__/                        # All test files (mirrors src/ structure)
│   ├── components/                   # Component unit tests
│   │   ├── <feature-name>/
│   │   └── ui/
│   ├── context/                      # Store tests
│   ├── helpers/                      # Utility helper tests
│   ├── hooks/                        # Custom hook tests
│   ├── pages/                        # Page component tests
│   └── services/                     # API service tests
│
├── components/                       # All React components (feature-based)
│   ├── <feature-name>/               # One folder per feature
│   │   ├── index.ts                  # Barrel export
│   │   ├── <feature>-<ui-pattern>.tsx  # e.g. assignments-table.tsx
│   │   ├── use-<feature>.ts          # Hook with business logic
│   │   ├── <sub-feature>-modal.tsx   # Feature-specific modal
│   │   └── <sub-feature>/            # Complex sub-feature sub-folder
│   ├── shared/                       # Components shared across features
│   │   ├── ui/                       # Layout components (header, sidebar)
│   │   └── <shared-modal>.tsx
│   └── ui/                           # Reusable atomic component library
│       ├── index.ts
│       ├── button.tsx                # Atom
│       ├── input.tsx                 # Atom
│       ├── form-fields/              # Molecules (form-aware field wrappers)
│       │   ├── input-field.tsx
│       │   ├── select-field.tsx
│       │   ├── date-field.tsx
│       │   └── ...
│       ├── table/                    # Organism (full table system)
│       │   ├── table.tsx
│       │   ├── table-header.tsx
│       │   ├── table-body.tsx
│       │   └── ...
│       ├── modal/                    # Organism (modal variants)
│       ├── toast/                    # Toast notification system
│       └── <domain>/                 # Domain-specific UI (e.g. inspection-report/)
│
├── context/                          # Zustand stores + providers
│   ├── <feature>-store.ts            # Feature slice store
│   ├── internet-status.tsx           # Online/offline provider component
│   └── tanstack.tsx                  # TanStack Query provider + persister setup
│
├── hooks/                            # Custom React hooks
│   ├── use-auth.ts                   # Authentication logic
│   ├── use-bound-store.ts            # Composed Zustand store
│   ├── use-pagination-query.ts       # TanStack Query pagination wrapper
│   ├── use-internet-connection.ts    # Online/offline detection
│   ├── use-toast.ts                  # Toast notification hook
│   ├── use-decryption-worker.ts      # Web Worker abstraction
│   ├── <domain>/                     # Domain-grouped hooks
│   │   └── use-<action>.ts
│   └── index.ts                      # Barrel export
│
├── locales/                          # i18n translation files
│   └── es/                           # Spanish (or your target language)
│       ├── <feature>.json            # One file per feature namespace
│       └── index.ts                  # Exports all locales
│
├── pages/                            # Route-level page components
│   ├── 404.tsx
│   ├── 500.tsx
│   ├── login.tsx
│   ├── home.tsx
│   └── <feature>.tsx                 # One page per route
│
├── services/                         # API service functions (feature-based)
│   ├── api-config.ts                 # Axios instance + interceptors
│   ├── <feature>/                    # Feature-specific API calls
│   │   └── <feature>.ts
│   ├── shared/                       # Shared/cross-feature services
│   │   └── <cache-service>/
│   └── <simple-feature>.ts           # Single-file services
│
├── styles/
│   └── global.css                    # Tailwind directives + custom CSS
│
├── types/                            # TypeScript type definitions (feature-based)
│   ├── shared/                       # Common types used across features
│   │   ├── index.ts
│   │   ├── pagination.ts
│   │   └── api.ts
│   ├── <feature>/                    # Feature-specific types
│   │   ├── index.ts
│   │   └── <feature>.ts
│   ├── login.ts
│   └── routes.ts
│
├── utils/                            # Pure utility functions and constants
│   ├── consts/                       # Application-wide constants
│   │   ├── auth.ts
│   │   ├── role-id.ts
│   │   ├── status-labels.ts
│   │   └── ...
│   ├── dictionary/                   # Lookup maps (e.g. route paths)
│   │   └── routes.ts
│   ├── helpers/                      # Pure helper functions
│   │   ├── offline-storage.ts        # IndexedDB abstraction
│   │   ├── transform-<entity>.ts     # Data transformation helpers
│   │   └── ...
│   ├── zod-validations.ts            # Reusable Zod field validators
│   ├── utils.ts                      # General utilities (cn, getInitials, etc.)
│   ├── dom-polyfills.ts              # Browser polyfills
│   └── index.ts
│
├── workers/                          # Web Workers (off-main-thread processing)
│   └── decryption.worker.ts
│
├── App.tsx                           # Root component (router setup)
├── main.tsx                          # Entry point (ReactDOM render)
├── routes.tsx                        # Route definitions
├── providers.tsx                     # Global provider wrapper
├── setupTests.ts                     # Vitest global test setup
└── vite-env.d.ts                     # Vite type declarations
```

---

## 4. Naming Conventions

### Files

| Pattern | Where | Examples |
|--------|-------|---------|
| `kebab-case.tsx` | All component files | `assignments-table.tsx`, `login-form.tsx` |
| `kebab-case.ts` | Hooks, services, utils, types | `use-auth.ts`, `get-assignments.ts`, `login.ts` |
| `use-<feature>.ts` | Custom hooks | `use-assignments.ts`, `use-pagination-query.ts` |
| `<feature>-schema.ts` | Zod schemas colocated with forms | `login-form-schema.ts`, `step-form-schema.ts` |
| `<feature>-store.ts` | Zustand slice stores | `auth-slice-store.ts`, `home-store.ts` |
| `<feature>-modal.tsx` | Modal components | `sync-modal.tsx`, `confirm-back-modal.tsx` |
| `index.ts` | Barrel exports in each folder | Every feature folder has one |

### Exported Identifiers

| Pattern | Where | Examples |
|--------|-------|---------|
| `PascalCase` | React components | `AssignmentsTable`, `LoginForm`, `InputField` |
| `camelCase` | Functions, variables, hooks | `useAuth`, `getAssignmentsTable`, `loginSchema` |
| `SCREAMING_SNAKE_CASE` | Module-level constants | `ONE_WEEK_MS`, `MAX_CACHE_SIZE`, `API_URL` |
| `PascalCase` | TypeScript interfaces/types | `LoginResponse`, `GetAssignmentsTableResponse` |
| `camelCase` | Zod schemas | `loginSchema`, `stepFormSchema` |

### Import Alias
All internal imports use the `@/` alias which resolves to `./src/`:
```typescript
import { useAuth } from '@/hooks'
import { Button } from '@/components/ui'
import { getAssignmentsTable } from '@/services/assignments'
```

---

## 5. Atomic Design

The `components/ui/` folder applies atomic design with three levels. Feature folders build on top of these atoms and molecules.

### Atoms — Standalone, no feature context
Located at the root of `components/ui/`. These components have no knowledge of forms, data, or features. They only receive props and render UI.

```typescript
// components/ui/button.tsx
const buttonVariants = cva(
  'transition-all duration-400 ease-in-out rounded-[12px] font-semibold',
  {
    variants: {
      variant: {
        primary:  'bg-primary text-white hover:bg-primary-950',
        tertiary: 'text-secondary bg-tertiary-50 border border-border',
        ghost:    'bg-transparent border border-transparent'
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base'
      }
    },
    defaultVariants: { variant: 'primary', size: 'md' }
  }
)

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

export const Button = ({ variant, size, isLoading, children, ...props }: ButtonProps) => (
  <button
    className={cn(buttonVariants({ variant, size }))}
    disabled={props.disabled || isLoading}
    {...props}
  >
    {isLoading ? <Spinner /> : children}
  </button>
)
```

**Examples of Atoms:**
- `button.tsx` — CVA variants (primary, tertiary, ghost)
- `input.tsx` — Base Radix UI input
- `checkbox.tsx` — Radix checkbox
- `switch.tsx` — Toggle switch
- `spinner.tsx` — Loading spinner
- `alert.tsx` — Alert banner
- `label.tsx` — Accessible form label
- `progress-bar.tsx` — Progress indicator

### Molecules — Atoms composed for form context
Located in `components/ui/form-fields/`. These wrap atoms with React Hook Form's `FormField` and add labels and error messages.

```typescript
// components/ui/form-fields/input-field.tsx
interface InputFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  placeholder?: string
  type?: HTMLInputTypeAttribute
}

export const InputField = <T extends FieldValues>({
  control, name, label, placeholder, type = 'text'
}: InputFieldProps<T>) => (
  <FormField
    control={control}
    name={name}
    render={({ field, fieldState }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input {...field} type={type} placeholder={placeholder} />
        </FormControl>
        <FormMessage>{fieldState.error?.message}</FormMessage>
      </FormItem>
    )}
  />
)
```

**Examples of Molecules:**
- `form-fields/input-field.tsx` — Input + Label + FormMessage
- `form-fields/select-field.tsx` — Select + Label
- `form-fields/date-field.tsx` — Date picker + Label
- `form-fields/textarea-field.tsx`
- `form-fields/otp-field.tsx`
- `password-validator.tsx` — Password strength indicator

### Organisms — Complex, composed UI
Located in subdirectories of `components/ui/` or directly in feature folders. These combine multiple molecules and have internal structure.

**Examples of Organisms:**
- `table/` — Full table system (header, body, row, cell, pagination)
- `modal/` — Dialog wrapper with content slots
- `toast/` — Notification system (provider + hook)
- Feature-specific organisms inside `components/<feature>/`

### Domain-Specific UI
Sometimes atoms or molecules are domain-specific and live in `components/ui/<domain>/`. These are still reusable within the domain but are not generic enough to be atoms.

```
components/ui/
└── inspection-report/      ← domain-specific UI atoms/molecules
    ├── stepper.tsx
    ├── navigation-buttons.tsx
    └── info-input/
        ├── info-input.tsx
        └── info-input-readonly.tsx
```

---

## 6. Component Organization

### Feature Folder Pattern
Every feature lives in its own folder under `components/`. The pattern is:

```
components/<feature-name>/
├── index.ts                        # Barrel: re-exports public API of this feature
├── <feature>-<pattern>.tsx         # Main component (table, form, card, list)
├── use-<feature>.ts                # Custom hook with ALL business logic
├── <feature>-schema.ts             # Zod schema (if the feature has a form)
├── <action>-modal.tsx              # Simple modals as flat files
└── <complex-sub-feature>/          # Sub-folder for complex sub-features
    ├── index.ts
    ├── <sub-feature>.tsx
    └── use-<sub-feature>.ts
```

**Golden rule:** Components are thin UI shells. Business logic lives in the colocated `use-<feature>.ts` hook.

### Example: Simple Feature
```
components/login/
├── index.ts
├── login-form.tsx          # UI: renders inputs and button
├── use-login.ts            # Logic: form setup, onSubmit, API call
└── login-form-schema.ts    # Schema: Zod definition + inferred type
```

`login-form.tsx` renders only JSX, delegates everything to `use-login.ts`:
```typescript
export const LoginForm = () => {
  const { form, isLoading, onSubmit } = useLogin()

  return (
    <Form {...form}>
      <InputField control={form.control} name="user" label={t('user.label')} />
      <InputField control={form.control} name="password" type="password" label={t('password.label')} />
      <Button isLoading={isLoading} onClick={form.handleSubmit(onSubmit)}>
        {t('buttons.login')}
      </Button>
    </Form>
  )
}
```

### Example: Complex Feature
```
components/assignments/
├── index.ts
├── assignments-table/
│   ├── index.ts
│   ├── assignments-table.tsx         # Renders table UI
│   ├── use-assignments.ts            # Pagination, sync state, handlers
│   ├── sync-modal.tsx
│   ├── redirect-modal.tsx
│   └── appraisal-sync-manager.tsx    # Offline sync orchestrator
└── start-inspection-modal/
    ├── index.ts
    ├── start-inspection-modal.tsx
    └── modal-content.tsx
```

### Shared Components
Cross-feature components live in `components/shared/`:
```
components/shared/
├── ui/                        # Layout: header, sidebar, base-layout
├── evidence-modal/
└── order-summary-modal/
```

---

## 7. Routing

### Definition (`src/routes.tsx`)
Routes are defined as typed objects with lazy loading. Each route is a dynamic `import()`.

```typescript
interface RouteProps {
  path: string
  isAuthRestricted: boolean
  lazy: () => Promise<{ element: JSX.Element }>
}

export const routes: RouteProps[] = [
  {
    path: '/',
    isAuthRestricted: false,
    lazy: async () =>
      import('@/pages/login').then(({ Login }) => ({ element: <Login /> }))
  },
  {
    path: '/assignments',
    isAuthRestricted: true,
    lazy: async () =>
      import('@/pages/assignments').then(({ default: Page }) => ({ element: <Page /> }))
  }
]
```

### Role-Based Dynamic Routes
Routes can also be injected dynamically based on roles returned from the API:

```typescript
export function filterAccessibleRoutes(routes, user, roleRoutes = []) {
  const isAuthenticated = user !== null

  const roleBasedRoutes = roleRoutes.map((route) => ({
    path: route.path,
    lazy: async () =>
      import(`./pages/${route.component}.tsx`).then((module) => ({
        element: <module.default />
      }))
  }))

  return isAuthenticated
    ? [...restrictedRoutes, ...roleBasedRoutes]
    : unrestrictedRoutes
}
```

### Router Setup (`src/App.tsx`)
```typescript
function App() {
  const user = useBoundStore((s) => s.user)
  const { accessibleRoutes } = useAccessibleRoutes(user)

  return (
    <RouterProvider
      router={createBrowserRouter(
        [{ element: <Providers />, children: accessibleRoutes }],
        { basename: PUBLIC_URL }
      )}
    />
  )
}
```

### Key Points
- Lazy loading for every page via dynamic `import()`
- Routes filtered by `isAuthRestricted` and auth state
- `basename` from env variable for flexible deployment path
- Pages export a default component for dynamic import compatibility

### Page Files (`src/pages/`)
Page files are thin wrappers that place the feature component inside the layout:

```typescript
// pages/assignments.tsx
export default function AssignmentsPage() {
  return (
    <BaseLayout title="Mis asignaciones">
      <Card>
        <CardHeader><CardTitle>Asignaciones activas</CardTitle></CardHeader>
        <CardContent><AssignmentsTable /></CardContent>
      </Card>
    </BaseLayout>
  )
}
```

---

## 8. State Management (Zustand)

### Architecture: Slice Pattern
Client state is split into feature slices, each in its own file, and composed into a single `useBoundStore`.

### Slice Definition (`src/context/auth-slice-store.ts`)
```typescript
import { type StateCreator } from 'zustand'
import { LoginResponse } from '@/types/login'
import { Nulleable } from '@/utils'

export interface AuthActions {
  setAuth: (auth: LoginResponse) => void
  resetAuth: () => void
  updateTokens: (tokens: Pick<LoginResponse, 'accessToken' | 'refreshToken'>) => void
}

export type AuthSlice = Nulleable<LoginResponse> & AuthActions

const initialState: Nulleable<LoginResponse> = {
  accessToken: null,
  refreshToken: null,
  user: null
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  ...initialState,
  setAuth: (newState) => set(newState),
  resetAuth: () => set(initialState),
  updateTokens: (tokens) => set((state) => ({ ...state, ...tokens }))
})
```

### Composed Store with Persistence (`src/hooks/use-bound-store.ts`)
```typescript
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createAuthSlice, AuthSlice } from '@/context/auth-slice-store'
import { createHomeSlice, HomeSlice } from '@/context/home-store'

type Store = AuthSlice & HomeSlice

export const useBoundStore = create(
  persist<Store>(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createHomeSlice(...a)
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user
      }),
      storage: createJSONStorage(() => localStorage)
    }
  )
)
```

### Accessing the Store
```typescript
// In components: select only what you need (prevents unnecessary re-renders)
const user = useBoundStore((s) => s.user)
const { setAuth, resetAuth } = useBoundStore()

// Outside React (e.g. Axios interceptors): use getState()
const { accessToken } = useBoundStore.getState()
```

### Store Files Summary
| File | Manages |
|------|---------|
| `auth-slice-store.ts` | Auth tokens, user data, OTP state |
| `home-store.ts` | Layout state (sidebar open, loading states) |
| `inspection-report-store.ts` | Multi-step form state, current step, cache |
| `new-request-store.ts` | New request form state |
| `reset-password-store.ts` | Password reset flow state |
| `users-management-store.ts` | Admin user management UI state |

### When to Use Zustand vs TanStack Query
- **Zustand**: UI state, auth state, form wizard state, local app state that doesn't come from the server
- **TanStack Query**: Anything fetched from the API (use Query for reads, Mutation for writes)

---

## 9. Server State (TanStack Query + Axios)

### Axios Instance (`src/services/api-config.ts`)
A single Axios instance is shared across all services.

```typescript
const apiConfig = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

// Attach auth token to every request
apiConfig.interceptors.request.use((config) => {
  const { accessToken } = useBoundStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// Handle 401: refresh token + retry original request
let refreshPromise: Promise<void> | null = null

apiConfig.interceptors.response.use(
  (response) => response.data,      // unwrap data automatically
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      if (!refreshPromise) {
        refreshPromise = refreshToken().finally(() => { refreshPromise = null })
      }
      await refreshPromise
      return apiConfig(error.config)  // retry original request
    }
    return Promise.reject(error)
  }
)

export default apiConfig
```

**Key design decisions:**
- Response interceptor unwraps `response.data` automatically — service functions receive data directly, not the full Axios response
- 401 handling refreshes the token once (even if multiple requests fail simultaneously) using a shared promise
- `_retry` flag prevents infinite refresh loops

### Service Functions (`src/services/<feature>/`)
Thin wrappers over `apiConfig`. No logic, just HTTP calls:

```typescript
// services/assignments/assignments.ts
import apiConfig from '@/services/api-config'
import { PaginationQueryResponse, GetAssignmentsTableResponse } from '@/types'

export const getAssignmentsTable = (
  params: Record<string, string>
): Promise<PaginationQueryResponse<GetAssignmentsTableResponse>> =>
  apiConfig.get('/inspectionReports/assigned-list', { params })

export const syncAssignment = (id: number): Promise<void> =>
  apiConfig.post(`/inspectionReports/${id}/sync`)
```

### Query Provider (`src/context/tanstack.tsx`)
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: ONE_WEEK_MS,        // Data stays fresh for 1 week
      gcTime: ONE_WEEK_MS,           // Cache retained for 1 week
      refetchOnMount: 'always',      // Always refetch when component mounts
      retry: 0,                      // No automatic retry on failure
      networkMode: 'online'          // Only fetch when online
    }
  }
})

// Persist cache to IndexedDB via localforage
const persister: Persister = {
  persistClient: async (client) => {
    await localforage.setItem(CACHE_KEY, client)
  },
  restoreClient: async () => {
    return await localforage.getItem(CACHE_KEY) ?? undefined
  },
  removeClient: async () => {
    await localforage.removeItem(CACHE_KEY)
  }
}

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools />}
    </PersistQueryClientProvider>
  )
}
```

**Important:** Never use debounce inside `persistClient`. It causes stale data warnings in TanStack Query persist client.

### Pagination Hook Pattern (`src/hooks/use-pagination-query.ts`)
A reusable hook that wraps `useQuery` and handles pagination parameters:

```typescript
interface UsePaginationQueryOptions<T> {
  queryKeyBase: QueryKey
  queryFn: (params: PaginationParams) => Promise<PaginationQueryResponse<T>>
  initialPageIndex?: number
  initialPageSize?: number
  enabled?: boolean
  gcTime?: number
}

export const usePaginationQuery = <T>({
  queryKeyBase, queryFn, initialPageIndex = 1, initialPageSize = 10, enabled = true, gcTime
}: UsePaginationQueryOptions<T>) => {
  const [pageIndex, setPageIndex] = useState(initialPageIndex)
  const [pageSize] = useState(initialPageSize)

  const { data, isFetching, refetch } = useQuery({
    queryKey: [...queryKeyBase, pageIndex, pageSize],
    queryFn: () => queryFn({ pageIndex, pageSize }),
    enabled,
    gcTime
  })

  return {
    paginationData: data,
    isFetching,
    pageIndex,
    goToPage: setPageIndex,
    refetch
  }
}
```

### Usage in Feature Hooks
```typescript
// components/assignments/use-assignments.ts
export const useAssignmentsTable = (filterQuery: FilterQuery) => {
  const { paginationData, isFetching, goToPage, refetch } =
    usePaginationQuery<GetAssignmentsTableResponse>({
      queryKeyBase: ['assignments', 'table', JSON.stringify(filterQuery)],
      queryFn: (params) => getAssignmentsTable({ ...params, ...filterQuery }),
      initialPageIndex: 1,
      initialPageSize: 10,
      gcTime: 28800000   // 8 hours for this specific query
    })

  return { paginationData, isFetching, goToPage, refetch }
}
```

---

## 10. Forms (React Hook Form + Zod)

### Schema Definition Pattern
Schemas live in `<feature>-schema.ts` files colocated with the component that uses them.

```typescript
// components/login/login-form-schema.ts
import { z } from 'zod'
import { v } from '@/utils/zod-validations'

export const loginSchema = (isOTPActive: boolean, otpLength: number) =>
  z.object({
    user: v.string({ required: true }),
    password: v.string({ required: true }),
    otp: isOTPActive
      ? v.string({ required: true, type: 'onlyAlphanumeric', min: otpLength, max: otpLength })
      : v.string({ required: false }).optional().nullable()
  })

// Type inferred directly from schema — no manual interface needed
export type Login = z.infer<ReturnType<typeof loginSchema>>
```

### Reusable Zod Validators (`src/utils/zod-validations.ts`)
A `v` object provides typed field validators with common rules pre-applied:

```typescript
const FORM_ERRORS = {
  REQUIRED: 'Este campo es requerido',
  INVALID_EMAIL: 'Email inválido',
  MIN_LENGTH: (n: number) => `Mínimo ${n} caracteres`
}

type StringType = 'text' | 'email' | 'password' | 'phoneNumber' | 'onlyAlphanumeric' | 'onlyText' | 'website'

const stringField = ({ required = true, min, max, type = 'text' }: StringFieldOptions) => {
  let field = z.string({ required_error: FORM_ERRORS.REQUIRED })
  if (required) field = field.min(1, FORM_ERRORS.REQUIRED)
  if (min)      field = field.min(min, FORM_ERRORS.MIN_LENGTH(min))
  if (max)      field = field.max(max)
  if (type === 'email')         field = field.email(FORM_ERRORS.INVALID_EMAIL)
  if (type === 'onlyAlphanumeric') field = field.regex(/^[a-zA-Z0-9]+$/, 'Solo alfanumérico')
  if (type === 'phoneNumber')   field = field.regex(/^\d{10}$/, 'Teléfono inválido')
  return field
}

export const v = {
  string:      stringField,
  number:      numberField,
  date:        dateField,
  boolean:     booleanField,
  selectString: selectStringField,
  array:       arrayField,
  dateRange:   dateRange
}
```

### Form Implementation in Hook
```typescript
// components/login/use-login.ts
export const useLogin = () => {
  const isOTPActive = useBoundStore((s) => s.isOTPActive)
  const otpLength = 6

  const form = useForm<Login>({
    resolver: zodResolver(loginSchema(isOTPActive, otpLength)),
    defaultValues: { user: '', password: '', otp: null }
  })

  const onSubmit = async (data: Login) => {
    // API call
  }

  return { form, isLoading, onSubmit }
}
```

### Form Rendering in Component
```typescript
// components/login/login-form.tsx
export const LoginForm = () => {
  const { t } = useTranslation('login')
  const { form, isLoading, onSubmit } = useLogin()

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <InputField
          control={form.control}
          name="user"
          label={t('form.inputs.user.label')}
          placeholder={t('form.inputs.user.placeholder')}
        />
        <InputField
          control={form.control}
          name="password"
          type="password"
          label={t('form.inputs.password.label')}
        />
        <Button type="submit" isLoading={isLoading}>
          {t('form.buttons.login')}
        </Button>
      </form>
    </Form>
  )
}
```

### Form Field Components (`components/ui/form-fields/`)
These wrap `FormField` from React Hook Form and the base UI atoms. They accept `control` and `name` as typed generic props:

| Component | Wraps | Use case |
|-----------|-------|---------|
| `InputField` | `Input` atom | Text, email, password, number inputs |
| `SelectField` | `Select` atom | Dropdown selects |
| `DateField` | `DayPicker` | Date selection |
| `TextareaField` | `Textarea` | Multiline text |
| `OtpField` | `InputOTP` | One-time password input |

---

## 11. i18n (Internationalization)

### Setup
i18next with `react-i18next`. Each feature has its own **namespace** (one JSON file = one namespace).

### File Structure
```
src/locales/
└── es/
    ├── index.ts                    # Imports and re-exports all namespaces
    ├── login.json
    ├── assignments.json
    ├── inspection-report.json
    ├── user-management.json
    ├── ui.json                     # Shared UI text (buttons, labels, errors)
    └── <feature>.json
```

### Locale File Structure
Keys are nested: `section > subsection > key`. This maps to the UI hierarchy.

```json
// locales/es/login.json
{
  "login_form": {
    "form": {
      "inputs": {
        "user":     { "label": "Usuario",      "placeholder": "Ingresa tu usuario" },
        "password": { "label": "Contraseña",   "placeholder": "Ingresa tu contraseña" },
        "otp":      { "label": "Código OTP" }
      },
      "buttons": {
        "login":      "Iniciar sesión",
        "resend_otp": "Reenviar OTP"
      }
    },
    "forgot_password": "Olvidé mi contraseña",
    "type_otp":        "Ingresa el código OTP enviado al correo del usuario"
  }
}
```

### Usage in Components
```typescript
import { useTranslation } from 'react-i18next'

const LoginForm = () => {
  const { t } = useTranslation('login')   // 'login' = namespace = file name

  return (
    <label>{t('login_form.form.inputs.user.label')}</label>
  )
}
```

### Testing Convention
In unit tests, mock `useTranslation` so `t(key)` returns the key itself. This means assertions check i18n keys, not literal strings, which avoids brittle tests that break when translations change:

```typescript
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))
```

---

## 12. TypeScript Types

### Organization
Types are organized by feature, mirroring the `components/` and `services/` structure. Each feature folder has a barrel `index.ts`.

```
types/
├── shared/
│   ├── index.ts          # User, LoginResponse, ApiError, etc.
│   ├── pagination.ts     # PaginationQueryResponse, PaginationParams
│   └── api.ts            # Generic API response wrappers
├── <feature>/
│   ├── index.ts          # Barrel export
│   └── <feature>.ts      # Feature-specific types
├── login.ts
└── routes.ts             # RouteProps type
```

### Type Definition Conventions
```typescript
// types/assignments/assignments.ts

// Use 'interface' for object shapes (extendable)
export interface GetAssignmentsTableResponse {
  id:          number
  orderNumber: string
  date:        string
  client:      Client
  answers:     AssignmentsAnswer[]
  plan?:       Plan
}

// Use 'type' for unions, intersections, and aliases
export type AssignmentStatus = 'Asignado' | 'En curso' | 'Finalizado'

// Inline interfaces for nested data (not exported unless needed elsewhere)
interface Client {
  name:           string
  licensePlate:   string
  identification: string
}
```

### Shared Utility Types (`utils/utils.ts`)
```typescript
// Makes all properties of T nullable
export type Nulleable<T> = { [key in keyof T]: T[key] | null }

// Example usage in store:
type AuthState = Nulleable<LoginResponse>  // all fields become T | null
```

### Schema-Inferred Types
Never write manual types for form data. Infer directly from Zod schemas:

```typescript
export const loginSchema = () => z.object({ user: z.string(), password: z.string() })
export type Login = z.infer<ReturnType<typeof loginSchema>>
// Login = { user: string; password: string }
```

---

## 13. Custom Hooks

### Naming & Location
- Hooks use the `use-` prefix in kebab-case filenames: `use-auth.ts`, `use-pagination-query.ts`
- General-purpose hooks live in `src/hooks/`
- Domain-specific hooks live in `src/hooks/<domain>/`
- Feature-specific hooks are colocated with their component: `src/components/<feature>/use-<feature>.ts`

### Hook Inventory (`src/hooks/`)

| Hook | Purpose |
|------|---------|
| `use-auth.ts` | Login/logout logic, OTP handling |
| `use-bound-store.ts` | Re-exports the composed Zustand store |
| `use-pagination-query.ts` | TanStack Query wrapper for paginated endpoints |
| `use-internet-connection.ts` | Detect online/offline status |
| `use-decryption-worker.ts` | Abstracts Web Worker for encryption/decryption |
| `use-file-uploader.ts` | File selection, compression, and upload |
| `use-infinite-scroll.ts` | Intersection Observer for infinite scroll |
| `use-countdown.ts` | Countdown timer (OTP expiry) |
| `use-refresh-token.ts` | Token refresh logic (used in interceptor) |
| `use-toast.ts` | Programmatic toast notification API |
| `use-accessible-routes.ts` | Filter routes by user role |

### Hook Pattern
```typescript
// hooks/use-internet-connection.ts
export const useInternetConnection = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline  = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline }
}
```

### Feature Hook Pattern
Feature hooks hold ALL business logic. The component becomes a dumb shell:

```typescript
// components/assignments/use-assignments.ts
export const useAssignments = () => {
  const { isOnline } = useInternetConnection()
  const user = useBoundStore((s) => s.user)
  const [filterQuery, setFilterQuery] = useState<FilterQuery>({})

  const { paginationData, isFetching, goToPage } = usePaginationQuery({
    queryKeyBase: ['assignments', JSON.stringify(filterQuery)],
    queryFn: (params) => getAssignmentsTable({ ...params, ...filterQuery }),
    enabled: isOnline
  })

  const handleFilter = (filter: FilterQuery) => setFilterQuery(filter)

  return { paginationData, isFetching, goToPage, handleFilter, user }
}
```

---

## 14. Unit Testing

### Framework & Libraries
- **Vitest** — test runner (compatible with Jest API)
- **@testing-library/react** — render components and query DOM
- **@testing-library/dom** — DOM query utilities
- **jsdom** — simulates browser environment

### File Location
Tests mirror the `src/` structure under `src/__tests__/`:
```
src/__tests__/
├── components/
│   ├── login/
│   │   └── login-form.test.tsx
│   └── assignments/
│       └── assignments-table.test.tsx
├── hooks/
│   └── use-pagination-query.test.ts
└── services/
    └── assignments.test.ts
```

### Test File Conventions

```typescript
// __tests__/components/login/login-form.test.tsx
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from '@/components/login'

// --- Mocks ---
// 1. i18n: always mock, assert on keys not text
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

// 2. Auth hook: full mock with vi.fn() to avoid store/router deps
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>()
  return {
    ...actual,
    useAuth: vi.fn()
  }
})

// 3. Zustand store: preserve other exports with importOriginal
vi.mock('@/context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/context')>()
  return {
    ...actual,
    useBoundStore: vi.fn()
  }
})

// 4. Child components: mock atoms to avoid deep dependency trees
vi.mock('@/components/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/ui')>()
  return {
    ...actual,
    Button: ({ children, disabled, isLoading, type = 'submit', ...props }: ButtonProps) => (
      <button type={type} disabled={disabled || isLoading} {...props}>{children}</button>
    ),
    InputField: ({ name, label }: InputFieldProps) => (
      <input data-testid={`input-${name}`} aria-label={label} />
    )
  }
})

// --- Test Suite ---
describe('LoginForm', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useAuth as Mock).mockReturnValue({
      form: { control: {}, handleSubmit: (fn: Function) => () => fn({ user: 'test' }) },
      isLoading: false,
      onSubmit: mockOnSubmit
    })
  })

  it('renders user and password inputs', () => {
    render(<LoginForm />)
    expect(screen.getByTestId('input-user')).toBeInTheDocument()
    expect(screen.getByTestId('input-password')).toBeInTheDocument()
  })

  it('disables submit button while loading', () => {
    ;(useAuth as Mock).mockReturnValue({ ..., isLoading: true })
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: /login/ })).toBeDisabled()
  })

  describe('when form is submitted', () => {
    it('calls onSubmit with form data', async () => {
      render(<LoginForm />)
      fireEvent.click(screen.getByRole('button'))
      await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledWith({ user: 'test' }))
    })
  })
})
```

### Critical Mocking Rules

1. **`useTranslation`**: Always mock as `t: (key) => key`. Never assert on translated strings.

2. **`useAuth` from `@/hooks`**: Mock completely with `vi.fn()`. Never import the real implementation in tests to avoid triggering store/router dependencies.

3. **Zustand stores**: Use `importOriginal` to preserve other exports. Override only the specific store being tested:
   ```typescript
   vi.mock('@/context', async (importOriginal) => ({
     ...(await importOriginal()),
     useBoundStore: vi.fn()
   }))
   ```

4. **Button mock**: Apply `disabled={disabled || isLoading}` to match real Button behavior. Default `type` to `'submit'`.

5. **`vi.mock` at module top level only**: Never use `require()` inside `beforeEach`. ESM module mocks must be at the top level.

6. **Named vs default exports**: Named: `{ ComponentName: () => ... }`. Default: `{ default: () => ... }`.

7. **No comments inside test files**.

8. **React Hook Form `formState.errors`**: In `renderHook`, access errors inside the hook callback (to subscribe the proxy):
   ```typescript
   const { result } = renderHook(() => {
     const hook = useMyForm()
     return { errors: hook.form.formState.errors }  // access inside callback
   })
   ```

### Always update `unit-tests.md`
After writing or modifying any frontend unit test, update `.claude/unit-tests.md` with any new pattern, convention, or exception discovered.

---

## 15. PWA & Offline Support

### Service Worker (Vite Plugin PWA + Workbox)
```typescript
// vite.config.ts
VitePWA({
  registerType: 'autoUpdate',           // SW updates silently in background
  devOptions: { enabled: false },        // Disabled in dev to avoid interference
  manifest: {
    name: 'App Name',
    short_name: 'App',
    display: 'standalone',
    theme_color: '#ffffff',
    background_color: '#ffffff',
    start_url: '/'
  },
  workbox: {
    cacheId: 'app-v3.0-pwa',
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    navigateFallback: '/index.html',
    cleanupOutdatedCaches: true,
    maximumFileSizeToCacheInBytes: 3 * 1024 * 1024    // 3MB limit per file
  }
})
```

### Offline Data Persistence
Two layers of offline data:

**Layer 1 — TanStack Query cache** (server state):
- Persisted to IndexedDB via `localforage`
- Stale time: 1 week (data considered fresh and not refetched)
- GC time: 1 week (cache retained even when unused)
- `networkMode: 'online'` prevents queries from running offline

**Layer 2 — Custom IndexedDB storage** (form data):
- Large form data stored directly to IndexedDB via `localforage`
- Abstracted via `src/utils/helpers/offline-storage.ts`
- Used for form caching (inspection reports, appraisals) to survive page reloads

### Online/Offline Detection
```typescript
// hooks/use-internet-connection.ts
export const useInternetConnection = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  // listens to window 'online' / 'offline' events
  return { isOnline }
}

// context/internet-status.tsx
// Provider that broadcasts online/offline state via context
```

### Web Worker (`src/workers/decryption.worker.ts`)
Offloads CPU-intensive encryption/decryption operations from the main thread:

```typescript
// Usage via hook:
const { encryptAsync, decryptAsync } = useDecryptionWorker()

// Internally spawns a Worker and communicates via postMessage
const encrypted = await encryptAsync(sensitiveData)
```

---

## 16. Utilities & Web Workers

### Utility Layer (`src/utils/`)

#### `utils.ts` — General-purpose utilities
```typescript
// Merge Tailwind classes safely (used everywhere for conditional classes)
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// Make all fields of a type nullable (used in Zustand initial states)
export type Nulleable<T> = { [key in keyof T]: T[key] | null }

// Extract initials from a full name
export function getInitials(fullName: string): string { ... }

// Transform API list to { value, label } for Select components
export function transformToSelect<T>(
  data: T[],
  valueKey: keyof T,
  labelKey: keyof T
): SelectOption[] { ... }
```

#### `zod-validations.ts` — Reusable field validators
The `v` object serves as a typed DSL for defining form fields:
```typescript
const schema = z.object({
  name:   v.string({ required: true }),
  email:  v.string({ required: true, type: 'email' }),
  phone:  v.string({ required: false, type: 'phoneNumber' }),
  age:    v.number({ required: true, min: 18, max: 99 }),
  date:   v.date({ required: true }),
  active: v.boolean()
})
```

#### `consts/` — Application constants
```
consts/
├── auth.ts            # Token names, OTP length, session timeout
├── role-id.ts         # Numeric role IDs mapped to readable names
├── status-labels.ts   # Status codes mapped to display strings
├── indexed-db.ts      # IndexedDB store names and TTL config
└── images.ts          # Max file sizes, accepted MIME types
```

#### `helpers/` — Pure transformation functions
```
helpers/
├── offline-storage.ts        # IndexedDB get/set/remove wrappers
├── transform-answers.ts      # API response → form format
├── transform-sections.ts     # Section data normalization
├── validate-email.ts         # Standalone email validator
└── parse-image-validation.ts # Parse image constraints from server
```

#### `dictionary/` — Lookup maps
```typescript
// utils/dictionary/routes.ts
export const ROUTES = {
  LOGIN:       '/',
  HOME:        '/home',
  ASSIGNMENTS: '/assignments',
  REPORT:      '/inspection-report/:id'
} as const
```

### Web Workers (`src/workers/`)
Workers are used for CPU-intensive tasks that would block the UI:

```typescript
// workers/decryption.worker.ts
self.onmessage = ({ data: { type, payload } }) => {
  if (type === 'ENCRYPT') {
    const result = performEncryption(payload)
    self.postMessage({ type: 'ENCRYPTED', result })
  }
  if (type === 'DECRYPT') {
    const result = performDecryption(payload)
    self.postMessage({ type: 'DECRYPTED', result })
  }
}
```

The worker is wrapped in `use-decryption-worker.ts` which handles spawning, message passing, and cleanup.

---

## 17. Styling System

### Tailwind CSS 4
Using the Vite plugin (no separate `tailwind.config.ts` needed with Tailwind 4).

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
plugins: [tailwindcss()]
```

Custom theme extensions and CSS variables are defined in `src/styles/global.css` using Tailwind's CSS layer system.

### Class Composition Utility (`cn`)
All components use the `cn` helper to merge classes safely:

```typescript
import { cn } from '@/utils'

<div className={cn('base-class', isActive && 'active-class', className)} />
```

`cn` combines `clsx` (conditional classes) with `tailwind-merge` (deduplication of conflicting Tailwind utilities).

### Component Variant System (CVA)
Variants for components like `Button` are defined with CVA:

```typescript
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-semibold transition-all',
  {
    variants: {
      variant: {
        primary:  'bg-primary text-white hover:bg-primary-950',
        tertiary: 'bg-tertiary-50 text-secondary border border-border',
        ghost:    'bg-transparent text-foreground hover:bg-muted'
      },
      size: {
        sm: 'h-8  px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base'
      }
    },
    defaultVariants: { variant: 'primary', size: 'md' }
  }
)

// Props type from CVA:
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}
```

### Animations
`framer-motion` is used for declarative enter/exit animations:

```typescript
import { motion, AnimatePresence } from 'framer-motion'

<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      {children}
    </motion.div>
  )}
</AnimatePresence>
```

---

## 18. Build & Configuration

### Vite Config (`vite.config.ts`)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath } from 'url'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),              // React + SWC (fast transpiler, replaces Babel)
    tailwindcss(),        // Tailwind CSS integration
    VitePWA({ ... })      // PWA manifest + service worker
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3001
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: { ... }    // Split vendor code into separate chunks
      }
    }
  },
  test: {
    globals: true,               // Vitest globals (describe, it, expect)
    environment: 'jsdom',        // Browser simulation
    setupFiles: './src/setupTests.ts'
  }
}))
```

### TypeScript Config (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Key settings:
- `strict: true` — enables all strict checks (null safety, etc.)
- `noUnusedLocals` + `noUnusedParameters` — enforced by ESLint too
- `moduleResolution: "bundler"` — modern resolution without `.js` extensions
- `paths: { "@/*" }` — the `@/` import alias

### Path Alias
Every internal import uses `@/` which resolves to `./src/`:
```typescript
// ✅ Always use alias
import { Button } from '@/components/ui'
import { useAuth } from '@/hooks'
import type { LoginResponse } from '@/types/login'

// ❌ Never use relative paths for cross-folder imports
import { Button } from '../../components/ui'
```

### Environment Variables
Variables are prefixed with `VITE_` to be accessible in client code:
```typescript
const API_URL  = import.meta.env.VITE_API_URL
const BASE_URL = import.meta.env.VITE_BASE_URL
```

Types for env vars are declared in `vite-env.d.ts`:
```typescript
interface ImportMetaEnv {
  readonly VITE_API_URL:  string
  readonly VITE_BASE_URL: string
}
```

---

## 19. Architecture Principles Summary

### Separation of Concerns
| Layer | Responsibility |
|-------|---------------|
| **Pages** | Route-level shell. Places feature components inside a layout. No logic. |
| **Feature components** | UI rendering only. Delegates all logic to hook. |
| **Feature hooks** | Business logic, API calls, form state, derived state. |
| **Service functions** | HTTP calls only. No business logic or state. |
| **Zustand stores** | Client-side state (auth, UI, wizard steps). No server data. |
| **TanStack Query** | Server state (fetching, caching, invalidation). |
| **Atoms/Molecules** | Reusable UI with no feature context. |
| **Utils** | Pure functions with no side effects. |

### Key Patterns
1. **Feature = folder**: One folder per feature with its own component, hook, schema, and types.
2. **Logic in hooks**: Components are dumb shells; hooks own everything else.
3. **Schemas next to components**: `use-feature.ts` + `feature-schema.ts` live beside `feature.tsx`.
4. **Barrel exports**: Every folder has `index.ts` to control its public API.
5. **Alias everywhere**: No relative cross-folder imports. Always use `@/`.
6. **Type inference**: Derive types from Zod schemas, not manual interfaces for form data.
7. **No comments**: Code is self-documenting through naming. Add a comment only when the "why" is non-obvious.
8. **Thin services**: API functions are one-liners calling `apiConfig.get/post/put/delete`.
9. **Persist carefully**: Do not debounce `persistClient` in TanStack Query — it causes stale data warnings.

### Data Flow
```
User action
  → Component (UI only)
    → Feature hook (business logic)
      → Service function (HTTP call via apiConfig)
        → TanStack Query cache (or Zustand for local state)
          → UI re-renders via subscription
```

### Offline Data Flow
```
App starts
  → Restore TanStack Query cache from IndexedDB
  → Restore Zustand auth state from localStorage
  → Feature component shows cached data
  → When online: queries refetch on mount
  → Large form data: read/write directly to IndexedDB via localforage
```
