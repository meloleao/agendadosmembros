# AI Development Rules for Agenda de Membros TCE-PI

This document provides guidelines for the AI assistant to follow when modifying this application. The goal is to maintain code quality, consistency, and simplicity.

## Tech Stack Overview

The application is built with a modern, lightweight tech stack:

*   **Framework:** React 19 with TypeScript for type safety.
*   **Build Tool:** Vite for fast development and optimized builds.
*   **Styling:** Tailwind CSS is used exclusively for styling. It's configured directly in `index.html` via the CDN.
*   **AI Integration:** Google Gemini API is used for natural language processing features, accessed via the `@google/genai` package.
*   **State Management:** State is managed locally within components using React's built-in hooks (`useState`, `useEffect`, `useMemo`).
*   **Data Persistence:** All application data (users, events, current session) is persisted in the browser's Local Storage.
*   **Code Structure:** The codebase is organized into `components`, `services`, and root-level files for types (`types.ts`) and constants (`constants.ts`).
*   **Icons:** Icons are implemented as inline SVGs within components.

## Development and Library Rules

### 1. Styling
*   **Use Tailwind CSS exclusively.** All new components, layouts, and style modifications must be done using Tailwind utility classes.
*   **Do NOT use inline `style` attributes** unless absolutely necessary for dynamic properties that cannot be handled by Tailwind.
*   **Do NOT add new CSS files** or CSS-in-JS libraries. Stick to the existing Tailwind setup.
*   **Responsiveness is mandatory.** Ensure all new UI elements are responsive and work well on both mobile and desktop screens.

### 2. Components
*   **Create small, single-purpose components.** Place all new components in the `src/components/` directory.
*   **Do NOT introduce new UI component libraries** (e.g., Material-UI, Ant Design, shadcn/ui). Build components from scratch using JSX and Tailwind CSS to maintain a consistent look and feel.
*   **Props should be strongly typed** using TypeScript interfaces.

### 3. State Management
*   **Use React Hooks for state.** For local component state, use `useState` and `useReducer`. For shared state, consider lifting state up or using `useContext` for simple cases.
*   **Do NOT add complex state management libraries** like Redux or Zustand unless the application's complexity grows to a point where it's explicitly requested and justified.

### 4. AI Features
*   **Centralize AI logic.** All interactions with the Google Gemini API must be handled through the existing `src/services/geminiService.ts`.
*   **Do NOT embed API keys directly in the code.** The API key is managed through environment variables via Vite's `process.env.API_KEY`.

### 5. Data Handling
*   **Continue using Local Storage** for data persistence. All functions for reading from or writing to Local Storage are currently in `App.tsx`. Keep this logic centralized.
*   **Type safety is crucial.** Ensure all data structures conform to the interfaces defined in `types.ts`.

### 6. Code Quality and Structure
*   **Follow the existing file structure.** Place files in their appropriate directories (`components`, `services`, etc.).
*   **Define all shared types** in the central `types.ts` file.
*   **Define all application-wide constants** (e.g., colors, static lists) in `constants.ts`.
*   **Keep code clean and readable.** Add comments only when the code's purpose is not immediately obvious.