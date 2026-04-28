import { GraphQLInt, GraphQLList, GraphQLNamedType, GraphQLNonNull, GraphQLObjectType } from 'graphql'

export function GraphQLListOf(type: GraphQLNamedType, name?: string) {
  return new GraphQLObjectType({
    name: name ? name : `ListOf${type.name}`,
    fields: {
      count: { type: GraphQLNonNull(GraphQLInt) },
      nodes: { type: GraphQLNonNull(GraphQLList(GraphQLNonNull(type))) },
    },
  })
}
