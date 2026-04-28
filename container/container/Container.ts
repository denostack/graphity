import { UndefinedError } from '../errors/UndefinedError'
import { ConstructType, Name } from '../interfaces/common'
import { Containable, Provider } from '../interfaces/container'
import { metadata } from '../metadata/metadata'
import { nameToString } from '../utils/nameToString'

type ContainerType = 'resolver' | 'bind' | 'instance' | 'promise'

export class Container implements Containable {

  static _instance: Containable | null = null

  static get instance(): Containable {
    if (!Container._instance) {
      Container._instance = new Container()
    }
    return Container._instance
  }

  types: Map<any, ContainerType>
  instances: Map<any, any>
  promises: Map<any, Promise<any>>
  resolvers: Map<any, () => any>
  binds: Map<any, ConstructType<any>>

  locks: Map<any, Promise<any>>
  freezes: Map<any, true>

  providers: Provider[]

  booted: Promise<any> | undefined

  constructor() {
    this.types = new Map<any, ContainerType>()
    this.instances = new Map<any, any>()
    this.promises = new Map<any, Promise<any>>()
    this.resolvers = new Map<any, () => any>()
    this.binds = new Map<any, ConstructType<any>>()

    this.locks = new Map<any, Promise<any>>()
    this.freezes = new Map<any, true>()

    this.providers = []

    // predefined
    this.instance(Container, this)
    this.instance('container', this)
  }

  setToGlobal() {
    return (Container._instance = this)
  }

  instance<T>(name: Name<T>, value: T | Promise<T>): void {
    this.delete(name)
    if (value instanceof Promise) {
      this.types.set(name, 'promise')
      this.promises.set(name, value)
    } else {
      this.types.set(name, 'instance')
      this.instances.set(name, value)
    }
  }

  resolver<T>(name: Name<T>, resolver: () => T | Promise<T>): void {
    this.delete(name)
    this.types.set(name, 'resolver')
    this.resolvers.set(name, resolver)
  }

  bind<T>(constructor: ConstructType<T>): void
  bind<T>(name: Name<T>, constructor: ConstructType<T>): void
  bind<T>(name: ConstructType<T> | Name<T>, constructor?: ConstructType<T>): void {
    this.delete(name)
    this.types.set(name, 'bind')
    this.binds.set(name, constructor ?? name as ConstructType<T>)
  }

  async create<T>(ctor: ConstructType<T>): Promise<T> {
    const params = [] as any[]
    const metaParams = (metadata.injectParams.get(ctor) || []).filter(({ property }) => !property)
    await Promise.all(metaParams.map(async ({ index, name, resolver }) => {
      const param = await this.resolve(name)
      params[index] = resolver ? await resolver(param) : param
    }))
    const instance = new (ctor as any)(...params)

    const metaProps = metadata.injectProps.get(ctor) || []
    await Promise.all(metaProps.map(async ({ name, resolver, property }) => {
      const prop = await this.resolve(name)
      instance[property] = resolver ? await resolver(prop) : prop
    }))
    return instance
  }

  async invoke<TIns, TRet = any>(instance: TIns, method: keyof TIns): Promise<TRet> {
    const params = []
    const metaInjects = (metadata.injectParams.get((instance as any).constructor) || []).filter(({ property }) => property === method)
    for (const { index, name, resolver } of metaInjects) {
      const instance = await this.resolve(name)
      params[index] = resolver ? await resolver(instance) : instance
    }
    return (instance as any)[method](...params)
  }

  get<T>(name: Name<T>): T {
    if (this.instances.has(name)) {
      return this.instances.get(name) as T
    }

    const descriptor = this.types.get(name)
    if (!descriptor) {
      throw new UndefinedError(name, [name])
    }
    throw new Error(`${nameToString(name)} is not resolved.`)
  }

  has<T>(name: Name<T>): boolean {
    return this.instances.has(name)
  }

  resolve<T>(name: Name<T>): Promise<T> {
    if (this.instances.has(name)) {
      return Promise.resolve(this.instances.get(name) as T)
    }
    if (this.promises.has(name)) {
      return this.promises.get(name)!.then(instance => (this.instances.set(name, instance), instance))
    }

    const descriptor = this.types.get(name)
    if (!descriptor) {
      throw new UndefinedError(name, [name])
    }
    this.freezes.set(name, true)

    const lock = this.locks.get(name)
    if (lock) {
      return lock.then((instance) => {
        this.locks.delete(name)
        return Promise.resolve(instance)
      })
    }

    const promise = new Promise<T>((resolve, reject) => {
      const resolver = this.resolvers.get(name)
      if (resolver) {
        return resolve(resolver())
      }
      const bind = this.binds.get(name)
      if (bind) {
        return resolve(this.create(bind))
      }
      reject(new UndefinedError(name, [name]))
    }).then((instance) => {
      this.instances.set(name, instance) // caching
      return Promise.resolve(instance)
    }).catch((e) => {
      if (e instanceof UndefinedError) {
        throw new UndefinedError(e.target, [name, ...e.resolveStack])
      } else {
        throw e
      }
    })

    this.locks.set(name, promise)

    return promise
  }

  delete(...names: Name<any>[]): void {
    for (const name of names) {
      if (this.types.has(name)) {
        if (this.freezes.get(name)) {
          throw new Error(`cannot change ${nameToString(name)}`)
        }
        this.types.delete(name)
      }
      this.instances.delete(name)
      this.promises.delete(name)
      this.resolvers.delete(name)
      this.binds.delete(name)
    }
  }

  register(provider: Provider): void {
    if (this.booted) {
      throw new Error('cannot register a provider after booting.')
    }
    this.providers.push(provider)
  }

  boot(forced = false): Promise<void> {
    if (this.booted && !forced) {
      return this.booted
    }
    this.booted = Promise.all(this.providers.map(p => p.register(this)))
      .then(() => Promise.all(this.providers.filter(p => p.boot).map(p => p.boot!(this))))
      .then(() => Promise.all([...this.types.keys()].map((name) => this.resolve(name))))
      .then(() => Promise.resolve())

    return this.booted
  }

  close(): Promise<void> {
    if (this.booted) {
      return this.booted
        .then(() => Promise.all(this.providers.filter(p => p.close).map(p => p.close!(this))))
        .then(() => Promise.resolve())
    }
    return Promise.resolve()
  }
}
