import { createBatchLock } from './createBatchLock'

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

describe('graphity, utils/createBatchLock', () => {
  it('test createBatchLock', async () => {
    const batch = createBatchDetector()
    const batchLockStart = createBatchLock()

    const handler = async (id: number) => {
      const batchLockFinish = batchLockStart()
      batch.hit(id)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500))

      batch.hit(id)

      await new Promise(resolve => setTimeout(resolve, Math.random() * 500))

      await batchLockFinish()
      batch.hit(id)
    }

    await Promise.all([...new Array(10).keys()].map(i => handler(i)))

    const history = await batch.history()

    // first history
    expect(history[0]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

    // random
    expect(history.slice(1, -1).length).toBeGreaterThan(1)
    expect(history.slice(1, -1).reduce((a, b) => a.concat(b)).sort()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

    // last
    expect(history[history.length - 1].sort()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })
})
