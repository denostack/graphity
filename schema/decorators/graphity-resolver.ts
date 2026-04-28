import { ParentTypeFactory, MetadataStorable } from '../interfaces/metadata'
import { MiddlewareClass } from '../interfaces/middleware'
import { MetadataStorage } from '../metadata/MetadataStorage'


export interface GraphityResolverParams {
  middlewares?: MiddlewareClass | MiddlewareClass[]
  storage?: MetadataStorable
}

export function GraphityResolver(typeFactory: ParentTypeFactory, params: GraphityResolverParams = {}): ClassDecorator {
  const storage = params.storage ?? MetadataStorage.getGlobalStorage()
  const metaResolvers = storage.resolvers

  return (target) => {
    const middleware = params.middlewares ?? []
    const middlewares = Array.isArray(middleware) ? middleware : [middleware]

    metaResolvers.set(target, {
      target,
      typeFactory,
      middlewares,
    })
  }
}
