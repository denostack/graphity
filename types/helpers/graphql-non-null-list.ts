import { GraphQLList, GraphQLNonNull, GraphQLNullableType } from 'graphql'

export function GraphQLNonNullList(type: GraphQLNullableType) {
  return GraphQLNonNull(GraphQLList(GraphQLNonNull(type)))
}
