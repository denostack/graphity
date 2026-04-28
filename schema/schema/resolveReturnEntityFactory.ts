import { isType } from 'graphql'

import { GraphQLEntityType, ReturnTypeFactory } from '../interfaces/metadata'
import { toGraphQLObject, ToGraphQLObjectParams } from './toGraphQLObject'


export function resolveReturnEntityFactory(factory: ReturnTypeFactory, type: GraphQLEntityType, params?: ToGraphQLObjectParams) {
  const ctorOrType = factory(type)
  return isType(ctorOrType) ? ctorOrType : toGraphQLObject(ctorOrType, params)
}
