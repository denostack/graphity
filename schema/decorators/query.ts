import { isInputObjectType, GraphQLFieldConfigArgumentMap, GraphQLOutputType } from 'graphql'

import { ParentTypeFactory, MetadataStorable, GraphQLEntityType } from '../interfaces/metadata'
import { MiddlewareClass } from '../interfaces/middleware'
import { MetadataStorage } from '../metadata/MetadataStorage'


const DEFAULT_RETURNS = (node: GraphQLOutputType) => node

export interface QueryParams {
  name?: string
  parent?: ParentTypeFactory
  input?: GraphQLFieldConfigArgumentMap
  middlewares?: MiddlewareClass | MiddlewareClass[]
  returns?: (type: GraphQLEntityType) => GraphQLOutputType | Function
  description?: string
  deprecated?: string
  storage?: MetadataStorable
}

export function Query(params: QueryParams = {}): MethodDecorator {
  const storage = params.storage ?? MetadataStorage.getGlobalStorage()
  const metaQueries = storage.queries
  return (target, property) => {
    let resolves = metaQueries.get(target.constructor)
    if (!resolves) {
      resolves = []
      metaQueries.set(target.constructor, resolves)
    }

    const middleware = params.middlewares ?? []
    const middlewares = Array.isArray(middleware) ? middleware : [middleware]

    const input = params.input
    resolves.push({
      target: target.constructor,
      property,
      parent: params.parent ?? null,
      name: params.name ?? (typeof property === 'string' ? property : property.toString()),
      input: (isInputObjectType(input) ? input.getFields() : input) ?? null,
      middlewares,
      returns: params.returns ?? DEFAULT_RETURNS,
      description: params.description ?? null,
      deprecated: params.deprecated ?? null,
    })
  }
}
