// deno-lint-ignore-file ban-types no-explicit-any

import {
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  GraphQLFieldResolver,
  GraphQLNamedType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLSchema,
  isOutputType,
} from "graphql";

import { MUTATIONS_SYMBOL, QUERIES_SYMBOL, SUBSCRIPTIONS_SYMBOL } from "../metadata/constants.ts";
import type { ResolveMetadata, SubscriptionResolveMetadata } from "../metadata/types.ts";
import type { MiddlewareClass } from "../middleware.ts";
import { toGraphQLObjectType } from "./to_graphql_object_type.ts";

export interface CreateGraphQLSchemaParams {
  resolvers: Function[];
  entities?: Function[];
  types?: GraphQLNamedType[];
  rootMiddlewares?: MiddlewareClass[];
  queryMiddlewares?: MiddlewareClass[];
  mutationMiddlewares?: MiddlewareClass[];
  subscriptionMiddlewares?: MiddlewareClass[];
}

function resolveOutputType(value: unknown): GraphQLOutputType {
  if (isOutputType(value as GraphQLOutputType)) {
    return value as GraphQLOutputType;
  }
  if (typeof value === "function") {
    return toGraphQLObjectType(value as Function);
  }
  throw new Error(`cannot resolve GraphQL output type from ${String(value)}`);
}

function buildField(meta: ResolveMetadata, resolver: Function): GraphQLFieldConfig<any, any> {
  const inner = resolveOutputType(meta.typeFactory());
  return {
    type: meta.nullable ? inner : new GraphQLNonNull(inner),
    description: meta.description ?? undefined,
    deprecationReason: meta.deprecationReason ?? undefined,
    resolve: (resolver.prototype as Record<PropertyKey, unknown>)[meta.property] as
      | GraphQLFieldResolver<any, any, any>
      | undefined,
  };
}

export function createGraphQLSchema(params: CreateGraphQLSchemaParams): GraphQLSchema {
  const queryFields: GraphQLFieldConfigMap<any, any> = {};
  const mutationFields: GraphQLFieldConfigMap<any, any> = {};
  const subscriptionFields: GraphQLFieldConfigMap<any, any> = {};

  for (const resolver of params.resolvers) {
    const metadataObject = resolver[Symbol.metadata];
    if (!metadataObject) {
      continue;
    }

    const queries = (metadataObject[QUERIES_SYMBOL] ?? []) as ResolveMetadata[];
    for (const q of queries) {
      queryFields[q.name] = buildField(q, resolver);
    }

    const mutations = (metadataObject[MUTATIONS_SYMBOL] as ResolveMetadata[] | undefined) ?? [];
    for (const m of mutations) {
      mutationFields[m.name] = buildField(m, resolver);
    }

    const subscriptions = (metadataObject[SUBSCRIPTIONS_SYMBOL] as SubscriptionResolveMetadata[] | undefined) ?? [];
    for (const s of subscriptions) {
      subscriptionFields[s.name] = {
        ...buildField(s, resolver),
        subscribe: s.subscribe,
      };
    }
  }

  const types = (params.types ?? []).concat(
    (params.entities ?? []).map((entity) => toGraphQLObjectType(entity)),
  );

  return new GraphQLSchema({
    ...(Object.keys(queryFields).length > 0
      ? { query: new GraphQLObjectType({ name: "Query", fields: queryFields }) }
      : {}),
    ...(Object.keys(mutationFields).length > 0
      ? { mutation: new GraphQLObjectType({ name: "Mutation", fields: mutationFields }) }
      : {}),
    ...(Object.keys(subscriptionFields).length > 0
      ? { subscription: new GraphQLObjectType({ name: "Subscription", fields: subscriptionFields }) }
      : {}),
    ...(types.length > 0 ? { types } : {}),
  });
}
