import { Provider, Containable, Container, ConstructType } from '@graphity/container'
import { createGraphQLSchema, MiddlewareClass, MetadataStorable as SchemaMetadataStorable, MetadataStorage as SchemaMetadataStorage } from '@graphity/schema'
import { GraphQLNamedType, GraphQLSchema } from 'graphql'

import { createFieldResolver } from '../graphql/createFieldResolver'
import { findResolvers } from '../utils/findResolvers'


export interface GraphityOptions {
  container?: Containable
  schema?: {
    storage?: SchemaMetadataStorable,
  }

  rootMiddlewares?: MiddlewareClass[]
  queryMiddlewares?: MiddlewareClass[]
  mutationMiddlewares?: MiddlewareClass[]
  subscriptionMiddlewares?: MiddlewareClass[]

  resolvers?: (Function | string)[]
  entities?: Function[]
  types?: GraphQLNamedType[]
}

export class Graphity {

  container: Containable
  schemaStorage: SchemaMetadataStorable

  rootMiddlewares: MiddlewareClass[]
  queryMiddlewares: MiddlewareClass[]
  mutationMiddlewares: MiddlewareClass[]
  subscriptionMiddlewares: MiddlewareClass[]

  resolvers: Function[]
  entities?: Function[]
  types?: GraphQLNamedType[]

  _bootPromise: Promise<void> | null = null

  constructor(options: GraphityOptions = {}) {
    this.container = options.container ?? new Container()
    this.schemaStorage = options.schema?.storage ?? SchemaMetadataStorage.getGlobalStorage()

    this.rootMiddlewares = options.rootMiddlewares ?? []
    this.queryMiddlewares = options.queryMiddlewares ?? []
    this.mutationMiddlewares = options.mutationMiddlewares ?? []
    this.subscriptionMiddlewares = options.subscriptionMiddlewares ?? []

    this.resolvers = findResolvers(this.schemaStorage, options.resolvers ?? [])
    this.entities = options.entities
    this.types = options.types

    this.container.instance(Graphity, this)
  }

  register(provider: Provider): this {
    this.container.register(provider)
    return this
  }

  boot(): Promise<void> {
    if (!this._bootPromise) {
      this._bootPromise = Promise.resolve().then(() => {

        this.rootMiddlewares.forEach(middleware => this.container.bind(middleware))
        this.queryMiddlewares.forEach(middleware => this.container.bind(middleware))
        this.mutationMiddlewares.forEach(middleware => this.container.bind(middleware))
        this.subscriptionMiddlewares.forEach(middleware => this.container.bind(middleware))

        for (const [resolver, metadataResolver] of this.schemaStorage.resolvers.entries()) {
          this.container.bind(resolver as ConstructType<any>)
          metadataResolver.middlewares.forEach(middleware => this.container.bind(middleware))
        }

        for (const [_, metadataResolves] of this.schemaStorage.queries.entries()) {
          metadataResolves.forEach(resolve => resolve.middlewares.forEach(middleware => this.container.bind(middleware)))
        }
        for (const [_, metadataResolves] of this.schemaStorage.mutations.entries()) {
          metadataResolves.forEach(resolve => resolve.middlewares.forEach(middleware => this.container.bind(middleware)))
        }
        for (const [_, metadataResolves] of this.schemaStorage.subscriptions.entries()) {
          metadataResolves.forEach(resolve => resolve.middlewares.forEach(middleware => this.container.bind(middleware)))
        }

        for (const [_, metadataFields] of this.schemaStorage.fields.entries()) {
          metadataFields.forEach(resolve => resolve.middlewares.forEach(middleware => this.container.bind(middleware)))
        }

        return this.container.boot()
      })
    }

    return this._bootPromise
  }

  createSchema(): GraphQLSchema {
    const schema = createGraphQLSchema({
      storage: this.schemaStorage,
      resolvers: this.resolvers,
      entities: this.entities,
      types: this.types,
      rootMiddlewares: this.rootMiddlewares,
      queryMiddlewares: this.queryMiddlewares,
      mutationMiddlewares: this.mutationMiddlewares,
      subscriptionMiddlewares: this.subscriptionMiddlewares,
    })

    for (const [entity, fieldResolves] of this.schemaStorage.getGraphQLFieldResolves().entries()) {
      for (const { name, middlewares, resolver, resolve, subscribe } of fieldResolves) {
        const entityField = entity.getFields()[name]
        if (middlewares.length > 0 || resolve) {
          const resolveFn = resolver && resolve
            ? resolve.bind(this.container.get(resolver as any))
            : resolve || ((parent: any) => parent[name])

          entityField.resolve = createFieldResolver(middlewares.map(middleware => this.container.get(middleware)), resolveFn)
        }
        if (subscribe) {
          entityField.subscribe = createFieldResolver(middlewares.map(middleware => this.container.get(middleware)), subscribe)
        }
      }
    }

    return schema
  }
}
