import { GraphQLArgument, GraphQLObjectType, isObjectType } from 'graphql'

import { MetadataStorable } from '../interfaces/metadata'
import { MiddlewareClass } from '../interfaces/middleware'
import { resolveEntityFactory } from './resolveEntityFactory'
import { resolveReturnEntityFactory } from './resolveReturnEntityFactory'


export interface CreateQueryObjectParams {
  storage: MetadataStorable
  name: string
  middlewares: MiddlewareClass[]
  resolvers: Function[]
}

export function createQueryObject({
  storage,
  name,
  middlewares,
  resolvers,
}: CreateQueryObjectParams): GraphQLObjectType {

  const queryObjectType = new GraphQLObjectType({
    name,
    fields: {},
  })

  for (const resolver of resolvers) {
    const metaResolver = storage.resolvers.get(resolver)
    if (!metaResolver) {
      continue
    }

    const resolverObjectType = resolveEntityFactory(metaResolver.typeFactory, { storage })

    for (const metaQuery of storage.queries.get(resolver) ?? []) {
      const parentObjectType = typeof metaQuery.parent === 'function'
        ? resolveEntityFactory(metaQuery.parent, { storage })
        : queryObjectType

      if (!isObjectType(parentObjectType)) {
        continue
      }

      const fields = parentObjectType.getFields()

      fields[metaQuery.name] = {
        name: metaQuery.name,
        type: resolveReturnEntityFactory(metaQuery.returns, resolverObjectType, { storage }),
        args: metaQuery.input
          ? Object.entries(metaQuery.input).map<GraphQLArgument>(([name, arg]) => {
            return {
              name,
              type: arg.type,
              defaultValue: arg.defaultValue,
              description: arg.description,
              deprecationReason: arg.deprecationReason,
              extensions: null,
              astNode: null,
            }
          })
          : [],
        description: metaQuery.description,
        isDeprecated: typeof metaQuery.deprecated === 'string',
        deprecationReason: typeof metaQuery.deprecated === 'string' ? metaQuery.deprecated : undefined,
        extensions: null,
        astNode: null,
      }
      storage.saveGraphQLFieldResolve(parentObjectType, {
        name: metaQuery.name,
        middlewares: parentObjectType === queryObjectType
          ? middlewares.concat(metaResolver.middlewares, metaQuery.middlewares)
          : metaResolver.middlewares.concat(metaQuery.middlewares),
        resolver: metaQuery.target,
        resolve: metaQuery.target.prototype[metaQuery.property],
      })

    }
  }
  return queryObjectType
}
