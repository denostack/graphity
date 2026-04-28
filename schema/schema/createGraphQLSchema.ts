import { GraphQLNamedType, GraphQLSchema, SchemaMetaFieldDef } from 'graphql'

import { MetadataStorable } from '../interfaces/metadata'
import { MiddlewareClass } from '../interfaces/middleware'
import { MetadataStorage } from '../metadata/MetadataStorage'
import { createMutationObject } from './createMutationObject'
import { createQueryObject } from './createQueryObject'
import { createSubscriptionObject } from './createSubscriptionObject'
import { toGraphQLObject } from './toGraphQLObject'


export interface CreateGraphQLSchemaParams {
  resolvers: Function[]
  entities?: Function[]
  types?: GraphQLNamedType[]
  storage?: MetadataStorable
  rootMiddlewares?: MiddlewareClass[]
  queryMiddlewares?: MiddlewareClass[]
  mutationMiddlewares?: MiddlewareClass[]
  subscriptionMiddlewares?: MiddlewareClass[]
}

export function createGraphQLSchema(params: CreateGraphQLSchemaParams): GraphQLSchema {
  const storage = params.storage ?? MetadataStorage.getGlobalStorage()

  const rootMiddlewares = params.rootMiddlewares ?? []

  const query = createQueryObject({
    storage,
    name: 'Query',
    middlewares: rootMiddlewares.concat(params.queryMiddlewares ?? []),
    resolvers: params.resolvers,
  })
  const mutation = createMutationObject({
    storage,
    name: 'Mutation',
    middlewares: rootMiddlewares.concat(params.mutationMiddlewares ?? []),
    resolvers: params.resolvers,
  })
  const subscription = createSubscriptionObject({
    storage,
    name: 'Subscription',
    middlewares: rootMiddlewares.concat(params.subscriptionMiddlewares ?? []),
    resolvers: params.resolvers,
  })

  const types = (params.types ?? []).concat((params.entities ?? []).map(entity => toGraphQLObject(entity)))

  return new GraphQLSchema({
    ...Object.keys(query.getFields()).length > 0 ? { query } : {},
    ...Object.keys(mutation.getFields()).length > 0 ? { mutation } : {},
    ...Object.keys(subscription.getFields()).length > 0 ? { subscription } : {},
    ...types.length > 0 ? { types } : {},
  })
}
