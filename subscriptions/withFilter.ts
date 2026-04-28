
export function withFilter<T>(
  asyncIterator: AsyncIterable<T> | Promise<AsyncIterable<T>>,
  filterFn: (payload: T) => boolean | Promise<boolean>
): AsyncIterable<T> | Promise<AsyncIterable<T>> {
  if (asyncIterator instanceof Promise) {
    return asyncIterator.then(iter => withFilter(iter, filterFn))
  }

  return {
    [Symbol.asyncIterator]() {
      const iterator = asyncIterator[Symbol.asyncIterator]()
      const getNextPromise = (): Promise<IteratorResult<T>> => {
        return iterator
          .next()
          .then(payload => {
            if (payload.done === true) {
              return payload
            }

            return Promise.resolve(filterFn(payload.value))
              .catch(() => false)
              .then(filterResult => {
                if (filterResult === true) {
                  return payload
                }

                // Skip the current value and wait for the next one
                return getNextPromise()
              })
          })
      }
      return {
        next: () => getNextPromise(),
        ...iterator.return ? { return: iterator.return.bind(iterator) } : {},
        ...iterator.throw ? { throw: iterator.throw.bind(iterator) } : {},
      }
    },
  }
}
