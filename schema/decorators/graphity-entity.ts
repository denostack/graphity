import { GraphQLInterfaceType } from 'graphql'

import { MetadataStorable } from '../interfaces/metadata'
import { MetadataStorage } from '../metadata/MetadataStorage'


export interface GraphityEntityParams {
  name?: string
  description?: string
  implements?: GraphQLInterfaceType | GraphQLInterfaceType[]
  storage?: MetadataStorable
}

export function GraphityEntity(params: GraphityEntityParams = {}): ClassDecorator {
  const storage = params.storage ?? MetadataStorage.getGlobalStorage()
  const implement = params.implements ?? []
  const metaEntities = storage.entities

  return (target) => {
    metaEntities.set(target, {
      target,
      name: params.name ?? target.name,
      interfaces: Array.isArray(implement) ? implement : [implement],
      description: params.description,
    })
  }
}
