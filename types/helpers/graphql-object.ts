import { GraphQLFieldConfigMap, GraphQLObjectType, GraphQLOutputType, isOutputType } from 'graphql'

export interface CreateGraphQLObjectFieldMap {
  [name: string]: CreateGraphQLObjectFieldMap | GraphQLOutputType
}

export interface CreateGraphQLObjectOptions {
  name: string
  description?: string | null
  fields: CreateGraphQLObjectFieldMap
}

export function GraphQLObject(options: CreateGraphQLObjectOptions): GraphQLObjectType {
  return new GraphQLObjectType({
    name: options.name,
    description: options.description,
    fields: Object.entries(options.fields).reduce<GraphQLFieldConfigMap<any, any>>((carry, [key, field]) => {
      if (isOutputType(field)) {
        carry[key] = { type: field }
        return carry // ignore interface & union
      }
      carry[key] = {
        type: GraphQLObject({
          name: `${options.name}${key[0].toUpperCase()}${key.slice(1)}`,
          fields: field,
        }),
      }
      return carry
    }, {}),
  })
}
