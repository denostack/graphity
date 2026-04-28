import { GraphQLFieldConfigMap, GraphQLObjectType, isOutputType } from 'graphql'

import { MetadataStorable } from '../interfaces/metadata'
import { MetadataStorage } from '../metadata/MetadataStorage'


export interface ToGraphQLObjectParams {
  storage?: MetadataStorable
}

export function toGraphQLObject(entity: Function, params: ToGraphQLObjectParams = {}): GraphQLObjectType {
  const storage = params.storage ?? MetadataStorage.getGlobalStorage()
  const metaEntity = storage.entities.get(entity)

  return storage.getOrCreateGraphQLEntity(entity, () => {
    const gqlObject = new GraphQLObjectType({
      name: metaEntity?.name ?? entity.name,
      description: metaEntity?.description,
      interfaces: metaEntity?.interfaces,
      fields: () => {
        const metaFields = storage.fields.get(entity) ?? []
        return metaFields.reduce<GraphQLFieldConfigMap<any, any>>((carry, metaField) => {
          const type = metaField.typeFactory(null)
          return Object.assign<GraphQLFieldConfigMap<any, any>, GraphQLFieldConfigMap<any, any>>(carry, {
            [metaField.name]: {
              type: isOutputType(type) ? type : toGraphQLObject(type, params),
              description: metaField.description ?? null,
              deprecationReason: metaField.deprecated ?? null,
            },
          })
        }, {})
      },
    })

    storage.saveGraphQLFieldResolves(gqlObject, (storage.fields.get(entity) ?? []).map(metaField => ({
      name: metaField.name,
      middlewares: metaField.middlewares,
      resolve: metaField.resolve,
    })))

    return gqlObject
  })
}
