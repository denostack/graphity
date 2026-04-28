import {
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLObjectType,
  isInterfaceType,
  isObjectType,
  isUnionType,
} from 'graphql'

export interface InputifyOptions {
  prefix?: string
  disableRecursive?: boolean
  except?: string[]
}

export function inputify(type: GraphQLObjectType, options: InputifyOptions = {}): GraphQLInputObjectType {
  return new GraphQLInputObjectType({
    name: `${options.prefix ?? 'Input'}${type.name}`,
    fields: Object.entries(type.getFields()).reduce<GraphQLInputFieldConfigMap>((carry, [key, field]) => {
      if (isInterfaceType(field.type) || isUnionType(field.type)) {
        return carry // ignore interface & union
      }
      if ((options.except ?? []).includes(key)) {
        return carry
      }
      if (isObjectType(field.type) && options && options.disableRecursive) {
        return carry
      }
      carry[key] = {
        type: isObjectType(field.type) ? inputify(field.type, options) : field.type,
      }
      return carry
    }, {}),
  })
}
