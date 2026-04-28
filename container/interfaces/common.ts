
export type ConstructType<T> = new (...args: any[]) => T

export type Name<T> = ConstructType<T> | string | symbol
