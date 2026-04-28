import { GraphQLArgument, GraphQLObjectType, isObjectType } from 'graphql'

import { MetadataStorable } from '../interfaces/metadata'
import { MiddlewareClass } from '../interfaces/middleware'
import { resolveEntityFactory } from './resolveEntityFactory'
import { resolveReturnEntityFactory } from './resolveReturnEntityFactory'


export interface CreatMutationObjectParams {
  storage: MetadataStorable
  name: string
  middlewares: MiddlewareClass[]
  resolvers: Function[]
}

export function createMutationObject({
  storage,
  name,
  middlewares,
  resolvers,
}: CreatMutationObjectParams): GraphQLObjectType {

  const mutationObjectType = new GraphQLObjectType({
    name,
    fields: {},
  })

  for (const resolver of resolvers) {
    const metaResolver = storage.resolvers.get(resolver)
    if (!metaResolver) {
      continue
    }

    const resolverObjectType = resolveEntityFactory(metaResolver.typeFactory, { storage })

    for (const metaMutation of storage.mutations.get(resolver) ?? []) {
      const parentObjectType = typeof metaMutation.parent === 'function'
        ? resolveEntityFactory(metaMutation.parent, { storage })
        : mutationObjectType

      if (!isObjectType(parentObjectType)) {
        continue
      }

      const fields = parentObjectType.getFields()

      fields[metaMutation.name] = {
        name: metaMutation.name,
        type: resolveReturnEntityFactory(metaMutation.returns, resolverObjectType, { storage }),
        args: metaMutation.input
          ? Object.entries(metaMutation.input).map<GraphQLArgument>(([name, arg]) => {
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
        description: metaMutation.description,
        isDeprecated: typeof metaMutation.deprecated === 'string',
        deprecationReason: typeof metaMutation.deprecated === 'string' ? metaMutation.deprecated : undefined,
        extensions: null,
        astNode: null,
      }
      storage.saveGraphQLFieldResolve(parentObjectType, {
        name: metaMutation.name,
        middlewares: parentObjectType === mutationObjectType
          ? middlewares.concat(metaResolver.middlewares, metaMutation.middlewares)
          : metaResolver.middlewares.concat(metaMutation.middlewares),
        resolver: metaMutation.target,
        resolve: metaMutation.target.prototype[metaMutation.property],
      })
    }
  }
  return mutationObjectType
}
