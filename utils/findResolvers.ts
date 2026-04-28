import { MetadataStorable } from '@graphity/schema'
import { sync } from 'fast-glob'

function findFunctionsFromExported(exported: any): Function[] {
  if (typeof exported === 'function') {
    return [exported]
  }
  if (Array.isArray(exported)) {
    return exported.reduce((carry, nextExported) => carry.concat(findFunctionsFromExported(nextExported)), [] as Function[])
  }
  if (typeof exported === 'object') {
    return Object.keys(exported).reduce((carry, key) => carry.concat(findFunctionsFromExported(exported[key])), [] as Function[])
  }
  return []
}

export function findResolvers(storage: MetadataStorable, resolversOrDirectories: (Function | string)[]): Function[] {
  const resolvers = resolversOrDirectories.filter(node => typeof node === 'function') as Function[]
  const directories = resolversOrDirectories.filter(node => typeof node === 'string') as string[]

  const resolversFromDirectories = sync(directories).reduce((carry, file) => {
    const resolvers = findFunctionsFromExported(require(file)).filter(resolver => storage.resolvers.has(resolver)) // eslint-disable-line import/no-dynamic-require,@typescript-eslint/no-require-imports
    return carry.concat(resolvers)
  }, [] as Function[])

  return resolvers.concat(resolversFromDirectories)
}
