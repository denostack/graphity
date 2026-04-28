import {
  GraphQLEnumType,
  GraphQLFieldResolver,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLUnionType,
} from "graphql";

import type { MiddlewareClass } from "../middleware.ts";

export type GraphQLEntityType =
  | GraphQLScalarType
  | GraphQLObjectType
  | GraphQLInterfaceType
  | GraphQLUnionType
  | GraphQLEnumType;

export type EntityTypeFactory = () => GraphQLOutputType | Function;
export type FieldTypeFactory = (type: null) => GraphQLOutputType | Function;
export type ParentTypeFactory = (type: null) => GraphQLEntityType | Function;
export type ResolverTypeFactory = () => GraphQLEntityType;
export type ReturnTypeFactory = (type: GraphQLEntityType) => GraphQLOutputType | Function;

export interface ObjectTypeMetadata {
  target: Function;
  name: string;
  description?: string;
}

export interface ResolverMetadata {
  typeFactory: ResolverTypeFactory | null;
  middlewares: MiddlewareClass[];
}

export interface FieldMetadata {
  property: PropertyKey;
  typeFactory: FieldTypeFactory;
  middlewares: MiddlewareClass[];
  name: string;
  nullable: boolean;
  description: string | null;
  deprecationReason: string | null;
  resolve: GraphQLFieldResolver<any, any> | null;
}

export interface ResolveMetadata {
  property: PropertyKey;
  typeFactory: EntityTypeFactory;
  parent: ParentTypeFactory | null;
  name: string;
  middlewares: MiddlewareClass[];
  nullable: boolean;
  description: string | null;
  deprecationReason: string | null;
}

export interface SubscriptionResolveMetadata extends ResolveMetadata {
  subscribe: GraphQLFieldResolver<any, any>;
}

export interface MetadataFieldResolve {
  name: string;
  middlewares: MiddlewareClass[];
  resolver?: Function;
  subscribe?: GraphQLFieldResolver<any, any>;
  resolve?: GraphQLFieldResolver<any, any> | null;
}
