import { GraphQLFieldResolver, GraphQLOutputType, isOutputType } from "graphql";

import { FIELDS_SYMBOL } from "../metadata/constants.ts";
import type { FieldMetadata, FieldTypeFactory } from "../metadata/types.ts";
import type { MiddlewareClass } from "../middleware.ts";

export interface FieldOptions {
  name?: string;
  resolve?: GraphQLFieldResolver<any, any>;
  middlewares?: MiddlewareClass | MiddlewareClass[];
  description?: string;
  deprecated?: string;
  nullable?: boolean;
}

export function field(
  type: FieldTypeFactory | GraphQLOutputType,
  options: FieldOptions = {},
) {
  return (
    _target: unknown,
    ctx: ClassFieldDecoratorContext | ClassGetterDecoratorContext | ClassMethodDecoratorContext,
  ) => {
    const fields = (ctx.metadata[FIELDS_SYMBOL] as FieldMetadata[] | undefined) ??
      (ctx.metadata[FIELDS_SYMBOL] = [] as FieldMetadata[]);

    const middleware = options.middlewares ?? [];
    const middlewares = Array.isArray(middleware) ? middleware : [middleware];

    fields.push({
      property: ctx.name,
      typeFactory: isOutputType(type) ? () => type : (type as FieldTypeFactory),
      resolve: options.resolve ?? null,
      middlewares,
      name: options.name ?? String(ctx.name),
      nullable: options.nullable ?? false,
      description: options.description ?? null,
      deprecationReason: options.deprecated ?? null,
    });
  };
}
