import { GraphQLResolveInfo } from 'graphql'

export interface MiddlewareCarry<TSource = any, TContext = any, TArgs = Record<string, any>> {
  parent: TSource
  args: TArgs
  context: TContext
  info: GraphQLResolveInfo
}

export type MiddlewareNext<TSource = any, TContext = any, TArgs = Record<string, any>> = (nextCarry?: Partial<MiddlewareCarry<TSource, TContext, TArgs>>) => any

export interface Middleware<TSource = any, TContext = any, TArgs = Record<string, any>> {
  handle(carry: MiddlewareCarry<TSource, TContext, TArgs>, next: MiddlewareNext<TSource, TContext, TArgs>): any
}

export type MiddlewareClass<TSource = any, TContext = any, TArgs = Record<string, any>> = new (...args: any[]) => Middleware<TSource, TContext, TArgs>
