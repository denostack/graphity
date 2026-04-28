import { GraphQLArgument, GraphQLObjectType, isObjectType } from 'graphql'

import { MetadataStorable } from '../interfaces/metadata'
import { MiddlewareClass } from '../interfaces/middleware'
import { resolveEntityFactory } from './resolveEntityFactory'
import { resolveReturnEntityFactory } from './resolveReturnEntityFactory'


export interface CreateSubscriptionObjectParams {
  storage: MetadataStorable
  name: string
  middlewares: MiddlewareClass[]
  resolvers: Function[]
}

export function createSubscriptionObject({
  storage,
  name,
  middlewares,
  resolvers,
}: CreateSubscriptionObjectParams): GraphQLObjectType {

  const subscriptionObjectType = new GraphQLObjectType({
    name,
    fields: {},
  })

  for (const resolver of resolvers) {
    const metaResolver = storage.resolvers.get(resolver)
    if (!metaResolver) {
      continue
    }

    const resolverObjectType = resolveEntityFactory(metaResolver.typeFactory, { storage })

    for (const metaSubscription of storage.subscriptions.get(resolver) ?? []) {
      const parentObjectType = typeof metaSubscription.parent === 'function'
        ? resolveEntityFactory(metaSubscription.parent, { storage })
        : subscriptionObjectType

      if (!isObjectType(parentObjectType)) {
        continue
      }

      const fields = parentObjectType.getFields()

      fields[metaSubscription.name] = {
        name: metaSubscription.name,
        type: resolveReturnEntityFactory(metaSubscription.returns, resolverObjectType, { storage }),
        args: metaSubscription.input
          ? Object.entries(metaSubscription.input).map<GraphQLArgument>(([name, arg]) => {
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
        description: metaSubscription.description,
        isDeprecated: typeof metaSubscription.deprecated === 'string',
        deprecationReason: typeof metaSubscription.deprecated === 'string' ? metaSubscription.deprecated : undefined,
        extensions: null,
        astNode: null,
      }
      storage.saveGraphQLFieldResolve(parentObjectType, {
        name: metaSubscription.name,
        middlewares: parentObjectType === subscriptionObjectType
          ? middlewares.concat(metaResolver.middlewares, metaSubscription.middlewares)
          : metaResolver.middlewares.concat(metaSubscription.middlewares),
        resolver: metaSubscription.target,
        subscribe: metaSubscription.subscribe,
        resolve: metaSubscription.target.prototype[metaSubscription.property],
      })
    }
  }
  return subscriptionObjectType
}
