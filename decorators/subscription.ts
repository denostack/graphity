import { type GraphQLFieldResolver, type GraphQLOutputType, isOutputType } from "graphql";

import { SUBSCRIPTIONS_SYMBOL } from "../metadata/constants.ts";
import type { EntityTypeFactory, ParentTypeFactory, SubscriptionResolveMetadata } from "../metadata/types.ts";
import type { MiddlewareClass } from "../middleware.ts";

export interface SubscriptionOptions {
  name?: string;
  parent?: ParentTypeFactory;
  middlewares?: MiddlewareClass | MiddlewareClass[];
  description?: string;
  deprecated?: string;
  nullable?: boolean;
  subscribe: GraphQLFieldResolver<any, any>;
}

export function subscription(
  type: EntityTypeFactory | GraphQLOutputType,
  options: SubscriptionOptions,
) {
  return (_target: unknown, ctx: ClassMethodDecoratorContext) => {
    const subscriptions =
      (ctx.metadata[SUBSCRIPTIONS_SYMBOL] = ctx.metadata[SUBSCRIPTIONS_SYMBOL] ?? []) as SubscriptionResolveMetadata[];

    const middleware = options.middlewares ?? [];
    const middlewares = Array.isArray(middleware) ? middleware : [middleware];

    subscriptions.push({
      property: ctx.name,
      typeFactory: isOutputType(type) ? () => type : (type as EntityTypeFactory),
      parent: options.parent ?? null,
      name: options.name ?? String(ctx.name),
      middlewares,
      nullable: options.nullable ?? false,
      description: options.description ?? null,
      deprecationReason: options.deprecated ?? null,
      subscribe: options.subscribe,
    });
  };
}
