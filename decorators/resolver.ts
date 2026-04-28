import { RESOLVER_SYMBOL } from "../metadata/constants.ts";
import type { ResolverMetadata, ResolverTypeFactory } from "../metadata/types.ts";
import type { MiddlewareClass } from "../middleware.ts";

export interface ResolverOptions {
  middlewares?: MiddlewareClass | MiddlewareClass[];
}

export function resolver(
  typeFactory?: ResolverTypeFactory,
  options: ResolverOptions = {},
) {
  return (_target: unknown, ctx: ClassDecoratorContext) => {
    const middleware = options.middlewares ?? [];
    const middlewares = Array.isArray(middleware) ? middleware : [middleware];
    ctx.metadata[RESOLVER_SYMBOL] = {
      typeFactory: typeFactory ?? null,
      middlewares,
    } satisfies ResolverMetadata;
  };
}
