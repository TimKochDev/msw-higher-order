# msw-higher-order

Higher-order functions for MSW request handlers.

> [!CAUTION]
> I started this project after opening [this discussion](https://github.com/mswjs/msw/discussions/2392) on the MSW repository.
> However, since I learned that you can _throw_ mocked responses in MSW resolvers, higher-order functions look less useful in comparison.
> This is why I am archiving this project for now.

## Installation

```bash
npm install msw-higher-order
```

## Usage

### buildResolverWrapper

The `buildResolverWrapper` function allows you to add pre-processing logic to your MSW request handlers:

```typescript
import { buildResolverWrapper } from 'msw-higher-order';
import { http } from 'msw';

const handler = http.get('/api/resource', 
  buildResolverWrapper(
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

### Zod Validation Example

You can use `buildResolverWrapper` with Zod for request validation:

```typescript
import { buildResolverWrapper } from 'msw-higher-order';
import { http } from 'msw';
import { z } from 'zod';

const schema = z.object({
  id: z.string().uuid(),
});

const handler = http.post('/api/resource', 
  buildResolverWrapper(
    async ({ request }) => {
      const body = await request.json();
      const result = schema.safeParse(body);
      if (!result.success) {
        return new Response('Invalid data', { status: 400 });
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