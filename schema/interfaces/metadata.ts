import { GraphQLFieldResolver, GraphQLOutputType, GraphQLFieldConfigArgumentMap, GraphQLObjectType, GraphQLInterfaceType, GraphQLUnionType, GraphQLScalarType, GraphQLEnumType } from 'graphql'

import { MiddlewareClass } from './middleware'

export type GraphQLEntityType = GraphQLScalarType | GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType | GraphQLEnumType

export type FieldTypeFactory = (type: null) => (GraphQLOutputType | Function)
export type ParentTypeFactory = (type: null) => (GraphQLEntityType | Function)
export type ReturnTypeFactory = (type: GraphQLEntityType) => (GraphQLOutputType | Function)

export interface MetadataStorable {
  resolvers: Map<Function, MetadataResolver>
  queries: Map<Function, MetadataResolve[]>
  mutations: Map<Function, MetadataResolve[]>
  subscriptions: Map<Function, MetadataSubscriptionResolve[]>

  entities: Map<Function, MetadataEntity>
  fields: Map<Function, MetadataField[]>

  getOrCreateGraphQLEntity(entity: Function, creator: () => GraphQLObjectType): GraphQLObjectType

  saveGraphQLFieldResolve(entity: GraphQLObjectType, resolve: MetadataFieldResolve): void
  saveGraphQLFieldResolves(entity: GraphQLObjectType, resolves: MetadataFieldResolve[]): void

  getGraphQLFieldResolves(): Map<GraphQLObjectType, MetadataFieldResolve[]>
  findGraphQLFieldResolves(entity: GraphQLObjectType): MetadataFieldResolve[]
}

export interface MetadataFieldResolve {
  name: string
  middlewares: MiddlewareClass[]
  resolver?: Function
  subscribe?: GraphQLFieldResolver<any, any>
  resolve?: GraphQLFieldResolver<any, any> | null
}

export interface MetadataResolver {
  target: Function
  typeFactory: ParentTypeFactory
  middlewares: MiddlewareClass[]
}

export interface MetadataResolve {
  target: Function
  property: PropertyKey
  parent: ParentTypeFactory | null
  name: string
  input: GraphQLFieldConfigArgumentMap | null
  middlewares: MiddlewareClass[]
  returns: ReturnTypeFactory
  description: string | null
  deprecated: string | null
}

export interface MetadataSubscriptionResolve extends MetadataResolve {
  subscribe: GraphQLFieldResolver<any, any>
}

export interface MetadataEntity {
  target: Function
  name: string
  interfaces: GraphQLInterfaceType[]
  description?: string
}

export interface MetadataField {
  target: Function
  property: PropertyKey
  typeFactory: FieldTypeFactory
  middlewares: MiddlewareClass[]
  name: string
  description: string | null
  deprecated: string | null
  resolve: GraphQLFieldResolver<any, any> | null
}
