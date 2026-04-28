import { isOutputType } from 'graphql'

import { ParentTypeFactory } from '../interfaces/metadata'
import { toGraphQLObject, ToGraphQLObjectParams } from './toGraphQLObject'


export function resolveEntityFactory(factory: ParentTypeFactory, params?: ToGraphQLObjectParams) {
  const ctorOrType = factory(null)
  return isOutputType(ctorOrType) ? ctorOrType : toGraphQLObject(ctorOrType, params)
}
