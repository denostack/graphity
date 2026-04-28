import { GraphQLFieldConfigMap, GraphQLNonNull, GraphQLObjectType, GraphQLOutputType, isOutputType } from "graphql";

import { ENTITY_SYMBOL, FIELDS_SYMBOL } from "../metadata/constants.ts";
import type { FieldMetadata, ObjectTypeMetadata } from "../metadata/types.ts";

const cache = new WeakMap<Function, GraphQLObjectType>();

function readMetadata(target: Function): DecoratorMetadata | null {
  return (target as { [Symbol.metadata]?: DecoratorMetadata })[Symbol.metadata] ?? null;
}

export function toGraphQLObjectType(target: Function): GraphQLObjectType {
  const cached = cache.get(target);
  if (cached) return cached;

  const metadata = readMetadata(target);
  const objectMeta = metadata?.[ENTITY_SYMBOL] as ObjectTypeMetadata | undefined;
  if (!objectMeta) {
    throw new Error(`Class "${target.name}" is not a GraphQL object type. Did you forget the @objectType() decorator?`);
  }
  const fields = (metadata?.[FIELDS_SYMBOL] as FieldMetadata[] | undefined) ?? [];

  const gqlObject: GraphQLObjectType = new GraphQLObjectType({
    name: objectMeta.name,
    description: objectMeta.description,
    fields: () => {
      const result: GraphQLFieldConfigMap<any, any> = {};
      for (const f of fields) {
        const resolved = f.typeFactory(null);
        const inner: GraphQLOutputType = isOutputType(resolved) ? resolved : toGraphQLObjectType(resolved as Function);
        result[f.name] = {
          type: f.nullable ? inner : new GraphQLNonNull(inner),
          description: f.description ?? undefined,
          deprecationReason: f.deprecationReason ?? undefined,
          resolve: f.resolve ?? undefined,
        };
      }
      return result;
    },
  });

  cache.set(target, gqlObject);
  return gqlObject;
}
