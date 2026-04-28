import { ConstructType, Name } from './common'

export interface Containable extends ProviderDescriptor {
  create<T>(ctor: ConstructType<T>): Promise<T>
  invoke<TIns, TRet = any>(instance: TIns, method: keyof TIns): Promise<TRet>
  resolve<T>(name: Name<T>): Promise<T>
  get<T>(name: Name<T>): T
  has<T>(name: Name<T>): boolean
  has<T>(name: Name<T>): boolean
  delete(...names: Name<any>[]): void

  register(provider: Provider): void
  boot(forced?: boolean): Promise<void>
}

export interface ProviderDescriptor {
  instance<T>(name: Name<T>, instance: T | Promise<T>): void
  resolver<T>(name: Name<T>, resolver: () => T | Promise<T>): void
  bind<T>(constructor: ConstructType<T>): void
  bind<T>(name: Name<T>, constructor: ConstructType<T>): void
  resolve<T>(name: Name<T>): Promise<T>
}

export interface Provider {
  register(app: ProviderDescriptor): any
  boot?(app: ProviderDescriptor): any
  close?(app: ProviderDescriptor): any
}
