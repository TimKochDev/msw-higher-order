# msw-higher-order

Higher-order functions for MSW request handlers.

## Installation

```bash
npm install msw-higher-order
```

## Usage

### withPreResolver

The `withPreResolver` function allows you to add pre-processing logic to your MSW request handlers:

```typescript
import { withPreResolver } from 'msw-higher-order';
import { http } from 'msw';

const handler = http.get('/api/resource', 
  withPreResolver(
    async ({ request }) => {
      // Pre-processing logic
      if (someCondition) {
        return new Response('Error', { status: 400 });
      }
      return undefined; // Continue to main handler
    },
    async ({ request }) => {
      // Main handler logic
      return new Response('Success');
    }
  )
);
```

## Motivation

MSW is a powerful tool for mocking HTTP requests in tests. However, it lacks support for higher-order functions, which can be useful for adding pre-processing logic to request handlers. This library aims to fill that gap by providing a set of higher-order functions that can be used to enhance MSW request handlers.

Think:
- withAuth
- withValidation
- withWhatever