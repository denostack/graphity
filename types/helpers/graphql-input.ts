import { GraphQLInputFieldConfigMap, GraphQLInputObjectType, GraphQLInputType, isInputType } from 'graphql'

export interface GraphQLInputFieldMap {
  [name: string]: GraphQLInputFieldMap | GraphQLInputType
}

export interface GraphQLInputOptions {
  name: string
  description?: string | null
  fields: GraphQLInputFieldMap
}

export function GraphQLInput(options: GraphQLInputOptions): GraphQLInputObjectType {
  return new GraphQLInputObjectType({
    name: options.name,
    description: options.description,
    fields: Object.entries(options.fields).reduce<GraphQLInputFieldConfigMap>((carry, [key, field]) => {
      if (isInputType(field)) {
        carry[key] = { type: field }
        return carry // ignore interface & union
      }
      carry[key] = {
        type: GraphQLInput({
          name: `${options.name}${key[0].toUpperCase()}${key.slice(1)}`,
          fields: field,
        }),
      }
      return carry
    }, {}),
  })
}
