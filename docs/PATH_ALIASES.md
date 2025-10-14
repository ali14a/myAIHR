# Path Aliases Documentation

This project uses path aliases to make imports cleaner and more maintainable. Instead of using relative paths like `../../../core/contexts/AuthContext`, you can use absolute paths with aliases.

## Available Aliases

### Module Aliases
- `@core/*` → `./src/modules/core/*`
- `@auth/*` → `./src/modules/auth/*`
- `@dashboard/*` → `./src/modules/dashboard/*`
- `@resume/*` → `./src/modules/resume/*`
- `@jobs/*` → `./src/modules/jobs/*`
- `@cover-letter/*` → `./src/modules/cover-letter/*`
- `@profile/*` → `./src/modules/profile/*`
- `@modules/*` → `./src/modules/*`

### General Aliases
- `@/*` → `./src/*`

## Usage Examples

### Before (Relative Paths)
```typescript
// ❌ Hard to maintain relative paths
import { useAuth } from '../../../core/contexts/AuthContext';
import { resumeService } from '../../resume/services/resumeService';
import { Button } from '../../../core/components/ui/Button';
import type { User } from '../../../core/types/index';
```

### After (Path Aliases)
```typescript
// ✅ Clean, absolute paths
import { useAuth } from '@core/contexts/AuthContext';
import { resumeService } from '@resume/services/resumeService';
import { Button } from '@core/components/ui/Button';
import type { User } from '@core/types/index';
```

## Common Import Patterns

### Core Module Imports
```typescript
// Contexts
import { useAuth } from '@core/contexts/AuthContext';
import { useNotification } from '@core/contexts/NotificationContext';

// Components
import { Layout } from '@core/components/Layout';
import { ProtectedRoute } from '@core/components/ProtectedRoute';
import { Button, Input, Checkbox } from '@core/components/ui';

// Utilities
import { formatDate } from '@core/utils/dateUtils';
import { debug } from '@core/utils/debug';

// Types
import type { User, AuthContextType } from '@core/types/index';
```

### Module-Specific Imports
```typescript
// Auth module
import { Login, Register } from '@auth/components';
import { authService } from '@auth/services/authService';

// Resume module
import { ResumeUpload, ResumeAnalysis } from '@resume/components';
import { resumeService } from '@resume/services/resumeService';

// Jobs module
import { JobMatching } from '@jobs/components';
import { jobService } from '@jobs/services/jobService';
```

### Cross-Module Imports
```typescript
// When you need to import from another module
import { resumeService } from '@resume/services/resumeService';
import { jobService } from '@jobs/services/jobService';
import { useAuth } from '@core/contexts/AuthContext';
```

## Benefits

1. **Cleaner Imports**: No more `../../../` paths
2. **Better Refactoring**: Moving files doesn't break imports
3. **IDE Support**: Better autocomplete and navigation
4. **Consistency**: Standardized import patterns across the project
5. **Maintainability**: Easier to understand and modify

## Configuration Files

The aliases are configured in:
- `vite.config.js` - For Vite bundler
- `tsconfig.json` - For TypeScript compiler

Both files must be kept in sync when adding new aliases.

## Best Practices

1. **Use aliases for all imports** - Avoid mixing relative and absolute paths
2. **Import from module index files** when possible - `@auth` instead of `@auth/components/Login`
3. **Group imports logically** - Core imports first, then module-specific imports
4. **Use type imports** - `import type { User } from '@core/types'`

## Migration Guide

When updating existing imports:

1. Replace `../../../core/` with `@core/`
2. Replace `../../auth/` with `@auth/`
3. Replace `../services/` with `@[module]/services/`
4. Replace `../components/` with `@[module]/components/`
5. Replace `../utils/` with `@core/utils/`
6. Replace `../types/` with `@core/types/`

## IDE Configuration

For better IDE support, make sure your editor recognizes the path mapping. Most modern editors (VS Code, WebStorm) will automatically pick up the TypeScript configuration.
