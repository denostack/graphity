// deno-lint-ignore-file no-explicit-any
import { expect } from "@std/expect";
import {
  GraphQLSchema,
  isType,
  isWrappingType,
  lexicographicSortSchema,
  parse,
  print,
  printSchema,
  printType,
} from "graphql";

declare module "@std/expect" {
  interface Expected<IsAsync = false> {
    toEqualGraphQLSchema(expected: string): IsAsync extends true ? Promise<void> : void;
    toEqualGraphQLType(expected: string): IsAsync extends true ? Promise<void> : void;
    toEqualError(
      ErrorCtor: new (...args: any[]) => Error,
      expected: Record<string, unknown>,
    ): IsAsync extends true ? Promise<void> : void;
  }
}

function normalizeSDL(sdl: string): string {
  const trimmed = sdl.trim();
  if (!trimmed) return "";
  try {
    return print(parse(trimmed)).trim();
  } catch {
    return trimmed.replace(/\s+/g, " ");
  }
}

function schemaToSDL(schema: GraphQLSchema): string {
  try {
    return printSchema(lexicographicSortSchema(schema)).trim();
  } catch {
    try {
      return printSchema(schema).trim();
    } catch {
      return "";
    }
  }
}

function typeToSDL(value: unknown): string {
  if (value == null) return String(value);
  if (isWrappingType(value as never)) {
    return (value as { toString(): string }).toString();
  }
  if (isType(value as never)) {
    try {
      return printType(value as Parameters<typeof printType>[0]).trim();
    } catch {
      return (value as { toString(): string }).toString();
    }
  }
  return String(value);
}

expect.extend({
  toEqualGraphQLSchema(context: any, expected: string) {
    const received = context.value;
    const actual = normalizeSDL(schemaToSDL(received as GraphQLSchema));
    const target = normalizeSDL(expected);
    return {
      pass: actual === target,
      message: () =>
        `GraphQLSchema mismatch.\n--- expected ---\n${target}\n--- received ---\n${actual}\n----------------`,
    };
  },

  toEqualGraphQLType(context: any, expected: string) {
    const received = context.value;
    const actual = normalizeSDL(typeToSDL(received));
    const target = normalizeSDL(expected);
    return {
      pass: actual === target,
      message: () =>
        `GraphQL type mismatch.\n--- expected ---\n${target}\n--- received ---\n${actual}\n----------------`,
    };
  },

  toEqualError(
    context: any,
    ErrorCtor: new (...args: any[]) => Error,
    expected: Record<string, unknown>,
  ) {
    const received = context.value;
    if (!(received instanceof ErrorCtor)) {
      return {
        pass: false,
        message: () =>
          `expected error to be instance of ${ErrorCtor?.name ?? "Error"} but got ${
            (received as { constructor?: { name?: string } })?.constructor?.name ?? typeof received
          }`,
      };
    }
    const actualProps: Record<string, unknown> = {};
    for (const key of Object.keys(expected)) {
      actualProps[key] = (received as unknown as Record<string, unknown>)[key];
    }
    const pass = Object.keys(expected).every((key) => actualProps[key] === expected[key]);
    return {
      pass,
      message: () =>
        `Error property mismatch.\n--- expected ---\n${JSON.stringify(expected)}\n--- received ---\n${
          JSON.stringify(actualProps)
        }\n----------------`,
    };
  },
});
