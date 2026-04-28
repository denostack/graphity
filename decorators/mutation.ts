import { type GraphQLOutputType, isOutputType } from "graphql";

import { MUTATIONS_SYMBOL } from "../metadata/constants.ts";
import type { EntityTypeFactory, ParentTypeFactory, ResolveMetadata } from "../metadata/types.ts";
import type { MiddlewareClass } from "../middleware.ts";

export interface MutationOptions {
  name?: string;
  parent?: ParentTypeFactory;
  middlewares?: MiddlewareClass | MiddlewareClass[];
  description?: string;
  deprecated?: string;
  nullable?: boolean;
}

export function mutation(
  type: EntityTypeFactory | GraphQLOutputType,
  options: MutationOptions = {},
) {
  return (_target: unknown, ctx: ClassMethodDecoratorContext) => {
    const mutations = (ctx.metadata[MUTATIONS_SYMBOL] = ctx.metadata[MUTATIONS_SYMBOL] ?? []) as ResolveMetadata[];

    const middleware = options.middlewares ?? [];
    const middlewares = Array.isArray(middleware) ? middleware : [middleware];

    mutations.push({
      property: ctx.name,
      typeFactory: isOutputType(type) ? () => type : (type as EntityTypeFactory),
      parent: options.parent ?? null,
      name: options.name ?? String(ctx.name),
      middlewares,
      nullable: options.nullable ?? false,
      description: options.description ?? null,
      deprecationReason: options.deprecated ?? null,
    });
  };
}
