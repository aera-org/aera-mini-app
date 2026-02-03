# Types

This directory contains all TypeScript types for the project.

## Structure

### `shared.ts`

General types used throughout the application:

- `ApiResponse<T>` - type for API responses
- `ApiError` - type for API errors
- `LoadingState` - loading state
- `ModalData` - data for modal windows
- `ProcessingState` - processing state
- Utility types (`Optional`, `RequiredFields`, `DeepPartial`, etc.)
- Event types (`ClickEvent`, `ChangeEvent`, etc.)
- Component props types (`BaseComponentProps`, `ButtonProps`, `ModalProps`)

### `user.ts`

User-related types:

- `User` - main user model
- `UserData` - user data
- `UserContextType` - type for user context

### `task.ts`

Types for tasks:

- `Task` - task model
- `TaskCategory` - task category

### `ton.ts`

Types for TON blockchain:

- `TonProof` - proof for TON Connect

## Usage

```typescript
// Import a specific type
import { ApiResponse, User } from '../types';

// Import all types
import * as Types from '../types';
```

## Rules

1. **Type names** - PascalCase
2. **File names** - camelCase.ts
3. **Export** - use named exports
4. **Documentation** - add JSDoc comments for complex types
5. **Generic types** - use for reusable structures

## Examples

### Creating a new type

```typescript
/**
 * Type for component settings
 */
export type ComponentConfig = {
  /** Unique identifier */
  id: string;
  /** Component name */
  name: string;
  /** Is the component active */
  isActive: boolean;
  /** Additional settings */
  settings?: Record<string, unknown>;
};
```

### Generic type

```typescript
/**
 * Type for API response with data
 */
export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  timestamp: number;
};
```

### Union type

```typescript
/**
 * Possible task statuses
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
```
