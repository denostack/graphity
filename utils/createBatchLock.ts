
export type BatchLockFinish = () => Promise<void>
export type BatchLockStart = () => BatchLockFinish

interface Deferred {
  count: number
  promise: Promise<void>
  resolve: (value: void) => void
}

function createDeferred(): Deferred {
  const deferred = { count: 0 } as Deferred
  deferred.promise = new Promise((resolve) => {
    deferred.resolve = resolve
  })

  return deferred
}

function createDone(lock: Deferred): BatchLockFinish {
  return () => {
    lock.count--
    if (lock.count <= 0) {
      lock.resolve()
    }
    return lock.promise
  }
}

export function createBatchLock(): BatchLockStart {
  let lock = createDeferred()
  let timeout = null as any | null

  return () => {
    lock.count++
    if (!timeout) {
      timeout = setTimeout(() => {
        lock = createDeferred()
        timeout = null
      }, 0)
    }
    return createDone(lock)
  }
}
