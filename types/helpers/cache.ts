
const storage = new Map<(input: any) => any, Map<any, any>>()

export function cache<TInput, TOutput>(handler: (input: TInput) => TOutput) {
  return (input: TInput): TOutput => {
    let typeStorage = storage.get(handler)
    if (!typeStorage) {
      typeStorage = new Map<any, any>()
      storage.set(handler, typeStorage)
    }
    let type = typeStorage.get(input)
    if (!type) {
      type = handler(input)
      typeStorage.set(input, type)
    }
    return type
  }
}
