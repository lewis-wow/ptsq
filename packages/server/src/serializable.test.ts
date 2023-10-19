import { expect, test } from 'vitest';
import { serializableZodSchema } from './serializable';

test('Should parse with valid serializable value', () => {
  const parseResult = serializableZodSchema.safeParse({
    inner: {
      a: 1,
    },
    b: 'string test',
    c: ['this', 1, 'is', {}, 'array'],
    bool: true,
    recursive: {
      recursive: {
        recursive: {
          recursive: {
            recursive: {},
          },
        },
      },
    },
  });

  expect(parseResult.success).toBe(true);
});

test('Should parse with valid serializable value with undefined', () => {
  const parseResult = serializableZodSchema.safeParse({
    inner: {
      a: 1,
    },
    b: 'string test',
    c: ['this', 1, 'is', {}, 'array'],
    bool: true,
    recursive: {
      recursive: {
        recursive: {
          recursive: {
            recursive: {},
          },
        },
      },
    },
    undef: undefined,
  });

  expect(parseResult.success).toBe(true);
});

test('Should not parse with invalid serializable value with Date object', () => {
  const parseResult = serializableZodSchema.safeParse({
    inner: {
      a: 1,
    },
    b: 'string test',
    c: ['this', 1, 'is', {}, 'array'],
    bool: true,
    recursive: {
      recursive: {
        recursive: {
          recursive: {
            recursive: {},
          },
        },
      },
    },
    date: new Date(),
  });

  expect(parseResult.success).toBe(false);
});

test('Should not parse with invalid serializable value with Set object', () => {
  const parseResult = serializableZodSchema.safeParse({
    inner: {
      a: 1,
    },
    b: 'string test',
    c: ['this', 1, 'is', {}, 'array'],
    bool: true,
    recursive: {
      recursive: {
        recursive: {
          recursive: {
            recursive: {},
          },
        },
      },
    },
    set: new Set([1, 2]),
  });

  expect(parseResult.success).toBe(false);
});
