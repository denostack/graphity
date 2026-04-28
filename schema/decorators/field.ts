import { GraphQLFieldResolver, GraphQLOutputType, isOutputType } from 'graphql'

import { FieldTypeFactory, MetadataStorable } from '../interfaces/metadata'
import { MiddlewareClass } from '../interfaces/middleware'
import { MetadataStorage } from '../metadata/MetadataStorage'


export interface FieldParams {
  name?: string
  resolve?: GraphQLFieldResolver<any, any>
  middlewares?: MiddlewareClass | MiddlewareClass[]
  description?: string
  deprecated?: string
  storage?: MetadataStorable
}

export function Field(type: FieldTypeFactory | GraphQLOutputType, params: FieldParams = {}): PropertyDecorator {
  const storage = params.storage ?? MetadataStorage.getGlobalStorage()
  const metaFields = storage.fields

  return (target, property) => {
    let fields = metaFields.get(target.constructor)
    if (!fields) {
      fields = []
      metaFields.set(target.constructor, fields)
    }

    const middleware = params.middlewares ?? []
    const middlewares = Array.isArray(middleware) ? middleware : [middleware]

    fields.push({
      target: target.constructor,
      property,
      typeFactory: isOutputType(type) ? () => type : type,
      resolve: params.resolve ?? null,
      middlewares,
      name: params.name ?? (typeof property === 'string' ? property : property.toString()),
      description: params.description ?? null,
      deprecated: params.deprecated ?? null,
    })
  }
}
