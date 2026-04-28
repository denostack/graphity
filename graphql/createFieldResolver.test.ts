import { createFieldResolver } from './createFieldResolver'

function createBatchDetector() {
  let timeout = null as any | null
  let batchIds = [] as number[]
  let promise = Promise.resolve()
  const history = [] as number[][]
  return {
    history() {
      return promise.then(() => history)
    },
    hit(id: number) {
      batchIds.push(id)
      if (!timeout) {
        const nextPromise = new Promise<void>((resolve) => {
          timeout = setTimeout(() => {
            history.push(batchIds)
            batchIds = []
            timeout = null
            resolve()
          }, 0)
          promise = promise.then(() => nextPromise)
        })
      }
    },
  }
}

describe('graphity, graphql/createFieldResolver', () => {
  it('test createFieldResolver without middlewares', async () => {
    const batch = createBatchDetector()

    const resolve = createFieldResolver([], (parent, args, context: any) => {
      context.batch.hit(context.i)
      return `Resolve ${context.i}`
    })

    const results = await Promise.all([...new Array(10).keys()].map(i => resolve(null, {}, { batch, i }, {} as any)))
    expect(results).toEqual([
      'Resolve 0',
      'Resolve 1',
      'Resolve 2',
      'Resolve 3',
      'Resolve 4',
      'Resolve 5',
      'Resolve 6',
      'Resolve 7',
      'Resolve 8',
      'Resolve 9',
    ])

    const history = await batch.history()

    expect(history).toHaveLength(1)
    expect(history[0].sort()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('test createFieldResolver with sync middlewares', async () => {
    const batch = createBatchDetector()

    const resolve = createFieldResolver([
      { handle: (carry, next) => next() },
      { handle: (carry, next) => next() },
    ], (parent, args, context: any) => {
      context.batch.hit(context.i)
      return `Resolve ${context.i}`
    })

    const results = await Promise.all([...new Array(10).keys()].map(i => resolve(null, {}, { batch, i }, {} as any)))
    expect(results).toEqual([
      'Resolve 0',
      'Resolve 1',
      'Resolve 2',
      'Resolve 3',
      'Resolve 4',
      'Resolve 5',
      'Resolve 6',
      'Resolve 7',
      'Resolve 8',
      'Resolve 9',
    ])

    const history = await batch.history()

    expect(history).toHaveLength(1)
    expect(history[0].sort()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('test createFieldResolver with async middlewares', async () => {
    const batch = createBatchDetector()

    const resolve = createFieldResolver([
      { handle: (carry, next) => new Promise(resolve => setTimeout(resolve, Math.random() * 500)).then(() => next()) },
      { handle: (carry, next) => new Promise(resolve => setTimeout(resolve, Math.random() * 500)).then(() => next()) },
    ], (parent, args, context: any) => {
      context.batch.hit(context.i)
      return `Resolve ${context.i}`
    })

    const results = await Promise.all([...new Array(10).keys()].map(i => resolve(null, {}, { batch, i }, {} as any)))
    expect(results).toEqual([
      'Resolve 0',
      'Resolve 1',
      'Resolve 2',
      'Resolve 3',
      'Resolve 4',
      'Resolve 5',
      'Resolve 6',
      'Resolve 7',
      'Resolve 8',
      'Resolve 9',
    ])

    const history = await batch.history()

    expect(history).toHaveLength(1)
    expect(history[0].sort()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('test createFieldResolver with blocked middlewares', async () => {
    const batch = createBatchDetector()

    const resolve = createFieldResolver([
      { handle: (carry, next) => new Promise(resolve => setTimeout(resolve, Math.random() * 500)).then(() => next()) },
      { handle: (carry, next) => (carry.context as any).i % 2 === 0 ? next() : `Middleware ${(carry.context as any).i}` },
      { handle: (carry, next) => new Promise(resolve => setTimeout(resolve, Math.random() * 500)).then(() => next()) },
    ], (parent, args, context: any) => {
      context.batch.hit(context.i)
      return `Resolve ${context.i}`
    })

    const results = await Promise.all([...new Array(10).keys()].map(i => resolve(null, {}, { batch, i }, {} as any)))
    expect(results).toEqual([
      'Resolve 0',
      'Middleware 1',
      'Resolve 2',
      'Middleware 3',
      'Resolve 4',
      'Middleware 5',
      'Resolve 6',
      'Middleware 7',
      'Resolve 8',
      'Middleware 9',
    ])

    const history = await batch.history()

    expect(history).toHaveLength(1)
    expect(history[0].sort()).toEqual([0, 2, 4, 6, 8])
  })
})
